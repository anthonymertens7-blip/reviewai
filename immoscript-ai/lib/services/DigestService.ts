// Exception délibérée à la règle "jamais lib/prisma.ts en dehors de authContext.db" :
// ce job cron parcourt TOUTES les organisations (comme le bootstrap de getAuthContext),
// donc un client scopé à une seule organisation ne conviendrait pas ici.
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { UsageService } from "./UsageService";

export interface DigestRecipient {
  email: string;
  name: string | null;
  newContentsCount: number;
  recentProgramNames: string[];
}

export interface OrganizationDigest {
  organizationId: string;
  organizationName: string;
  usage: { used: number; quota: number | null; periodEnd: Date };
  recipients: DigestRecipient[];
}

const DAYS = 7;
const MAX_PROGRAM_NAMES = 5;

/**
 * Résumé hebdomadaire d'usage par organisation, pour le digest email. Ne
 * couvre volontairement que des données déjà stockées (pas d'appel IA) :
 * ce n'est pas un contenu publié, juste un récapitulatif d'activité.
 */
export class DigestService {
  static async buildAllOrganizationDigests(): Promise<OrganizationDigest[]> {
    const organizations = await prisma.organization.findMany({
      include: {
        users: {
          select: {
            email: true,
            name: true,
            role: true,
            programAccess: { select: { programId: true } },
          },
        },
      },
    });

    const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

    return Promise.all(
      organizations.map(async (org) => {
        const [usage, recentContents] = await Promise.all([
          UsageService.getUsage(org.id),
          prisma.generatedContent.findMany({
            where: { createdAt: { gte: since }, program: { organizationId: org.id } },
            select: { programId: true, program: { select: { name: true } } },
          }),
        ]);

        // Un Collaborateur ne voit, partout ailleurs dans l'app (ProgramService.list,
        // StatsService, le Dashboard), que les programmes auxquels il a un accès explicite
        // (ProgramAccess). Sans ce filtre par destinataire, le digest envoyait par email à
        // CHAQUE membre de l'organisation le même récapitulatif — nombre de contenus et noms de
        // programmes — portant sur TOUTE l'organisation, y compris des programmes auxquels un
        // Collaborateur n'a pas accès. Contrairement aux fuites déjà corrigées côté web (fermées
        // en rechargeant la page), celle-ci sortait du système par email.
        const recipients: DigestRecipient[] = org.users
          .filter((u): u is typeof u & { email: string } => !!u.email)
          .map((u) => {
            const visibleContents =
              u.role === Role.COLLABORATEUR
                ? recentContents.filter((c) => u.programAccess.some((a) => a.programId === c.programId))
                : recentContents;
            return {
              email: u.email,
              name: u.name,
              newContentsCount: visibleContents.length,
              recentProgramNames: Array.from(new Set(visibleContents.map((c) => c.program.name))).slice(0, MAX_PROGRAM_NAMES),
            };
          });

        return {
          organizationId: org.id,
          organizationName: org.name,
          usage,
          recipients,
        };
      })
    );
  }
}
