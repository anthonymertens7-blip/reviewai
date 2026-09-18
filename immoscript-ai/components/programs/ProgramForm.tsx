"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Building2, FileText, MapPin, Megaphone, Wand2 } from "lucide-react";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { FormTextArea } from "@/components/ui/FormTextArea";
import { RequiredLegend } from "@/components/ui/RequiredLegend";
import { useAutoGrowTextarea } from "@/lib/useAutoGrowTextarea";
import type { SuggestibleField, SuggestionContext } from "@/lib/ai/prompts/fieldSuggestion";

export interface ProgramFormValues {
  name: string;
  city: string;
  address: string;
  district: string;
  programType: string;
  unitsCount: string;
  deliveryDate: string;
  description: string;
  environment: string;
  transport: string;
  schools: string;
  shops: string;
  pointsOfInterest: string;
  amenities: string;
  features: string;
  advantages: string;
  isCoOwnership: boolean;
  condoLotsCount: string;
}

export const EMPTY_PROGRAM_VALUES: ProgramFormValues = {
  name: "",
  city: "",
  address: "",
  district: "",
  programType: "",
  unitsCount: "",
  deliveryDate: "",
  description: "",
  environment: "",
  transport: "",
  schools: "",
  shops: "",
  pointsOfInterest: "",
  amenities: "",
  features: "",
  advantages: "",
  isCoOwnership: false,
  condoLotsCount: "",
};

interface ProgramFormProps {
  mode: "create" | "edit";
  programId?: string;
  initialValues?: ProgramFormValues;
}

function buildSuggestionContext(v: ProgramFormValues): SuggestionContext {
  return {
    address: v.address,
    city: v.city,
    district: v.district || undefined,
    programType: v.programType || undefined,
    unitsCount: v.unitsCount || undefined,
    deliveryDate: v.deliveryDate || undefined,
    environment: v.environment || undefined,
    transport: v.transport || undefined,
    schools: v.schools || undefined,
    shops: v.shops || undefined,
    pointsOfInterest: v.pointsOfInterest || undefined,
    amenities: v.amenities || undefined,
  };
}

export function ProgramForm({ mode, programId, initialValues }: ProgramFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProgramFormValues>(initialValues ?? EMPTY_PROGRAM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function field<K extends keyof ProgramFormValues>(key: K) {
    return {
      value: values[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((v) => ({ ...v, [key]: e.target.value })),
    };
  }

  function setFieldValue<K extends keyof ProgramFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function checkbox(key: keyof ProgramFormValues) {
    return {
      checked: values[key] as boolean,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [key]: e.target.checked })),
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // null (pas undefined) pour un champ optionnel vidé : sur une édition, seule une valeur
    // explicite efface la colonne existante — undefined serait simplement absent du JSON envoyé
    // (JSON.stringify omet les clés undefined) et laisserait l'ancienne valeur inchangée en base
    // (voir le même principe et sa vérification live sur LotForm).
    const payload = {
      name: values.name,
      city: values.city,
      address: values.address || null,
      district: values.district || null,
      programType: values.programType || null,
      unitsCount: values.unitsCount || null,
      deliveryDate: values.deliveryDate || null,
      description: values.description || null,
      environment: values.environment || null,
      transport: values.transport || null,
      schools: values.schools || null,
      shops: values.shops || null,
      pointsOfInterest: values.pointsOfInterest || null,
      amenities: values.amenities || null,
      features: values.features || null,
      advantages: values.advantages || null,
      isCoOwnership: values.isCoOwnership,
      condoLotsCount: values.isCoOwnership ? values.condoLotsCount || null : null,
    };

    const url = mode === "create" ? "/api/programs" : `/api/programs/${programId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError("L'enregistrement a échoué. Vérifiez les champs et réessayez.");
      return;
    }

    if (mode === "create") {
      const { program } = await res.json();
      router.push(`/programs/${program.id}`);
    } else {
      router.push(`/programs/${programId}`);
    }
    router.refresh();
  }

  const suggestionContext = buildSuggestionContext(values);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection icon={Building2} title="Identité" required accent="indigo">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Nom du programme" required {...field("name")} />
          <FormField label="Ville" required {...field("city")} />
          <FormField label="Adresse" required={mode === "create"} {...field("address")} />
          <FormField label="Quartier" {...field("district")} />
          <FormField label="Type" {...field("programType")} placeholder="neuf, rénové..." />
          <FormField label="Nombre de lots" type="number" {...field("unitsCount")} />
          <FormField label="Date de livraison" type="date" {...field("deliveryDate")} />
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...checkbox("isCoOwnership")}
              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
            Soumis au statut de la copropriété
          </label>
          {values.isCoOwnership && (
            <FormField label="Nombre de lots de la copropriété" type="number" {...field("condoLotsCount")} />
          )}
        </div>
      </FormSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormSection icon={FileText} title="Description" accent="teal">
          <FormTextArea label="Description" {...field("description")} />
        </FormSection>

        <FormSection icon={MapPin} title="Environnement" accent="violet">
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              La suggestion automatique de localisation (transports, points d&apos;intérêt...) n&apos;est pas
              garantie fiable pour le moment : vérifiez et corrigez-la manuellement avant de vous en servir. Une
              future mise à jour la rendra plus précise.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <FieldWithSuggest
              label="Environnement"
              suggestField="environment"
              context={suggestionContext}
              value={values.environment}
              onChange={(v) => setFieldValue("environment", v)}
              placeholder="quartier calme, proche centre..."
            />
            <FieldWithSuggest
              label="Transports"
              suggestField="transport"
              context={suggestionContext}
              value={values.transport}
              onChange={(v) => setFieldValue("transport", v)}
              placeholder="métro ligne 1 à 5 min..."
            />
            <FieldWithSuggest
              label="Écoles"
              suggestField="schools"
              context={suggestionContext}
              value={values.schools}
              onChange={(v) => setFieldValue("schools", v)}
            />
            <FieldWithSuggest
              label="Commerces"
              suggestField="shops"
              context={suggestionContext}
              value={values.shops}
              onChange={(v) => setFieldValue("shops", v)}
            />
            <FieldWithSuggest
              label="Points d'intérêt"
              suggestField="pointsOfInterest"
              context={suggestionContext}
              value={values.pointsOfInterest}
              onChange={(v) => setFieldValue("pointsOfInterest", v)}
            />
            <FormTextArea label="Équipements" rows={1} {...field("amenities")} />
          </div>
        </FormSection>
      </div>

      <FormSection icon={Megaphone} title="Arguments commerciaux" accent="amber">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FieldWithSuggest
            label="Caractéristiques"
            suggestField="features"
            context={suggestionContext}
            value={values.features}
            onChange={(v) => setFieldValue("features", v)}
          />
          <FieldWithSuggest
            label="Avantages"
            suggestField="advantages"
            context={suggestionContext}
            value={values.advantages}
            onChange={(v) => setFieldValue("advantages", v)}
          />
        </div>
      </FormSection>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Enregistrement..." : mode === "create" ? "Créer le programme" : "Enregistrer"}
        </button>
        <RequiredLegend />
      </div>
    </form>
  );
}

function FieldWithSuggest({
  label,
  suggestField,
  context,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  suggestField: SuggestibleField;
  context: SuggestionContext;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSuggest = context.address.trim().length > 0 && context.city.trim().length > 0;
  const textareaRef = useAutoGrowTextarea(value);
  const id = useId();

  async function handleSuggest() {
    if (!canSuggest || isLoading) return;
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/programs/suggest-field", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context, field: suggestField }),
    });

    setIsLoading(false);

    if (!res.ok) {
      if (res.status === 429) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "Quota IA mensuel atteint.");
      } else {
        setError("Suggestion indisponible.");
      }
      return;
    }

    const { suggestions } = (await res.json()) as { suggestions: string[] };
    const joined = suggestions.join(", ");
    onChange(value.trim() ? `${value.trim()}, ${joined}` : joined);
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={!canSuggest || isLoading}
          title={canSuggest ? "Suggérer à partir des informations déjà renseignées" : "Renseignez d'abord la ville et l'adresse"}
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-400"
        >
          <Wand2 className={`h-3.5 w-3.5 ${isLoading ? "animate-pulse" : ""}`} />
          {isLoading ? "Génération..." : "Suggérer"}
        </button>
      </div>
      <textarea
        id={id}
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none overflow-hidden rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
