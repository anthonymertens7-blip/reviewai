"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { BarChart3, Check, Copy, Eye, FileDown, Heart, MessageCircle, Pencil, RotateCw, Send, ShieldCheck, Undo2 } from "lucide-react";
import { CONTENT_TYPE_LABELS } from "@/lib/ai/labels";
import type { ContentType } from "@/lib/ai/types";
import type { ListingOutput, SocialOutput, VideoScriptOutput } from "@/lib/ai/schemas";
import type { ApprovalStatus } from "@/lib/validation/approval";
import { VideoScriptCard } from "./VideoScriptCard";

export interface ContentCardData {
  id: string;
  type: string;
  status: string;
  content: unknown;
  legalMentions?: string | null;
  variantLabel?: string | null;
  approvalStatus?: string;
  externalPostUrl?: string | null;
  externalLikes?: number | null;
  externalViews?: number | null;
  externalComments?: number | null;
}

const SOCIAL_TYPES = ["instagram", "facebook", "linkedin", "tiktok"];

const APPROVAL_LABELS: Record<ApprovalStatus, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  pending_review: { label: "À valider", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  approved: { label: "Approuvé", className: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300" },
};

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

  if (SOCIAL_TYPES.includes(type)) {
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
  const { membership } = useOrganization();
  const canApprove = membership?.role !== "org:member";

  const [content, setContent] = useState(data.content);
  const [id, setId] = useState(data.id);
  const [status, setStatus] = useState(data.status);
  const [legalMentions, setLegalMentions] = useState(data.legalMentions);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>((data.approvalStatus as ApprovalStatus) ?? "draft");
  const [isUpdatingApproval, setIsUpdatingApproval] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [socialStats, setSocialStats] = useState({
    url: data.externalPostUrl ?? "",
    likes: data.externalLikes,
    views: data.externalViews,
    comments: data.externalComments,
  });
  const [isEditingSocialStats, setIsEditingSocialStats] = useState(false);
  const [socialStatsDraft, setSocialStatsDraft] = useState({
    url: socialStats.url,
    likes: socialStats.likes?.toString() ?? "",
    views: socialStats.views?.toString() ?? "",
    comments: socialStats.comments?.toString() ?? "",
  });
  const [isSavingSocialStats, setIsSavingSocialStats] = useState(false);

  async function handleApprovalChange(next: ApprovalStatus) {
    setIsUpdatingApproval(true);
    setError(null);
    const res = await fetch(`/api/contents/${id}/approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalStatus: next }),
    });
    setIsUpdatingApproval(false);

    if (!res.ok) {
      setError("Le changement de statut a échoué.");
      return;
    }

    setApprovalStatus(next);
  }

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

  async function handleSaveSocialStats() {
    setIsSavingSocialStats(true);
    setError(null);
    const res = await fetch(`/api/contents/${id}/social-stats`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: socialStatsDraft.url,
        likes: socialStatsDraft.likes || undefined,
        views: socialStatsDraft.views || undefined,
        comments: socialStatsDraft.comments || undefined,
      }),
    });
    setIsSavingSocialStats(false);

    if (!res.ok) {
      setError("L'enregistrement des stats a échoué.");
      return;
    }

    const { content: updated } = await res.json();
    setSocialStats({
      url: updated.externalPostUrl ?? "",
      likes: updated.externalLikes,
      views: updated.externalViews,
      comments: updated.externalComments,
    });
    setIsEditingSocialStats(false);
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
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${APPROVAL_LABELS[approvalStatus].className}`}>
            {APPROVAL_LABELS[approvalStatus].label}
          </span>
          <span className="text-xs text-gray-400">{status}</span>
        </div>
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

      {SOCIAL_TYPES.includes(data.type) && !isEditing && (
        <div className="mt-3 rounded-2xl border border-dashed p-3 dark:border-gray-700">
          {isEditingSocialStats ? (
            <div className="space-y-2">
              <input
                type="url"
                placeholder="Lien de la publication (une fois postée)"
                value={socialStatsDraft.url}
                onChange={(e) => setSocialStatsDraft((d) => ({ ...d, url: e.target.value }))}
                className="w-full rounded-md border-gray-300 text-xs dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
              <div className="grid grid-cols-3 gap-2">
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  <Heart className="mb-1 h-3 w-3" /> Likes
                  <input
                    type="number"
                    min={0}
                    value={socialStatsDraft.likes}
                    onChange={(e) => setSocialStatsDraft((d) => ({ ...d, likes: e.target.value }))}
                    className="w-full rounded-md border-gray-300 text-xs dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  <Eye className="mb-1 h-3 w-3" /> Vues
                  <input
                    type="number"
                    min={0}
                    value={socialStatsDraft.views}
                    onChange={(e) => setSocialStatsDraft((d) => ({ ...d, views: e.target.value }))}
                    className="w-full rounded-md border-gray-300 text-xs dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  <MessageCircle className="mb-1 h-3 w-3" /> Commentaires
                  <input
                    type="number"
                    min={0}
                    value={socialStatsDraft.comments}
                    onChange={(e) => setSocialStatsDraft((d) => ({ ...d, comments: e.target.value }))}
                    className="w-full rounded-md border-gray-300 text-xs dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveSocialStats}
                  disabled={isSavingSocialStats}
                  className="rounded-md bg-brand-600 px-2.5 py-1 text-xs text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSavingSocialStats ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button
                  onClick={() => setIsEditingSocialStats(false)}
                  className="rounded-md border px-2.5 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : socialStats.url ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" /> {socialStats.likes ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {socialStats.views ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" /> {socialStats.comments ?? 0}
                </span>
              </div>
              <button
                onClick={() => setIsEditingSocialStats(true)}
                className="text-xs text-brand-600 hover:underline dark:text-brand-300"
              >
                Modifier les stats
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingSocialStats(true)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Ajouter les stats de publication (likes, vues...)
            </button>
          )}
        </div>
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

            {approvalStatus === "draft" && (
              <button
                onClick={() => handleApprovalChange("pending_review")}
                disabled={isUpdatingApproval}
                className="flex items-center gap-1.5 rounded-md border border-amber-200 px-3 py-1.5 text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:border-amber-900/60 dark:text-amber-400 dark:hover:bg-amber-950/40"
              >
                <Send className="h-3.5 w-3.5" />
                Envoyer pour validation
              </button>
            )}
            {approvalStatus === "pending_review" && canApprove && (
              <>
                <button
                  onClick={() => handleApprovalChange("approved")}
                  disabled={isUpdatingApproval}
                  className="flex items-center gap-1.5 rounded-md border border-teal-200 px-3 py-1.5 text-teal-700 hover:bg-teal-50 disabled:opacity-50 dark:border-teal-900/60 dark:text-teal-400 dark:hover:bg-teal-950/40"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Approuver
                </button>
                <button
                  onClick={() => handleApprovalChange("draft")}
                  disabled={isUpdatingApproval}
                  className="flex items-center gap-1.5 rounded-md border dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Renvoyer en brouillon
                </button>
              </>
            )}
            {approvalStatus === "approved" && canApprove && (
              <button
                onClick={() => handleApprovalChange("draft")}
                disabled={isUpdatingApproval}
                className="flex items-center gap-1.5 rounded-md border dark:border-gray-700 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Rouvrir
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
