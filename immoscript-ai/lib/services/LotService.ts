import type { AuthContext } from "@/lib/auth";
import { ProgramService } from "./ProgramService";
import type { CreateLotInput, UpdateLotInput } from "@/lib/validation/lot";

export class LotNotFoundError extends Error {}

export class LotService {
  static async create(authContext: AuthContext, programId: string, input: CreateLotInput) {
    // Vérifie que le programme existe et que l'utilisateur y a accès avant de créer le lot.
    await ProgramService.get(authContext, programId);
    return authContext.db.lot.create({ data: { ...input, programId } });
  }

  static async update(authContext: AuthContext, lotId: string, input: UpdateLotInput) {
    const lot = await authContext.db.lot.findUnique({ where: { id: lotId } });
    if (!lot) {
      throw new LotNotFoundError(lotId);
    }
    await ProgramService.get(authContext, lot.programId);
    return authContext.db.lot.update({ where: { id: lotId }, data: input });
  }

  static async remove(authContext: AuthContext, lotId: string) {
    const lot = await authContext.db.lot.findUnique({ where: { id: lotId } });
    if (!lot) {
      throw new LotNotFoundError(lotId);
    }
    await ProgramService.get(authContext, lot.programId);
    return authContext.db.lot.delete({ where: { id: lotId } });
  }
}
