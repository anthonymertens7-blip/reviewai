import { Role } from "@prisma/client";
import type { AuthContext } from "@/lib/auth";
import type { CreateProgramInput, UpdateProgramInput } from "@/lib/validation/program";

export class ProgramNotFoundError extends Error {}
export class ProgramForbiddenError extends Error {}
export class UserNotInOrganizationError extends Error {}

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
      include: {
        lots: { select: { price: true, dpeEnergyClass: true, dpeGesClass: true, condoAnnualCharges: true } },
      },
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

  /** Liste les ids des utilisateurs ayant un accès explicite à ce programme (rôle Collaborateur). */
  static async listAccess(authContext: AuthContext, programId: string) {
    await ProgramService.get(authContext, programId);
    const access = await authContext.db.programAccess.findMany({ where: { programId }, select: { userId: true } });
    return access.map((a) => a.userId);
  }

  /**
   * Donne à un Collaborateur de l'organisation l'accès à ce programme précis. Réservé aux
   * Promoteur/Admin (vérifié au niveau de la route via withOrgAuth minRole) — sans ce mécanisme,
   * ProgramAccess n'était jamais rempli nulle part et le rôle Collaborateur restait inutilisable
   * (aucun programme visible, 403 systématique).
   */
  static async grantAccess(authContext: AuthContext, programId: string, userId: string) {
    await ProgramService.get(authContext, programId);
    // db.user est scopé par organisation (lib/db/scoped-client.ts) : cette recherche échoue déjà
    // si userId appartient à une autre organisation, sans vérification supplémentaire à écrire.
    // Elle échoue aussi si l'utilisateur a été invité mais ne s'est encore jamais connecté (son
    // User n'est synchronisé qu'au premier accès via getAuthContext) — cas normal, pas une erreur
    // serveur.
    const user = await authContext.db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UserNotInOrganizationError(userId);
    }

    await authContext.db.programAccess.upsert({
      where: { programId_userId: { programId, userId } },
      create: { programId, userId },
      update: {},
    });
  }

  static async revokeAccess(authContext: AuthContext, programId: string, userId: string) {
    await ProgramService.get(authContext, programId);
    await authContext.db.programAccess.deleteMany({ where: { programId, userId } });
  }

  /**
   * Duplique un programme et ses lots pour démarrer plus vite un programme
   * similaire. L'adresse, la date de livraison et les mentions légales par
   * lot (DPE, charges de copropriété) ne sont jamais copiées : propres à un
   * site et à un diagnostic précis, elles doivent être ressaisies pour éviter
   * toute erreur de mention obligatoire sur le nouveau programme.
   */
  static async duplicate(authContext: AuthContext, programId: string) {
    const program = await ProgramService.get(authContext, programId);

    return authContext.db.$transaction(async (tx) => {
      const newProgram = await tx.program.create({
        data: {
          organizationId: authContext.organizationId,
          name: `${program.name} (copie)`,
          address: null,
          city: program.city,
          district: program.district,
          description: program.description,
          deliveryDate: null,
          programType: program.programType,
          unitsCount: program.unitsCount,
          environment: program.environment,
          transport: program.transport,
          schools: program.schools,
          shops: program.shops,
          pointsOfInterest: program.pointsOfInterest,
          amenities: program.amenities,
          features: program.features,
          advantages: program.advantages,
          isCoOwnership: program.isCoOwnership,
          condoLotsCount: program.condoLotsCount,
        },
      });

      if (program.lots.length > 0) {
        await tx.lot.createMany({
          data: program.lots.map((lot) => ({
            programId: newProgram.id,
            reference: lot.reference,
            propertyType: lot.propertyType,
            roomsCount: lot.roomsCount,
            livingArea: lot.livingArea,
            outdoorArea: lot.outdoorArea,
            floor: lot.floor,
            orientation: lot.orientation,
            exposure: lot.exposure,
            view: lot.view,
            hasBalcony: lot.hasBalcony,
            hasTerrace: lot.hasTerrace,
            hasGarden: lot.hasGarden,
            hasParking: lot.hasParking,
            hasCellar: lot.hasCellar,
            hasEquippedKitchen: lot.hasEquippedKitchen,
            isFurnished: lot.isFurnished,
            furnishedEquipment: lot.furnishedEquipment,
            // DPE, GES et charges de copropriété sont propres à chaque lot physique (comme
            // address/deliveryDate le sont déjà pour le programme, effacés plus haut) : jamais
            // copiés lors d'une duplication, sous peine d'afficher une fausse mention légale sur un
            // lot qui n'a jamais été diagnostiqué — voir le même principe dans
            // LotsManager.tsx (duplicateValues) pour la duplication d'un lot individuel.
            price: lot.price,
            pricePerSqm: lot.pricePerSqm,
            availability: lot.availability,
            specialFeatures: lot.specialFeatures,
          })),
        });
      }

      return newProgram;
    });
  }
}
