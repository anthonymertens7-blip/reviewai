// Exception délibérée à la règle "jamais lib/prisma.ts en dehors de authContext.db" :
// ce job cron parcourt TOUTES les organisations (comme le bootstrap de getAuthContext),
// donc un client scopé à une seule organisation ne conviendrait pas ici.
import { prisma } from "@/lib/prisma";
import { UsageService } from "./UsageService";

export interface OrganizationDigest {
  organizationId: string;
  organizationName: string;
  usage: { used: number; quota: number | null; periodEnd: Date };
  newContentsCount: number;
  recentProgramNames: string[];
  recipients: { email: string; name: string | null }[];
}

const DAYS = 7;

/**
 * Résumé hebdomadaire d'usage par organisation, pour le digest email. Ne
 * couvre volontairement que des données déjà stockées (pas d'appel IA) :
 * ce n'est pas un contenu publié, juste un récapitulatif d'activité.
 */
export class DigestService {
  static async buildAllOrganizationDigests(): Promise<OrganizationDigest[]> {
    const organizations = await prisma.organization.findMany({
      include: { users: { select: { email: true, name: true } } },
    });

    const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

    return Promise.all(
      organizations.map(async (org) => {
        const [usage, recentContents] = await Promise.all([
          UsageService.getUsage(org.id),
          prisma.generatedContent.findMany({
            where: { createdAt: { gte: since }, program: { organizationId: org.id } },
            select: { program: { select: { name: true } } },
          }),
        ]);

        const recentProgramNames = Array.from(new Set(recentContents.map((c) => c.program.name))).slice(0, 5);

        return {
          organizationId: org.id,
          organizationName: org.name,
          usage,
          newContentsCount: recentContents.length,
          recentProgramNames,
          recipients: org.users.filter((u) => u.email).map((u) => ({ email: u.email, name: u.name })),
        };
      })
    );
  }
}
