import type { Prisma } from "@prisma/client";
import type { AuthContext } from "@/lib/auth";
import { ProgramService } from "./ProgramService";
import { AIService } from "@/lib/ai/AIService";
import { PROMPT_VERSION } from "@/lib/ai/prompts/system";
import type { ContentType, GenerateContentInput, MarketingParams, VideoAngle, VideoDuration } from "@/lib/ai/types";

export class LotNotFoundError extends Error {}
export class ContentNotFoundError extends Error {}

export interface GenerateBatchInput {
  programId: string;
  lotId?: string;
  requestedTypes: ContentType[];
  angle?: VideoAngle;
  duration?: VideoDuration;
  marketing: MarketingParams;
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

    const results = await Promise.allSettled(
      input.requestedTypes.map((type) =>
        generateOne(authContext, {
          generationRequestId: generationRequest.id,
          programId: input.programId,
          lotId: input.lotId,
          type,
          angle: input.angle,
          duration: input.duration,
          marketing: input.marketing,
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

  /** Régénère un seul contenu : archive l'ancienne version et en crée une nouvelle. */
  static async regenerate(authContext: AuthContext, contentId: string) {
    const { db, userId } = authContext;
    const existing = await db.generatedContent.findUnique({
      where: { id: contentId },
      include: { generationRequest: true, program: { include: { lots: true } }, lot: true },
    });

    if (!existing) {
      throw new ContentNotFoundError(contentId);
    }

    // Vérifie l'accès au programme (scoping Collaborateur inclus).
    await ProgramService.get(authContext, existing.programId);

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

    return created;
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

  return authContext.db.generatedContent.create({
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
}
