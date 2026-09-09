import { Role } from "@prisma/client";
import type { AuthContext } from "@/lib/auth";
import type { CreateProgramInput, UpdateProgramInput } from "@/lib/validation/program";

export class ProgramNotFoundError extends Error {}
export class ProgramForbiddenError extends Error {}

/**
 * Un Collaborateur ne voit que les programmes auxquels il a un accès explicite
 * (ProgramAccess). Un Promoteur ou un Admin voit tous les programmes de son
 * organisation. Le filtre organisation lui-même est déjà garanti par le
 * client Prisma scopé (lib/db/scoped-client.ts) — ce service ajoute
 * uniquement la restriction par utilisateur pour les Collaborateurs.
 */
export class ProgramService {
  static async list(authContext: AuthContext) {
    const { db, userId, role } = authContext;
    return db.program.findMany({
      where: role === Role.COLLABORATEUR ? { access: { some: { userId } } } : {},
      orderBy: { updatedAt: "desc" },
    });
  }

  static async get(authContext: AuthContext, programId: string) {
    const { db, userId, role } = authContext;
    const program = await db.program.findUnique({
      where: { id: programId },
      include: { lots: true },
    });

    if (!program) {
      throw new ProgramNotFoundError(programId);
    }

    if (role === Role.COLLABORATEUR) {
      const hasAccess = await db.programAccess.findUnique({
        where: { programId_userId: { programId, userId } },
      });
      if (!hasAccess) {
        throw new ProgramForbiddenError(programId);
      }
    }

    return program;
  }

  static async create(authContext: AuthContext, input: CreateProgramInput) {
    // organizationId est aussi ré-injecté par le client scopé (lib/db/scoped-client.ts) ;
    // on le passe ici pour satisfaire le typage Prisma du champ requis.
    return authContext.db.program.create({ data: { ...input, organizationId: authContext.organizationId } });
  }

  static async update(authContext: AuthContext, programId: string, input: UpdateProgramInput) {
    // Vérifie l'existence + l'accès avant d'écrire (réutilise la logique de `get`).
    await ProgramService.get(authContext, programId);
    return authContext.db.program.update({ where: { id: programId }, data: input });
  }

  static async remove(authContext: AuthContext, programId: string) {
    await ProgramService.get(authContext, programId);
    return authContext.db.program.delete({ where: { id: programId } });
  }
}
