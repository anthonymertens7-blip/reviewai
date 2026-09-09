import { NextResponse } from "next/server";
import { getAuthContext, NoActiveOrganizationError, UnauthenticatedError, type AuthContext } from "@/lib/auth";
import type { Role } from "@prisma/client";

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
      throw error;
    }
  };
}
