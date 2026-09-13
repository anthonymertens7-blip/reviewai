"use client";

import { useState } from "react";
import { Check, Copy, FileDown, Pencil, RotateCw } from "lucide-react";
import { CONTENT_TYPE_LABELS } from "@/lib/ai/labels";
import type { ContentType } from "@/lib/ai/types";
import type { ListingOutput, SocialOutput, VideoScriptOutput } from "@/lib/ai/schemas";
import { VideoScriptCard } from "./VideoScriptCard";

export interface ContentCardData {
  id: string;
  type: string;
  status: string;
  content: unknown;
  legalMentions?: string | null;
  variantLabel?: string | null;
}

const LISTING_TYPES = ["listing_full", "listing_short", "portal", "website"];

function toPlainText(type: string, content: unknown, legalMentions?: string | null): string {
  if (type === "video_script") {
    const script = content as VideoScriptOutput;
    return [
      script.hook,
      ...script.scenes.map((s) => `[${s.time}s] ${s.visual} — "${s.voiceover}"${s.textOverlay ? ` (${s.textOverlay})` : ""}`),
      script.cta,
    ].join("\n");
  }

  if (["instagram", "facebook", "linkedin", "tiktok"].includes(type)) {
    const social = content as SocialOutput;
    return [social.caption, social.hashtags.map((h) => `#${h}`).join(" ")].join("\n\n");
  }

  const listing = content as ListingOutput;
  const base = [listing.title, "", listing.description, "", listing.highlights.map((h) => `• ${h}`).join("\n"), "", listing.cta].join("\n");

  if (LISTING_TYPES.includes(type) && legalMentions) {
    return [base, "", "Mentions légales obligatoires :", legalMentions].join("\n");
  }

  return base;
}

export function ContentCard({ data }: { data: ContentCardData }) {
  const [content, setContent] = useState(data.content);
  const [id, setId] = useState(data.id);
  const [status, setStatus] = useState(data.status);
  const [legalMentions, setLegalMentions] = useState(data.legalMentions);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleRegenerate() {
    setIsRegenerating(true);
    setError(null);
    const res = await fetch(`/api/contents/${id}/regenerate`, { method: "POST" });
    setIsRegenerating(false);

    if (!res.ok) {
      if (res.status === 429) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "Quota IA mensuel atteint.");
      } else {
        setError("La régénération a échoué.");
      }
      return;
    }

    const { content: newContent } = await res.json();
    setId(newContent.id);
    setContent(newContent.content);
    setStatus(newContent.status);
    setLegalMentions(newContent.legalMentions);
  }

  function startEdit() {
    setDraft(JSON.stringify(content, null, 2));
    setIsEditing(true);
  }

  async function handleSave() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(draft);
    } catch {
      setError("JSON invalide.");
      return;
    }

    setError(null);
    const res = await fetch(`/api/contents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: parsed }),
    });

    if (!res.ok) {
      setError("La sauvegarde a échoué.");
      return;
    }

    const { content: updated } = await res.json();
    setContent(updated.content);
    setStatus(updated.status);
    setIsEditing(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(toPlainText(data.type, content, legalMentions));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleExport(format: "pdf" | "docx") {
    setError(null);
    const res = await fetch(`/api/contents/${id}/export?format=${format}`);
    if (!res.ok) {
      setError("L'export a échoué.");
      return;
    }

    const blob = await res.blob();
    const match = res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = match?.[1] ?? `contenu.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-medium">{CONTENT_TYPE_LABELS[data.type as ContentType] ?? data.type}</h3>
          {data.variantLabel && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
              Variante · {data.variantLabel}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{status}</span>
      </div>

      {isEditing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={10}
          className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 font-mono text-xs"
        />
      ) : data.type === "video_script" ? (
        <VideoScriptCard script={content as VideoScriptOutput} />
      ) : (
        <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{toPlainText(data.type, content, legalMentions)}</p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700">
              Sauvegarder
            </button>
            <button onClick={() => setIsEditing(false)} className="rounded-md border dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">
              Annuler
            </button>
          </>
        ) : (
          <>
            <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-md border dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copié !" : "Copier"}
            </button>
            <button onClick={startEdit} className="flex items-center gap-1.5 rounded-md border dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Pencil className="h-3.5 w-3.5" />
              Modifier
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 rounded-md border dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
              {isRegenerating ? "Régénération..." : "Régénérer"}
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-1.5 rounded-md border dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileDown className="h-3.5 w-3.5" />
              PDF
            </button>
            <button
              onClick={() => handleExport("docx")}
              className="flex items-center gap-1.5 rounded-md border dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FileDown className="h-3.5 w-3.5" />
              Word
            </button>
          </>
        )}
      </div>
    </div>
  );
}
