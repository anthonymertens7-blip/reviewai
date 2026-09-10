import { auth as clerkAuth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getScopedPrismaClient, type ScopedPrismaClient } from "@/lib/db/scoped-client";

export class UnauthenticatedError extends Error {}
export class NoActiveOrganizationError extends Error {}

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
  const { userId, orgId, orgRole } = await clerkAuth();

  if (!userId) {
    throw new UnauthenticatedError("Aucune session Clerk active");
  }
  if (!orgId) {
    throw new NoActiveOrganizationError("Aucune organisation active sélectionnée");
  }

  const role = mapClerkOrgRole(orgRole);
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

  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress?.toLowerCase() === ownerEmail.toLowerCase();
}
