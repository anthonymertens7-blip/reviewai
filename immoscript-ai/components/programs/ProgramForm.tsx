"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
};

interface ProgramFormProps {
  mode: "create" | "edit";
  programId?: string;
  initialValues?: ProgramFormValues;
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: values.name,
      city: values.city,
      address: values.address || undefined,
      district: values.district || undefined,
      programType: values.programType || undefined,
      unitsCount: values.unitsCount || undefined,
      deliveryDate: values.deliveryDate || undefined,
      description: values.description || undefined,
      environment: values.environment || undefined,
      transport: values.transport || undefined,
      schools: values.schools || undefined,
      shops: values.shops || undefined,
      pointsOfInterest: values.pointsOfInterest || undefined,
      amenities: values.amenities || undefined,
      features: values.features || undefined,
      advantages: values.advantages || undefined,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] p-6">
      <Section title="Identité">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nom du programme" required {...field("name")} />
          <Field label="Ville" required {...field("city")} />
          <Field label="Adresse" {...field("address")} />
          <Field label="Quartier" {...field("district")} />
          <Field label="Type" {...field("programType")} placeholder="neuf, rénové..." />
          <Field label="Nombre de lots" type="number" {...field("unitsCount")} />
          <Field label="Date de livraison" type="date" {...field("deliveryDate")} />
        </div>
      </Section>

      <Section title="Description">
        <TextArea label="Description" {...field("description")} />
      </Section>

      <Section title="Environnement">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Environnement" {...field("environment")} placeholder="quartier calme, proche centre..." />
          <Field label="Transports" {...field("transport")} placeholder="métro ligne 1 à 5 min..." />
          <Field label="Écoles" {...field("schools")} />
          <Field label="Commerces" {...field("shops")} />
          <Field label="Points d'intérêt" {...field("pointsOfInterest")} />
          <Field label="Équipements" {...field("amenities")} placeholder="salle de sport, parking vélo..." />
        </div>
      </Section>

      <Section title="Arguments commerciaux">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextArea label="Caractéristiques" {...field("features")} />
          <TextArea label="Avantages" {...field("advantages")} />
        </div>
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Enregistrement..." : mode === "create" ? "Créer le programme" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</h2>
      {children}
    </div>
  );
}

function Field({
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
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <textarea value={value} onChange={onChange} rows={3} className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm" />
    </div>
  );
}
