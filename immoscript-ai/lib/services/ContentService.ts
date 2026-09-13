import type { Prisma } from "@prisma/client";
import type { AuthContext } from "@/lib/auth";
import { ProgramService } from "./ProgramService";
import { UsageService } from "./UsageService";
import { AIService } from "@/lib/ai/AIService";
import { buildMandatoryMentionsText } from "@/lib/legal/mandatoryMentions";
import { PROMPT_VERSION } from "@/lib/ai/prompts/system";
import { toneForVariant, VARIANT_TONE_PRESETS, type VariantsCount } from "@/lib/ai/variants";
import type { ContentType, GenerateContentInput, MarketingParams, VideoAngle, VideoDuration } from "@/lib/ai/types";

export class LotNotFoundError extends Error {}
export class ContentNotFoundError extends Error {}
export class NoLotsError extends Error {}

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
    const errors = results.filter((r): r is PromiseRejectedResult => r.status === "rejected").map((r) => String(r.reason));

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

    return perLot.map((r, index) =>
      r.status === "fulfilled" ? r.value : { lot: program.lots[index], contents: [], errors: [String(r.reason)] }
    );
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
