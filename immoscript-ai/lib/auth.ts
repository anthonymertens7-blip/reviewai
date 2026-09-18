import { auth as clerkAuth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getScopedPrismaClient, type ScopedPrismaClient } from "@/lib/db/scoped-client";

export class UnauthenticatedError extends Error {}
export class NoActiveOrganizationError extends Error {}

// LOCAL_TEST_MODE : sandbox de test local sans accès réseau à Clerk. Simule une session déjà
// authentifiée à partir de variables d'env, sans jamais appeler l'API Clerk. Ne doit jamais être
// vrai en production — n'existe pas dans .env.example.
const isLocalTestMode = () => process.env.LOCAL_TEST_MODE === "1";

const LOCAL_TEST_USER_ID = process.env.LOCAL_TEST_USER_ID ?? "local_test_user";
const LOCAL_TEST_ORG_ID = process.env.LOCAL_TEST_ORG_ID ?? "local_test_org";
const LOCAL_TEST_ORG_ROLE = process.env.LOCAL_TEST_ORG_ROLE ?? "org:admin";
const LOCAL_TEST_EMAIL = process.env.LOCAL_TEST_EMAIL ?? "test@local.dev";

/**
 * Équivalent local-test-mode de `auth()` de Clerk, utilisé par les layouts qui ont besoin de
 * `orgId` sans passer par getAuthContext (ex: app/(app)/layout.tsx).
 */
export async function getRawAuth() {
  if (isLocalTestMode()) {
    return { userId: LOCAL_TEST_USER_ID, orgId: LOCAL_TEST_ORG_ID, orgRole: LOCAL_TEST_ORG_ROLE };
  }
  return clerkAuth();
}

// Rôles Clerk par défaut ("org:admin", "org:member") + rôle custom "org:promoteur"
// à créer côté dashboard Clerk. Tout rôle inconnu retombe sur le plus restrictif.
function mapClerkOrgRole(clerkRole: string | null | undefined): Role {
  switch (clerkRole) {
    case "org:admin":
      return Role.ADMIN;
    case "org:promoteur":
      return Role.PROMOTEUR;
    default:
      return Role.COLLABORATEUR;
  }
}

export interface AuthContext {
  userId: string;
  organizationId: string;
  role: Role;
  db: ScopedPrismaClient;
}

/**
 * Résout la session Clerk courante, synchronise (JIT) l'Organization et le
 * User correspondants dans notre base, et retourne un client Prisma déjà
 * scopé à l'organisation active. C'est le point d'entrée obligatoire de
 * toute route protégée.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const { userId, orgId, orgRole } = await getRawAuth();

  if (!userId) {
    throw new UnauthenticatedError("Aucune session Clerk active");
  }
  if (!orgId) {
    throw new NoActiveOrganizationError("Aucune organisation active sélectionnée");
  }

  const role = mapClerkOrgRole(orgRole);

  if (isLocalTestMode()) {
    await prisma.organization.upsert({
      where: { id: orgId },
      create: { id: orgId, name: "Organisation de test locale" },
      update: {},
    });
    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, organizationId: orgId, role, email: LOCAL_TEST_EMAIL, name: "Testeur local" },
      update: { organizationId: orgId, role },
    });
    return { userId, organizationId: orgId, role, db: getScopedPrismaClient(orgId) };
  }

  const [user, client] = await Promise.all([currentUser(), clerkClient()]);
  const organization = await client.organizations.getOrganization({ organizationId: orgId });

  await prisma.organization.upsert({
    where: { id: orgId },
    create: { id: orgId, name: organization.name },
    update: { name: organization.name },
  });

  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      organizationId: orgId,
      role,
      email: user?.primaryEmailAddress?.emailAddress ?? "",
      name: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null : null,
    },
    update: {
      organizationId: orgId,
      role,
      email: user?.primaryEmailAddress?.emailAddress ?? undefined,
    },
  });

  return {
    userId,
    organizationId: orgId,
    role,
    db: getScopedPrismaClient(orgId),
  };
}

/**
 * Vrai uniquement pour le compte configuré via OWNER_EMAIL — indépendant du
 * rôle Clerk (un autre membre peut devenir "org:admin" sans obtenir cet accès).
 * Réservé aux vues cross-organisation (ex: /admin/feedback) qui sortent
 * volontairement du scoping tenant habituel.
 */
export async function isOwner(): Promise<boolean> {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) return false;

  if (isLocalTestMode()) {
    return LOCAL_TEST_EMAIL.toLowerCase() === ownerEmail.toLowerCase();
  }

  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress?.toLowerCase() === ownerEmail.toLowerCase();
}
