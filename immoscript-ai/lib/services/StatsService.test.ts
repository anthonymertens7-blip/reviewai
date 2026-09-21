import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { StatsService } from "./StatsService";
import { createTestOrg, cleanupTestOrg } from "../../test/testOrg";
import type { AuthContext } from "@/lib/auth";

/**
 * Couvre la régression PostgreSQL NULLS FIRST sur un ORDER BY DESC (voir le commentaire dans
 * StatsService.getOverview) : un post sans "likes" saisis ne doit jamais remonter au-dessus d'un
 * post ayant réellement des likes enregistrés dans "Publications les plus performantes".
 */
describe("StatsService.getOverview — classement des publications", () => {
  let organizationId: string;
  let authContext: AuthContext;

  beforeEach(async () => {
    const org = await createTestOrg(`stats_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    organizationId = org.organizationId;
    authContext = org.authContext;

    const program = await prisma.program.create({
      data: { organizationId, name: "Programme de test", city: "Paris" },
    });
    const generationRequest = await prisma.generationRequest.create({
      data: {
        programId: program.id,
        organizationId,
        requestedById: org.userId,
        requestedTypes: ["instagram"],
        promptVersion: "test",
      },
    });

    // Un post avec de vrais likes, un post avec seulement des vues saisies (likes jamais
    // renseigné, cas d'usage documenté dans StatsService), et un post avec moins de likes.
    await prisma.generatedContent.createMany({
      data: [
        {
          generationRequestId: generationRequest.id,
          programId: program.id,
          type: "instagram",
          content: {},
          createdByUserId: org.userId,
          externalLikes: 500,
        },
        {
          generationRequestId: generationRequest.id,
          programId: program.id,
          type: "instagram",
          content: {},
          createdByUserId: org.userId,
          externalViews: 5000,
        },
        {
          generationRequestId: generationRequest.id,
          programId: program.id,
          type: "instagram",
          content: {},
          createdByUserId: org.userId,
          externalLikes: 200,
        },
      ],
    });
  });

  afterEach(async () => {
    await cleanupTestOrg(organizationId);
  });

  it("trie par likes décroissants avec les posts sans likes en dernier, jamais en premier", async () => {
    const overview = await StatsService.getOverview(authContext);
    // Le post sans "likes" saisi (seulement des vues) est coalescé à 0 pour l'affichage, mais ce
    // qui est sous test ici est sa POSITION dans le tri : avant le fix, NULL remontait en tête
    // malgré un vrai post à 500 likes juste à côté (voir StatsService.getOverview).
    const likesOrder = overview.social.topPosts.map((p) => p.likes);
    expect(likesOrder).toEqual([500, 200, 0]);
  });
});
