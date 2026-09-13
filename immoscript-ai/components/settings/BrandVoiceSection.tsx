"use client";

import { useEffect, useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Palette, Plus, Trash2 } from "lucide-react";

interface BrandVoicePreset {
  id: string;
  name: string;
  target: string | null;
  tone: string | null;
  mainArgument: string | null;
  cta: string | null;
}

const EMPTY_FORM = { name: "", target: "", tone: "", mainArgument: "", cta: "" };

export function BrandVoiceSection() {
  const { membership } = useOrganization();
  const canManage = membership?.role !== "org:member";

  const [presets, setPresets] = useState<BrandVoicePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/brand-voice-presets")
      .then((res) => res.json())
      .then((body) => setPresets(body.presets ?? []))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    setIsSaving(true);
    setError(null);

    const res = await fetch("/api/brand-voice-presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        target: form.target || undefined,
        tone: form.tone || undefined,
        mainArgument: form.mainArgument || undefined,
        cta: form.cta || undefined,
      }),
    });

    setIsSaving(false);

    if (!res.ok) {
      setError("La création a échoué.");
      return;
    }

    const { preset } = await res.json();
    setPresets((p) => [...p, preset]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    setPresets((p) => p.filter((preset) => preset.id !== id));
    await fetch(`/api/brand-voice-presets/${id}`, { method: "DELETE" });
  }

  if (isLoading) return null;

  return (
    <div className="rounded-3xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-gray-700">
          <Palette className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-semibold">Voix de marque</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Préréglages de ton réutilisables par toute l&apos;équipe à chaque génération (ex: Luxe, Familial, Investissement).
          </p>
        </div>
      </div>

      {presets.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Aucun préréglage pour le moment.</p>
      )}

      {presets.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {presets.map((preset) => (
            <li key={preset.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">{preset.name}</p>
                <p className="text-gray-500 dark:text-gray-400">
                  {[preset.target, preset.tone].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              {canManage && (
                <button onClick={() => handleDelete(preset.id)} aria-label="Supprimer" className="text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <div className="mt-4">
          {showForm ? (
            <form onSubmit={handleCreate} className="space-y-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nom du préréglage (ex: Luxe)"
                required
                className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                  placeholder="Cible (ex: cadres, familles)"
                  className="rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm"
                />
                <input
                  value={form.tone}
                  onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
                  placeholder="Ton (ex: premium, sobre)"
                  className="rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm"
                />
                <input
                  value={form.mainArgument}
                  onChange={(e) => setForm((f) => ({ ...f, mainArgument: e.target.value }))}
                  placeholder="Argument principal"
                  className="rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm"
                />
                <input
                  value={form.cta}
                  onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
                  placeholder="Appel à l'action"
                  className="rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSaving ? "Création..." : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouveau préréglage
            </button>
          )}
        </div>
      )}
    </div>
  );
}
