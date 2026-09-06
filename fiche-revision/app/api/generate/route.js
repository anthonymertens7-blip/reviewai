import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsageCount, incrementUsageCount, FREE_LIMIT } from "@/lib/usage";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY n'est pas configurée sur le serveur." },
      { status: 500 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "Connecte-toi pour générer une fiche." },
      { status: 401 }
    );
  }

  const userId = session.user.email;
  const used = await getUsageCount(userId);
  if (used >= FREE_LIMIT) {
    return NextResponse.json(
      { error: "Limite de fiches gratuites atteinte.", limitReached: true },
      { status: 403 }
    );
  }

  const { course } = await request.json();
  if (!course || !course.trim()) {
    return NextResponse.json({ error: "Le cours est vide." }, { status: 400 });
  }

  const prompt = `Tu es un excellent professeur qui aide les élèves à réviser.
À partir du cours ci-dessous, rédige une fiche de révision claire et structurée en français, au format Markdown :
- Un titre reprenant le sujet du cours
- Les points clés sous forme de listes à puces
- Les définitions importantes en gras
- Une section finale "À retenir" avec un résumé en 2-3 phrases

Cours à résumer :
"""
${course}
"""`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        output_config: { effort: "low" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Erreur de l'API Anthropic (${response.status}) : ${errText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const fiche = data.content?.map((block) => block.text || "").join("") ?? "";
    const count = await incrementUsageCount(userId);

    return NextResponse.json({ fiche, count });
  } catch {
    return NextResponse.json(
      { error: "Impossible de contacter l'API Anthropic." },
      { status: 502 }
    );
  }
}
