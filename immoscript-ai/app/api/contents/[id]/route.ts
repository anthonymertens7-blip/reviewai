import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { withOrgAuth } from "@/lib/with-org-auth";
import { ProgramForbiddenError, ProgramNotFoundError, ProgramService } from "@/lib/services/ProgramService";
import { schemaForType } from "@/lib/ai/schemas";
import type { ContentType } from "@/lib/ai/types";

type Params = { id: string };

const updateContentSchema = z.object({
  content: z.unknown(),
});

export const PATCH = withOrgAuth<Params>(async (req, authContext, { id }) => {
  const body = await req.json();
  const parsed = updateContentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await authContext.db.generatedContent.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    await ProgramService.get(authContext, existing.programId);
  } catch (error) {
    if (error instanceof ProgramNotFoundError) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (error instanceof ProgramForbiddenError) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    throw error;
  }

  // L'édition manuelle passait par un schéma "objet quelconque" : rien n'empêchait d'enregistrer
  // un contenu avec un champ requis manquant/vide (highlights, hashtags, scenes...) ou un artefact
  // d'appel d'outil, que tous les autres chemins (export, bibliothèque) supposent impossible car
  // toujours passé par la validation du schéma IA. On applique désormais la même validation ici.
  const contentSchema = schemaForType(existing.type as ContentType);
  const parsedContent = contentSchema.safeParse(parsed.data.content);
  if (!parsedContent.success) {
    return NextResponse.json({ error: "invalid_content", details: parsedContent.error.flatten() }, { status: 400 });
  }

  const content = await authContext.db.generatedContent.update({
    where: { id },
    data: {
      content: parsedContent.data as Prisma.InputJsonValue,
      status: "edited",
      editedByUserId: authContext.userId,
    },
  });

  return NextResponse.json({ content });
});
