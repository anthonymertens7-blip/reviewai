"use client";

import { useState } from "react";
import { Sparkles, Target, MessageCircle, LayoutGrid, Clapperboard, Building2 } from "lucide-react";
import { TargetField } from "./TargetField";
import { ContentTypeChecklist } from "./ContentTypeChecklist";
import { ContentCard, type ContentCardData } from "@/components/results/ContentCard";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { RequiredLegend } from "@/components/ui/RequiredLegend";
import { VIDEO_ANGLES } from "@/lib/ai/types";
import { VIDEO_ANGLE_LABELS } from "@/lib/ai/labels";
import type { ContentType, VideoAngle, VideoDuration } from "@/lib/ai/types";

interface Lot {
  id: string;
  reference: string;
}

export function GeneratorForm({ programId, lots }: { programId: string; lots: Lot[] }) {
  const [lotId, setLotId] = useState<string>("");
  const [requestedTypes, setRequestedTypes] = useState<ContentType[]>([]);
  const [angle, setAngle] = useState<VideoAngle | "">("");
  const [duration, setDuration] = useState<VideoDuration>(30);
  const [target, setTarget] = useState("");
  const [tone, setTone] = useState("");
  const [mainArgument, setMainArgument] = useState("");
  const [cta, setCta] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ContentCardData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const needsVideoParams = requestedTypes.includes("video_script");

  async function handleGenerate() {
    if (requestedTypes.length === 0) {
      setError("Sélectionnez au moins un type de contenu à générer.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResults([]);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        programId,
        lotId: lotId || undefined,
        requestedTypes,
        angle: needsVideoParams && angle ? angle : undefined,
        duration: needsVideoParams ? duration : undefined,
        target: target || undefined,
        tone: tone || undefined,
        mainArgument: mainArgument || undefined,
        cta: cta || undefined,
      }),
    });

    setIsGenerating(false);

    if (!res.ok && res.status !== 502) {
      setError("La génération a échoué. Vérifiez les paramètres et réessayez.");
      return;
    }

    const body = await res.json();
    setResults(body.contents ?? []);
    if (body.errors?.length) {
      setError(`${body.errors.length} contenu(s) n'ont pas pu être générés.`);
    }
  }

  return (
    <div className="space-y-6">
      {lots.length > 0 && (
        <FormSection icon={Building2} title="Quel bien concerné ?">
          <select
            id="lot"
            value={lotId}
            onChange={(e) => setLotId(e.target.value)}
            className="w-full max-w-sm rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="">Contenu programme (aucun lot spécifique)</option>
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.reference}
              </option>
            ))}
          </select>
        </FormSection>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormSection icon={Target} title="Pour qui écrivez-vous ?">
          <TargetField value={target} onChange={setTarget} />
        </FormSection>

        <FormSection icon={MessageCircle} title="Quel message faire passer ?">
          <div className="grid grid-cols-1 gap-4">
            <FormField label="Ton" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="ex: chaleureux, premium" />
            <FormField
              label="Argument principal"
              value={mainArgument}
              onChange={(e) => setMainArgument(e.target.value)}
              placeholder="ex: dernières unités disponibles"
            />
            <FormField label="Appel à l'action" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="ex: Prenez rendez-vous" />
          </div>
        </FormSection>
      </div>

      <FormSection icon={LayoutGrid} title="Quels formats générer ?" required>
        <ContentTypeChecklist value={requestedTypes} onChange={setRequestedTypes} />

        {needsVideoParams && (
          <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl bg-gray-50 dark:bg-gray-900 p-4 sm:grid-cols-2">
            <div className="col-span-full flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Clapperboard className="h-4 w-4" />
              Script vidéo
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Angle</label>
              <select
                value={angle}
                onChange={(e) => setAngle(e.target.value as VideoAngle | "")}
                className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">Laisser l&apos;IA choisir</option>
                {VIDEO_ANGLES.map((a) => (
                  <option key={a} value={a}>
                    {VIDEO_ANGLE_LABELS[a]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Durée</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) as VideoDuration)}
                className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
              >
                <option value={30}>30s</option>
                <option value={45}>45s</option>
                <option value={60}>60s</option>
              </select>
            </div>
          </div>
        )}
      </FormSection>

      <div className="flex flex-col items-center gap-2 py-2">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-transform hover:scale-[1.02] hover:bg-brand-700 active:scale-95 disabled:scale-100 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating
            ? "Génération en cours..."
            : requestedTypes.length > 0
              ? `Générer (${requestedTypes.length})`
              : "Générer"}
        </button>
        <RequiredLegend />
      </div>

      {isGenerating && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {requestedTypes.map((type) => (
            <div key={type} className="animate-pulse rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] p-4">
              <div className="mb-3 h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-700" />
              <div className="mt-2 h-3 w-5/6 rounded bg-gray-100 dark:bg-gray-700" />
              <div className="mt-2 h-3 w-2/3 rounded bg-gray-100 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {results.map((content) => (
            <ContentCard key={content.id} data={content} />
          ))}
        </div>
      )}
    </div>
  );
}
