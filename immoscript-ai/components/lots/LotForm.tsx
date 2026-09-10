"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LotFormValues {
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

const EMPTY_VALUES: LotFormValues = {
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

export function LotForm({ programId }: { programId: string }) {
  const router = useRouter();
  const [values, setValues] = useState<LotFormValues>(EMPTY_VALUES);
  const [isOpen, setIsOpen] = useState(false);
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
      setError("La création a échoué. Vérifie les champs et réessaie.");
      return;
    }

    setValues(EMPTY_VALUES);
    setIsOpen(false);
    router.refresh();
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        + Ajouter un lot
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <LabeledInput label="Référence" required {...field("reference")} placeholder="ex: A101" />
        <LabeledInput label="Type" required {...field("propertyType")} placeholder="T1, T2, Maison..." />
        <LabeledInput label="Pièces" type="number" {...field("roomsCount")} />
        <LabeledInput label="Surface (m²)" type="number" {...field("livingArea")} />
        <LabeledInput label="Surface extérieure (m²)" type="number" {...field("outdoorArea")} />
        <LabeledInput label="Étage" type="number" {...field("floor")} />
        <LabeledInput label="Orientation" {...field("orientation")} placeholder="Sud, Est..." />
        <LabeledInput label="Exposition" {...field("exposure")} />
        <LabeledInput label="Vue" {...field("view")} placeholder="mer, jardin..." />
        <LabeledInput label="Prix (€)" type="number" {...field("price")} />
        <LabeledInput label="Prix/m² (€)" type="number" {...field("pricePerSqm")} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Disponibilité</label>
          <select {...field("availability")} className="w-full rounded-md border-gray-300 text-sm">
            <option value="">—</option>
            <option value="disponible">Disponible</option>
            <option value="réservé">Réservé</option>
            <option value="vendu">Vendu</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Caractéristiques spéciales</label>
        <input {...field("specialFeatures")} className="w-full rounded-md border-gray-300 text-sm" />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <Checkbox label="Balcon" {...checkbox("hasBalcony")} />
        <Checkbox label="Terrasse" {...checkbox("hasTerrace")} />
        <Checkbox label="Jardin" {...checkbox("hasGarden")} />
        <Checkbox label="Parking" {...checkbox("hasParking")} />
        <Checkbox label="Cave" {...checkbox("hasCellar")} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? "Création..." : "Créer le lot"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function LabeledInput({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md border-gray-300 text-sm"
      />
    </div>
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
      <input type="checkbox" checked={checked} onChange={onChange} className="rounded border-gray-300" />
      {label}
    </label>
  );
}
