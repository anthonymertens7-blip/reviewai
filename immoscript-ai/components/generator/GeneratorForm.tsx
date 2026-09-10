"use client";

import { useState } from "react";
import { PositioningSelector } from "./PositioningSelector";
import { ContentTypeChecklist } from "./ContentTypeChecklist";
import { ContentCard, type ContentCardData } from "@/components/results/ContentCard";
import { VIDEO_ANGLES } from "@/lib/ai/types";
import { VIDEO_ANGLE_LABELS } from "@/lib/ai/labels";
import type { ContentType, VideoAngle, VideoDuration } from "@/lib/ai/types";

interface Lot {
  id: string;
  reference: string;
}

export function GeneratorForm({ programId, lots }: { programId: string; lots: Lot[] }) {
  const [lotId, setLotId] = useState<string>("");
  const [positioning, setPositioning] = useState<string[]>([]);
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
      setError("Sélectionne au moins un type de contenu à générer.");
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
        positioning,
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
    <div className="space-y-8">
      <div className="space-y-6 rounded-lg border bg-white p-6">
        {lots.length > 0 && (
          <div>
            <label htmlFor="lot" className="mb-1 block text-sm font-medium text-gray-700">
              Lot (optionnel — laisser vide pour un contenu programme)
            </label>
            <select
              id="lot"
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              className="rounded-md border-gray-300 text-sm"
            >
              <option value="">Aucun lot spécifique</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.reference}
                </option>
              ))}
            </select>
          </div>
        )}

        <PositioningSelector value={positioning} onChange={setPositioning} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cible" value={target} onChange={setTarget} placeholder="ex: jeunes actifs" />
          <Field label="Ton" value={tone} onChange={setTone} placeholder="ex: chaleureux, premium" />
          <Field
            label="Argument principal"
            value={mainArgument}
            onChange={setMainArgument}
            placeholder="ex: dernières unités disponibles"
          />
          <Field label="Appel à l'action" value={cta} onChange={setCta} placeholder="ex: Prenez rendez-vous" />
        </div>

        <ContentTypeChecklist value={requestedTypes} onChange={setRequestedTypes} />

        {needsVideoParams && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Angle vidéo</label>
              <select
                value={angle}
                onChange={(e) => setAngle(e.target.value as VideoAngle | "")}
                className="rounded-md border-gray-300 text-sm"
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
              <label className="mb-1 block text-sm font-medium text-gray-700">Durée</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) as VideoDuration)}
                className="rounded-md border-gray-300 text-sm"
              >
                <option value={30}>30s</option>
                <option value={45}>45s</option>
                <option value={60}>60s</option>
              </select>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isGenerating ? "Génération en cours..." : "Générer"}
        </button>
      </div>

      {isGenerating && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {requestedTypes.map((type) => (
            <div key={type} className="animate-pulse rounded-lg border bg-white p-4">
              <div className="mb-3 h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="mt-2 h-3 w-5/6 rounded bg-gray-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
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

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border-gray-300 text-sm"
      />
    </div>
  );
}
