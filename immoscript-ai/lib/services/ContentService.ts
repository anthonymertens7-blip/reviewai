import { Role, type Prisma } from "@prisma/client";
import type { AuthContext } from "@/lib/auth";
import { ProgramService } from "./ProgramService";
import { UsageService } from "./UsageService";
import { AIService } from "@/lib/ai/AIService";
import { buildMandatoryMentionsText } from "@/lib/legal/mandatoryMentions";
import { PROMPT_VERSION } from "@/lib/ai/prompts/system";
import { toneForVariant, VARIANT_TONE_PRESETS, type VariantsCount } from "@/lib/ai/variants";
import type { ApprovalStatus } from "@/lib/validation/approval";
import type { SocialStatsInput } from "@/lib/validation/socialStats";
import type { ContentType, GenerateContentInput, MarketingParams, VideoAngle, VideoDuration } from "@/lib/ai/types";

export class LotNotFoundError extends Error {}
export class ContentNotFoundError extends Error {}
export class NoLotsError extends Error {}
export class ApprovalForbiddenError extends Error {}

export interface GenerateBatchInput {
  programId: string;
  lotId?: string;
  requestedTypes: ContentType[];
  angle?: VideoAngle;
  duration?: VideoDuration;
  marketing: MarketingParams;
  variantsCount?: VariantsCount;
}

export interface GenerateBulkInput {
  programId: string;
  requestedTypes: ContentType[];
  angle?: VideoAngle;
  duration?: VideoDuration;
  marketing: MarketingParams;
  variantsCount?: VariantsCount;
}

export class ContentService {
  /**
   * Un clic "Générer" = une GenerationRequest qui référence tous les types
   * demandés, mais chaque type est un appel IA indépendant qui produit son
   * propre GeneratedContent — c'est ce qui permet la régénération unitaire.
   */
  static async generateBatch(authContext: AuthContext, input: GenerateBatchInput) {
    const { db, organizationId, userId } = authContext;
    const program = await ProgramService.get(authContext, input.programId);

    const lot = input.lotId ? program.lots.find((l) => l.id === input.lotId) : undefined;
    if (input.lotId && !lot) {
      throw new LotNotFoundError(input.lotId);
    }

    const variantsCount = input.variantsCount ?? 1;

    // Un appel IA par type demandé (× le nombre de variantes) : réserve le quota du mois avant de dépenser des tokens.
    await UsageService.assertQuotaAndReserve(organizationId, input.requestedTypes.length * variantsCount);

    const generationRequest = await db.generationRequest.create({
      data: {
        programId: input.programId,
        lotId: input.lotId ?? null,
        organizationId,
        requestedById: userId,
        positioning: input.marketing.positioning ?? [],
        target: input.marketing.target ?? null,
        tone: input.marketing.tone ?? null,
        languageLevel: input.marketing.languageLevel ?? null,
        length: input.marketing.length ?? null,
        commercialGoal: input.marketing.commercialGoal ?? null,
        mainArgument: input.marketing.mainArgument ?? null,
        cta: input.marketing.cta ?? null,
        requestedTypes: input.requestedTypes,
        promptVersion: String(PROMPT_VERSION),
        status: "pending",
      },
    });

    const jobs = input.requestedTypes.flatMap((type) =>
      Array.from({ length: variantsCount }, (_, i) => ({ type, variantIndex: i as 0 | 1 | 2 }))
    );

    const results = await Promise.allSettled(
      jobs.map(({ type, variantIndex }) =>
        generateOne(authContext, {
          generationRequestId: generationRequest.id,
          programId: input.programId,
          lotId: input.lotId,
          type,
          angle: input.angle,
          duration: input.duration,
          marketing:
            variantsCount > 1 ? { ...input.marketing, tone: toneForVariant(input.marketing.tone ?? undefined, variantIndex) } : input.marketing,
          variantLabel: variantsCount > 1 ? VARIANT_TONE_PRESETS[variantIndex] : undefined,
          program,
          lot,
        })
      )
    );

    const contents = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof generateOne>>> => r.status === "fulfilled")
      .map((r) => r.value);
    const errors = results
      .map((r, i) => ({ r, job: jobs[i] }))
      .filter((x): x is { r: PromiseRejectedResult; job: (typeof jobs)[number] } => x.r.status === "rejected")
      .map(({ r, job }) => {
        // Log la cause brute (erreur SDK Anthropic, timeout...), pas seulement le message stringifié
        // renvoyé au client, pour pouvoir diagnostiquer les échecs depuis les logs Vercel.
        console.error(`[ContentService] Échec génération "${job.type}" (variante ${job.variantIndex}):`, r.reason);
        return String(r.reason);
      });

    await db.generationRequest.update({
      where: { id: generationRequest.id },
      data: { status: errors.length === 0 ? "done" : contents.length > 0 ? "partial" : "failed" },
    });

    return { generationRequest, contents, errors };
  }

  /**
   * Génère le contenu pour tous les lots d'un programme en une seule action :
   * un GenerationRequest et un appel IA par lot et par type, pour garder la
   * régénération unitaire de chaque contenu. Le quota est vérifié lot par lot,
   * donc une génération en masse peut s'arrêter en cours de route si le
   * plafond mensuel est atteint — les lots déjà traités restent acquis.
   */
  static async generateForAllLots(authContext: AuthContext, input: GenerateBulkInput) {
    const program = await ProgramService.get(authContext, input.programId);

    if (program.lots.length === 0) {
      throw new NoLotsError(input.programId);
    }

    const perLot = await Promise.allSettled(
      program.lots.map((lot) =>
        ContentService.generateBatch(authContext, {
          programId: input.programId,
          lotId: lot.id,
          requestedTypes: input.requestedTypes,
          angle: input.angle,
          duration: input.duration,
          marketing: input.marketing,
          variantsCount: input.variantsCount,
        }).then((result) => ({ lot, ...result }))
      )
    );

    return perLot.map((r, index) => {
      const lot = program.lots[index]!;
      if (r.status === "fulfilled") {
        return r.value;
      }
      console.error(`[ContentService] Échec génération en masse pour le lot "${lot.id}":`, r.reason);
      return { lot, contents: [], errors: [String(r.reason)] };
    });
  }

  /** Régénère un seul contenu : archive l'ancienne version et en crée une nouvelle. */
  static async regenerate(authContext: AuthContext, contentId: string) {
    const { db, userId, organizationId } = authContext;
    const existing = await db.generatedContent.findUnique({
      where: { id: contentId },
      include: { generationRequest: true, program: { include: { lots: true } }, lot: true },
    });

    if (!existing) {
      throw new ContentNotFoundError(contentId);
    }

    // Vérifie l'accès au programme (scoping Collaborateur inclus).
    await ProgramService.get(authContext, existing.programId);
    await UsageService.assertQuotaAndReserve(organizationId, 1);

    const marketing: MarketingParams = {
      positioning: existing.generationRequest.positioning,
      target: existing.generationRequest.target,
      tone: existing.generationRequest.tone,
      languageLevel: existing.generationRequest.languageLevel,
      length: existing.generationRequest.length,
      commercialGoal: existing.generationRequest.commercialGoal,
      mainArgument: existing.generationRequest.mainArgument,
      cta: existing.generationRequest.cta,
    };

    const result = await AIService.generateContent({
      type: existing.type as ContentType,
      angle: (existing.angle ?? undefined) as VideoAngle | undefined,
      duration: (existing.duration ?? undefined) as VideoDuration | undefined,
      program: existing.program,
      lot: existing.lot ?? undefined,
      marketing,
    });

    const [, created] = await db.$transaction([
      db.generatedContent.update({ where: { id: existing.id }, data: { status: "archived" } }),
      db.generatedContent.create({
        data: {
          generationRequestId: existing.generationRequestId,
          programId: existing.programId,
          lotId: existing.lotId,
          type: existing.type,
          angle: existing.angle,
          duration: existing.duration,
          content: result.data as Prisma.InputJsonValue,
          createdByUserId: userId,
        },
      }),
    ]);

    return { ...created, legalMentions: buildMandatoryMentionsText(existing.program, existing.lot ?? undefined) };
  }

  /**
   * Fait avancer un contenu dans le workflow de validation (brouillon → à
   * valider → approuvé). Passer à "approved" est réservé aux rôles
   * Promoteur/Admin — un Collaborateur peut soumettre pour validation mais
   * pas s'auto-approuver.
   */
  static async setApprovalStatus(authContext: AuthContext, contentId: string, approvalStatus: ApprovalStatus) {
    const existing = await authContext.db.generatedContent.findUnique({ where: { id: contentId } });
    if (!existing) {
      throw new ContentNotFoundError(contentId);
    }

    await ProgramService.get(authContext, existing.programId);

    if (approvalStatus === "approved" && authContext.role === Role.COLLABORATEUR) {
      throw new ApprovalForbiddenError(contentId);
    }

    return authContext.db.generatedContent.update({ where: { id: contentId }, data: { approvalStatus } });
  }

  /**
   * Enregistre les stats de performance d'une publication (likes, vues, commentaires) saisies
   * manuellement par le promoteur après publication sur Instagram/TikTok — pas de récupération
   * automatique via API tant que l'app Meta/TikTok n'est pas validée.
   */
  static async setSocialStats(authContext: AuthContext, contentId: string, stats: SocialStatsInput) {
    const existing = await authContext.db.generatedContent.findUnique({ where: { id: contentId } });
    if (!existing) {
      throw new ContentNotFoundError(contentId);
    }

    await ProgramService.get(authContext, existing.programId);

    return authContext.db.generatedContent.update({
      where: { id: contentId },
      data: {
        externalPostUrl: stats.url || null,
        externalLikes: stats.likes ?? null,
        externalViews: stats.views ?? null,
        externalComments: stats.comments ?? null,
        externalStatsUpdatedAt: new Date(),
      },
    });
  }
}

async function generateOne(
  authContext: AuthContext,
  args: {
    generationRequestId: string;
    programId: string;
    lotId?: string;
    type: ContentType;
    angle?: VideoAngle;
    duration?: VideoDuration;
    marketing: MarketingParams;
    variantLabel?: string;
    program: Awaited<ReturnType<typeof ProgramService.get>>;
    lot?: Awaited<ReturnType<typeof ProgramService.get>>["lots"][number];
  }
) {
  const generateInput: GenerateContentInput = {
    type: args.type,
    angle: args.angle,
    duration: args.duration,
    program: args.program,
    lot: args.lot,
    marketing: args.marketing,
  };

  const result = await AIService.generateContent(generateInput);

  const created = await authContext.db.generatedContent.create({
    data: {
      generationRequestId: args.generationRequestId,
      programId: args.programId,
      lotId: args.lotId ?? null,
      type: args.type,
      angle: args.angle ?? null,
      duration: args.duration ?? null,
      content: result.data as Prisma.InputJsonValue,
      createdByUserId: authContext.userId,
    },
  });

  return { ...created, legalMentions: buildMandatoryMentionsText(args.program, args.lot), variantLabel: args.variantLabel };
}
