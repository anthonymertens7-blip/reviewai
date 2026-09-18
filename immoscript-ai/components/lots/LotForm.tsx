"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Compass, Euro, ShieldCheck } from "lucide-react";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { FormTextArea } from "@/components/ui/FormTextArea";
import { RequiredLegend } from "@/components/ui/RequiredLegend";
import { FURNISHED_EQUIPMENT_ITEMS } from "@/lib/lots/furnishedEquipment";
import { DPE_CLASSES } from "@/lib/legal/mandatoryMentions";

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
  hasEquippedKitchen: boolean;
  isFurnished: boolean;
  furnishedEquipment: string[];
  dpeEnergyClass: string;
  dpeGesClass: string;
  condoAnnualCharges: string;
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
  hasEquippedKitchen: false,
  isFurnished: false,
  furnishedEquipment: [],
  dpeEnergyClass: "",
  dpeGesClass: "",
  condoAnnualCharges: "",
};

export function LotForm({
  programId,
  lotId,
  initialValues,
  programIsCoOwnership,
  onCancel,
  onSaved,
}: {
  programId: string;
  /** Présent = édition d'un lot existant (PATCH) ; absent = création (POST), y compris pour une duplication. */
  lotId?: string;
  initialValues: LotFormValues;
  programIsCoOwnership?: boolean;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState<LotFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function field<K extends keyof LotFormValues>(key: K) {
    return {
      value: values[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setValues((v) => ({ ...v, [key]: e.target.value })),
    };
  }

  function checkbox(key: keyof LotFormValues) {
    return {
      checked: values[key] as boolean,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [key]: e.target.checked })),
    };
  }

  function toggleEquipment(item: string) {
    setValues((v) => ({
      ...v,
      furnishedEquipment: v.furnishedEquipment.includes(item)
        ? v.furnishedEquipment.filter((i) => i !== item)
        : [...v.furnishedEquipment, item],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // null (pas undefined) pour un champ optionnel vidé : sur une édition, seule une valeur
    // explicite efface la colonne existante — undefined serait simplement absent du JSON envoyé
    // (JSON.stringify omet les clés undefined) et laisserait l'ancienne valeur inchangée en base.
    const payload = {
      reference: values.reference,
      propertyType: values.propertyType,
      roomsCount: values.roomsCount || null,
      livingArea: values.livingArea || null,
      outdoorArea: values.outdoorArea || null,
      floor: values.floor || null,
      orientation: values.orientation || null,
      exposure: values.exposure || null,
      view: values.view || null,
      price: values.price || null,
      pricePerSqm: values.pricePerSqm || null,
      availability: values.availability || null,
      specialFeatures: values.specialFeatures || null,
      hasBalcony: values.hasBalcony,
      hasTerrace: values.hasTerrace,
      hasGarden: values.hasGarden,
      hasParking: values.hasParking,
      hasCellar: values.hasCellar,
      hasEquippedKitchen: values.hasEquippedKitchen,
      isFurnished: values.isFurnished,
      furnishedEquipment: values.isFurnished ? values.furnishedEquipment : [],
      dpeEnergyClass: values.dpeEnergyClass || null,
      dpeGesClass: values.dpeGesClass || null,
      condoAnnualCharges: values.condoAnnualCharges || null,
    };

    const res = await fetch(lotId ? `/api/lots/${lotId}` : `/api/programs/${programId}/lots`, {
      method: lotId ? "PATCH" : "POST",
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
      setError(detail || (lotId ? "L'enregistrement a échoué. Vérifiez les champs et réessayez." : "La création a échoué. Vérifiez les champs et réessayez."));
      return;
    }

    router.refresh();
    onSaved();
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
        <FormSection icon={Compass} title="Orientation & vue" accent="teal">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Surface extérieure (m²)" type="number" {...field("outdoorArea")} />
            <FormField label="Étage" type="number" {...field("floor")} />
            <FormField label="Orientation" {...field("orientation")} placeholder="Sud, Est..." />
            <FormField label="Exposition" {...field("exposure")} />
            <FormField label="Vue" {...field("view")} placeholder="mer, jardin..." />
          </div>
          <div className="mt-3">
            <FormTextArea label="Caractéristiques spéciales" rows={1} {...field("specialFeatures")} />
          </div>
        </FormSection>

        <FormSection icon={Euro} title="Prix & disponibilité" accent="amber">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Prix (€)" type="number" {...field("price")} />
            <FormField label="Prix/m² (€)" type="number" {...field("pricePerSqm")} />
            <div>
              <label htmlFor="lot-availability" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Disponibilité</label>
              <select id="lot-availability" {...field("availability")} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm">
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
            <Checkbox label="Cuisine équipée" {...checkbox("hasEquippedKitchen")} />
            <Checkbox label="Meublé" {...checkbox("isFurnished")} />
          </div>

          {values.isFurnished && (
            <div className="mt-4 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Équipements meublés présents</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {FURNISHED_EQUIPMENT_ITEMS.map((item) => (
                  <label key={item.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.furnishedEquipment.includes(item.value)}
                      onChange={() => toggleEquipment(item.value)}
                      className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </FormSection>
      </div>

      <FormSection icon={ShieldCheck} title="Mentions légales" accent="rose">
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Ces informations sont obligatoires avant publication d&apos;une annonce (DPE, copropriété) et sont ajoutées automatiquement au contenu généré.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="lot-dpe-energy" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Classe DPE</label>
            <select id="lot-dpe-energy" {...field("dpeEnergyClass")} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm">
              <option value="">—</option>
              {DPE_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c === "vierge" ? "Vierge (bien neuf VEFA)" : c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lot-dpe-ges" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Classe GES</label>
            <select id="lot-dpe-ges" {...field("dpeGesClass")} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm">
              <option value="">—</option>
              {DPE_CLASSES.filter((c) => c !== "vierge").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {programIsCoOwnership && (
            <FormField label="Charges annuelles copropriété (€)" type="number" {...field("condoAnnualCharges")} />
          )}
        </div>
      </FormSection>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? (lotId ? "Enregistrement..." : "Création...") : lotId ? "Enregistrer les modifications" : "Créer le lot"}
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
