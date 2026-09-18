import { NextResponse } from "next/server";
import { getAuthContext, NoActiveOrganizationError, UnauthenticatedError, type AuthContext } from "@/lib/auth";
import { Prisma, type Role } from "@prisma/client";

type RouteContext<P> = { params: Promise<P> };

/**
 * Enveloppe un Route Handler : résout l'auth Clerk + le scoping tenant avant
 * d'exécuter le handler, et transforme les erreurs d'auth en réponses HTTP.
 * Passer `minRole` pour exiger au moins ce rôle (ADMIN > PROMOTEUR > COLLABORATEUR).
 */
const ROLE_RANK: Record<Role, number> = {
  COLLABORATEUR: 0,
  PROMOTEUR: 1,
  ADMIN: 2,
};

export function withOrgAuth<P = Record<string, never>>(
  handler: (req: Request, authContext: AuthContext, params: P) => Promise<Response>,
  options: { minRole?: Role } = {}
) {
  return async (req: Request, context: RouteContext<P>) => {
    try {
      const authContext = await getAuthContext();

      if (options.minRole && ROLE_RANK[authContext.role] < ROLE_RANK[options.minRole]) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }

      const params = await context.params;
      return await handler(req, authContext, params);
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
      }
      if (error instanceof NoActiveOrganizationError) {
        return NextResponse.json({ error: "no_active_organization" }, { status: 403 });
      }
      // req.json() lève une SyntaxError (pas une erreur applicative) sur un corps de requête
      // absent ou invalide — sans ce cas, chaque route POST/PATCH de l'app (toutes passent par
      // `const body = await req.json()`) répondait 500 pour ce qui est en réalité une entrée
      // client invalide, au lieu du 400 déjà renvoyé pour tout payload qui échoue la validation Zod.
      if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "invalid_json" }, { status: 400 });
      }
      // Course entre deux requêtes concurrentes sur la même ressource (ex: un DELETE et un PATCH
      // envoyés en même temps depuis deux onglets) : chaque service vérifie déjà l'existence via
      // un findUnique avant d'appeler update()/delete(), mais rien n'empêche la ressource de
      // disparaître dans la fenêtre entre cette vérification et l'écriture elle-même. Prisma lève
      // alors un P2025 ("No record was found for an update/delete") non applicatif — reproduit de
      // façon fiable (8 requêtes sur 10) en envoyant PATCH et DELETE en parallèle sur le même lot.
      // Sans ce cas, la requête qui perd la course répond 500 au lieu du 404 qu'elle aurait reçu si
      // elle était arrivée une fraction de seconde plus tard.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      throw error;
    }
  };
}
