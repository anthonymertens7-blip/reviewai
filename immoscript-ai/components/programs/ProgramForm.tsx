"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, FileText, MapPin, Megaphone } from "lucide-react";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { FormTextArea } from "@/components/ui/FormTextArea";
import { RequiredLegend } from "@/components/ui/RequiredLegend";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection icon={Building2} title="Identité" required>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Nom du programme" required {...field("name")} />
          <FormField label="Ville" required {...field("city")} />
          <FormField label="Adresse" required={mode === "create"} {...field("address")} />
          <FormField label="Quartier" {...field("district")} />
          <FormField label="Type" {...field("programType")} placeholder="neuf, rénové..." />
          <FormField label="Nombre de lots" type="number" {...field("unitsCount")} />
          <FormField label="Date de livraison" type="date" {...field("deliveryDate")} />
        </div>
      </FormSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormSection icon={FileText} title="Description" accent="teal">
          <FormTextArea label="Description" {...field("description")} />
        </FormSection>

        <FormSection icon={MapPin} title="Environnement" accent="violet">
          <div className="grid grid-cols-1 gap-3">
            <FormField label="Environnement" {...field("environment")} placeholder="quartier calme, proche centre..." />
            <FormField label="Transports" {...field("transport")} placeholder="métro ligne 1 à 5 min..." />
            <FormField label="Écoles" {...field("schools")} />
            <FormField label="Commerces" {...field("shops")} />
            <FormField label="Points d'intérêt" {...field("pointsOfInterest")} />
            <FormField label="Équipements" {...field("amenities")} placeholder="salle de sport, parking vélo..." />
          </div>
        </FormSection>
      </div>

      <FormSection icon={Megaphone} title="Arguments commerciaux" accent="amber">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormTextArea label="Caractéristiques" {...field("features")} />
          <FormTextArea label="Avantages" {...field("advantages")} />
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
