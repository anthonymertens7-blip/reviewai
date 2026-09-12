"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Compass, Euro } from "lucide-react";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { RequiredLegend } from "@/components/ui/RequiredLegend";

export interface LotFormValues {
  reference: string;
  propertyType: string;
  roomsCount: string;
  livingArea: string;
  outdoorArea: string;
  floor: string;
  orientation: string;
  exposure: string;
  view: string;
  price: string;
  pricePerSqm: string;
  availability: string;
  specialFeatures: string;
  hasBalcony: boolean;
  hasTerrace: boolean;
  hasGarden: boolean;
  hasParking: boolean;
  hasCellar: boolean;
}

export const EMPTY_LOT_VALUES: LotFormValues = {
  reference: "",
  propertyType: "",
  roomsCount: "",
  livingArea: "",
  outdoorArea: "",
  floor: "",
  orientation: "",
  exposure: "",
  view: "",
  price: "",
  pricePerSqm: "",
  availability: "",
  specialFeatures: "",
  hasBalcony: false,
  hasTerrace: false,
  hasGarden: false,
  hasParking: false,
  hasCellar: false,
};

export function LotForm({
  programId,
  initialValues,
  onCancel,
  onCreated,
}: {
  programId: string;
  initialValues: LotFormValues;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState<LotFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function field<K extends keyof LotFormValues>(key: K) {
    return {
      value: values[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setValues((v) => ({ ...v, [key]: e.target.value })),
    };
  }

  function checkbox(key: keyof LotFormValues) {
    return {
      checked: values[key] as boolean,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [key]: e.target.checked })),
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      reference: values.reference,
      propertyType: values.propertyType,
      roomsCount: values.roomsCount || undefined,
      livingArea: values.livingArea || undefined,
      outdoorArea: values.outdoorArea || undefined,
      floor: values.floor || undefined,
      orientation: values.orientation || undefined,
      exposure: values.exposure || undefined,
      view: values.view || undefined,
      price: values.price || undefined,
      pricePerSqm: values.pricePerSqm || undefined,
      availability: values.availability || undefined,
      specialFeatures: values.specialFeatures || undefined,
      hasBalcony: values.hasBalcony,
      hasTerrace: values.hasTerrace,
      hasGarden: values.hasGarden,
      hasParking: values.hasParking,
      hasCellar: values.hasCellar,
    };

    const res = await fetch(`/api/programs/${programId}/lots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const fieldErrors = body?.details?.fieldErrors as Record<string, string[]> | undefined;
      const detail = fieldErrors
        ? Object.entries(fieldErrors)
            .filter(([, messages]) => messages.length > 0)
            .map(([field, messages]) => `${field} : ${messages.join(", ")}`)
            .join(" · ")
        : undefined;
      setError(detail || "La création a échoué. Vérifiez les champs et réessayez.");
      return;
    }

    router.refresh();
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection icon={Building2} title="Identité" required>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FormField label="Référence" required {...field("reference")} placeholder="ex: A101" />
          <FormField label="Type" required {...field("propertyType")} placeholder="T1, T2, Maison..." />
          <FormField label="Pièces" type="number" {...field("roomsCount")} />
          <FormField label="Surface (m²)" type="number" {...field("livingArea")} />
        </div>
      </FormSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormSection icon={Compass} title="Orientation & vue">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Surface extérieure (m²)" type="number" {...field("outdoorArea")} />
            <FormField label="Étage" type="number" {...field("floor")} />
            <FormField label="Orientation" {...field("orientation")} placeholder="Sud, Est..." />
            <FormField label="Exposition" {...field("exposure")} />
            <FormField label="Vue" {...field("view")} placeholder="mer, jardin..." />
          </div>
          <div className="mt-3">
            <FormField label="Caractéristiques spéciales" {...field("specialFeatures")} />
          </div>
        </FormSection>

        <FormSection icon={Euro} title="Prix & disponibilité">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Prix (€)" type="number" {...field("price")} />
            <FormField label="Prix/m² (€)" type="number" {...field("pricePerSqm")} />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Disponibilité</label>
              <select {...field("availability")} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm">
                <option value="">—</option>
                <option value="disponible">Disponible</option>
                <option value="réservé">Réservé</option>
                <option value="vendu">Vendu</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Checkbox label="Balcon" {...checkbox("hasBalcony")} />
            <Checkbox label="Terrasse" {...checkbox("hasTerrace")} />
            <Checkbox label="Jardin" {...checkbox("hasGarden")} />
            <Checkbox label="Parking" {...checkbox("hasParking")} />
            <Checkbox label="Cave" {...checkbox("hasCellar")} />
          </div>
        </FormSection>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Création..." : "Créer le lot"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border dark:border-gray-700 px-6 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <RequiredLegend />
      </div>
    </form>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={onChange} className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100" />
      {label}
    </label>
  );
}
