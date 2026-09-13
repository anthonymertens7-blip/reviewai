"use client";

import { useState } from "react";
import { Sparkles, Target, MessageCircle, LayoutGrid, Clapperboard, Building2, AlertTriangle, Palette } from "lucide-react";
import { TargetField } from "./TargetField";
import { ContentTypeChecklist } from "./ContentTypeChecklist";
import { ContentCard, type ContentCardData } from "@/components/results/ContentCard";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { RequiredLegend } from "@/components/ui/RequiredLegend";
import { VIDEO_ANGLES } from "@/lib/ai/types";
import { VIDEO_ANGLE_LABELS } from "@/lib/ai/labels";
import type { ContentType, VideoAngle, VideoDuration } from "@/lib/ai/types";
import { getMissingMandatoryMentions } from "@/lib/legal/mandatoryMentions";

const ALL_LOTS_VALUE = "__all__";

interface Lot {
  id: string;
  reference: string;
  dpeEnergyClass?: string | null;
  dpeGesClass?: string | null;
  condoAnnualCharges?: number | null;
}

interface BrandVoicePreset {
  id: string;
  name: string;
  target: string | null;
  tone: string | null;
  mainArgument: string | null;
  cta: string | null;
}

export function GeneratorForm({
  programId,
  lots,
  programIsCoOwnership,
  programCondoLotsCount,
  brandVoicePresets,
}: {
  programId: string;
  lots: Lot[];
  programIsCoOwnership?: boolean;
  programCondoLotsCount?: number | null;
  brandVoicePresets?: BrandVoicePreset[];
}) {
  const [lotId, setLotId] = useState<string>("");
  const [requestedTypes, setRequestedTypes] = useState<ContentType[]>([]);
  const [angle, setAngle] = useState<VideoAngle | "">("");
  const [duration, setDuration] = useState<VideoDuration>(30);
  const [target, setTarget] = useState("");
  const [tone, setTone] = useState("");
  const [mainArgument, setMainArgument] = useState("");
  const [cta, setCta] = useState("");
  const [variantsCount, setVariantsCount] = useState<1 | 2 | 3>(1);

  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ContentCardData[]>([]);
  const [bulkResults, setBulkResults] = useState<{ lotId: string; lotReference: string; contents: ContentCardData[]; errors: string[] }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const needsVideoParams = requestedTypes.includes("video_script");
  const isBulk = lotId === ALL_LOTS_VALUE;
  const selectedLot = lotId && !isBulk ? lots.find((l) => l.id === lotId) : undefined;
  const missingMentions = getMissingMandatoryMentions(
    { isCoOwnership: !!programIsCoOwnership, condoLotsCount: programCondoLotsCount },
    selectedLot
  );

  async function handleGenerate() {
    if (requestedTypes.length === 0) {
      setError("Sélectionnez au moins un type de contenu à générer.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResults([]);
    setBulkResults([]);

    const marketing = {
      target: target || undefined,
      tone: tone || undefined,
      mainArgument: mainArgument || undefined,
      cta: cta || undefined,
    };

    const res = await fetch(isBulk ? "/api/generate/bulk" : "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        programId,
        ...(isBulk ? {} : { lotId: lotId || undefined }),
        requestedTypes,
        angle: needsVideoParams && angle ? angle : undefined,
        duration: needsVideoParams ? duration : undefined,
        variantsCount,
        ...marketing,
      }),
    });

    setIsGenerating(false);

    if (res.status === 429) {
      const body = await res.json().catch(() => null);
      setError(body?.message ?? "Quota IA mensuel atteint.");
      return;
    }

    if (!res.ok && res.status !== 502) {
      setError("La génération a échoué. Vérifiez les paramètres et réessayez.");
      return;
    }

    const body = await res.json();

    if (isBulk) {
      const grouped = (body.results ?? []).map((r: { lot: { id: string; reference: string }; contents: ContentCardData[]; errors: string[] }) => ({
        lotId: r.lot.id,
        lotReference: r.lot.reference,
        contents: r.contents,
        errors: r.errors,
      }));
      setBulkResults(grouped);
      const totalErrors = grouped.reduce((sum: number, g: { errors: string[] }) => sum + g.errors.length, 0);
      if (totalErrors > 0) {
        setError(`${totalErrors} contenu(s) n'ont pas pu être générés sur l'ensemble des lots.`);
      }
      return;
    }

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
            {lots.length > 1 && <option value={ALL_LOTS_VALUE}>Tous les lots ({lots.length}) — génération en masse</option>}
          </select>
          {isBulk && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Un contenu sera généré individuellement pour chacun des {lots.length} lots du programme.
            </p>
          )}
          {missingMentions.length > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Mentions légales manquantes pour ce lot : {missingMentions.join(", ")}. Complétez-les dans la fiche du lot avant publication.
            </p>
          )}
        </FormSection>
      )}

      {brandVoicePresets && brandVoicePresets.length > 0 && (
        <FormSection icon={Palette} title="Voix de marque">
          <select
            onChange={(e) => {
              const preset = brandVoicePresets.find((p) => p.id === e.target.value);
              if (!preset) return;
              if (preset.target) setTarget(preset.target);
              if (preset.tone) setTone(preset.tone);
              if (preset.mainArgument) setMainArgument(preset.mainArgument);
              if (preset.cta) setCta(preset.cta);
              e.target.value = "";
            }}
            defaultValue=""
            className="w-full max-w-sm rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="" disabled>
              Charger un préréglage...
            </option>
            {brandVoicePresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </FormSection>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormSection icon={Target} title="Pour qui écrivez-vous ?" accent="violet">
          <TargetField value={target} onChange={setTarget} />
        </FormSection>

        <FormSection icon={MessageCircle} title="Quel message faire passer ?" accent="teal">
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

      <FormSection icon={LayoutGrid} title="Quels formats générer ?" required accent="amber">
        <ContentTypeChecklist value={requestedTypes} onChange={setRequestedTypes} />

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Variantes (A/B testing)</label>
          <select
            value={variantsCount}
            onChange={(e) => setVariantsCount(Number(e.target.value) as 1 | 2 | 3)}
            className="w-full max-w-sm rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
          >
            <option value={1}>Une seule version</option>
            <option value={2}>2 variantes (tons différents à comparer)</option>
            <option value={3}>3 variantes (tons différents à comparer)</option>
          </select>
        </div>

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
              ? isBulk
                ? `Générer pour les ${lots.length} lots (${requestedTypes.length} format(s)${variantsCount > 1 ? ` × ${variantsCount} variantes` : ""})`
                : `Générer (${requestedTypes.length}${variantsCount > 1 ? ` × ${variantsCount} variantes` : ""})`
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

      {bulkResults.length > 0 && (
        <div className="space-y-6">
          {bulkResults.map((group) => (
            <div key={group.lotId}>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Building2 className="h-4 w-4" />
                {group.lotReference}
                {group.errors.length > 0 && (
                  <span className="text-xs font-normal text-red-600">
                    · {group.errors.length} contenu(s) en échec
                  </span>
                )}
              </h3>
              {group.contents.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {group.contents.map((content) => (
                    <ContentCard key={content.id} data={content} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucun contenu généré pour ce lot.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
