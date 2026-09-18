import type { AuthContext } from "@/lib/auth";
import { ProgramService } from "./ProgramService";
import { LotNotFoundError } from "./LotService";

export class LotPhotoNotFoundError extends Error {}
export class TooManyPhotosError extends Error {}
export class PhotoTooLargeError extends Error {}
export class InvalidPhotoTypeError extends Error {}

const MAX_PHOTOS_PER_LOT = 12;
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function getOwnedLot(authContext: AuthContext, lotId: string) {
  const lot = await authContext.db.lot.findUnique({ where: { id: lotId } });
  if (!lot) {
    throw new LotNotFoundError(lotId);
  }
  await ProgramService.get(authContext, lot.programId);
  return lot;
}

export class LotPhotoService {
  static async list(authContext: AuthContext, lotId: string) {
    await getOwnedLot(authContext, lotId);
    return authContext.db.lotPhoto.findMany({
      where: { lotId },
      select: { id: true, mimeType: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  }

  static async create(authContext: AuthContext, lotId: string, data: ArrayBuffer, mimeType: string) {
    await getOwnedLot(authContext, lotId);

    if (!ALLOWED_PHOTO_MIME_TYPES.includes(mimeType)) {
      throw new InvalidPhotoTypeError(mimeType);
    }
    if (data.byteLength > MAX_PHOTO_SIZE_BYTES) {
      throw new PhotoTooLargeError(lotId);
    }

    // Verrou pessimiste sur la ligne du lot : un simple count() puis create() séparés (comme avant
    // ce fix) laisse une fenêtre où plusieurs uploads concurrents sur le même lot lisent tous
    // count() < 12 avant qu'aucun n'ait inséré — reproduit en conditions réelles (13 photos créées
    // pour 15 envois simultanés sur un lot vide). SELECT ... FOR UPDATE sérialise les transactions
    // concurrentes pour CE lot précis (les uploads sur d'autres lots ne sont pas affectés, verrou
    // par ligne et non par table) — même principe que le updateMany conditionnel de
    // UsageService.assertQuotaAndReserve pour le quota IA, adapté ici à une limite sur un count()
    // de lignes filles plutôt que sur un compteur dédié.
    return authContext.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Lot" WHERE id = ${lotId} FOR UPDATE`;

      const count = await tx.lotPhoto.count({ where: { lotId } });
      if (count >= MAX_PHOTOS_PER_LOT) {
        throw new TooManyPhotosError(lotId);
      }

      return tx.lotPhoto.create({
        data: { lotId, data: new Uint8Array(data), mimeType },
        select: { id: true, mimeType: true, createdAt: true },
      });
    });
  }

  static async getBytes(authContext: AuthContext, photoId: string) {
    const photo = await authContext.db.lotPhoto.findUnique({ where: { id: photoId }, include: { lot: true } });
    if (!photo) {
      throw new LotPhotoNotFoundError(photoId);
    }
    // Contrairement à list/create/listWithBytes, cette méthode ne passait pas par getOwnedLot :
    // LotPhoto est bien scopé par organisation (scoped-client.ts), mais rien ne vérifiait qu'un
    // Collaborateur a un accès explicite à CE programme — n'importe quel membre de l'organisation
    // pouvait voir la photo d'un lot d'un programme auquel il n'a pourtant pas accès.
    await ProgramService.get(authContext, photo.lot.programId);
    return photo;
  }

  static async remove(authContext: AuthContext, photoId: string) {
    const photo = await authContext.db.lotPhoto.findUnique({ where: { id: photoId }, include: { lot: true } });
    if (!photo) {
      throw new LotPhotoNotFoundError(photoId);
    }
    await ProgramService.get(authContext, photo.lot.programId);
    return authContext.db.lotPhoto.delete({ where: { id: photoId } });
  }

  /** Toutes les photos d'un lot, avec leurs octets — pour l'analyse vision. */
  static async listWithBytes(authContext: AuthContext, lotId: string) {
    await getOwnedLot(authContext, lotId);
    return authContext.db.lotPhoto.findMany({ where: { lotId } });
  }
}
