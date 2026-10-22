"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, Compass, Euro, ShieldCheck, FileText, Megaphone, AlertTriangle } from "lucide-react";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { FormTextArea } from "@/components/ui/FormTextArea";
import { RequiredLegend } from "@/components/ui/RequiredLegend";
import { FieldWithSuggest } from "@/components/programs/ProgramForm";
import { FURNISHED_EQUIPMENT_ITEMS } from "@/lib/lots/furnishedEquipment";
import { DPE_CLASSES } from "@/lib/legal/mandatoryMentions";
import type { SuggestionContext } from "@/lib/ai/prompts/fieldSuggestion";

/**
 * Flux de création "un agent, un bien" : un seul formulaire crée en séquence un Program puis un
 * Lot (POST /api/programs, puis POST /api/programs/:id/lots) — la hiérarchie Program/Lot reste
 * inchangée en base (nécessaire pour la génération en masse sur les cas rares multi-unités), mais
 * l'agent ne voit qu'une seule étape "Ajouter un bien", conforme à son usage réel (un bien = un
 * mandat indépendant, pas une tranche d'un programme neuf). Les champs propres au neuf/multi-lots
 * (nombre d'unités, date de disponibilité au niveau du bien) sont repliés dans "Options avancées".
 */
interface BienFormValues {
  // Identité (Program + Lot)
  name: string;
  city: string;
  address: string;
  district: string;
  propertyType: string;
  roomsCount: string;
  livingArea: string;
  // Prix & disponibilité (Lot)
  price: string;
  pricePerSqm: string;
  availability: string;
  hasBalcony: boolean;
  hasTerrace: boolean;
  hasGarden: boolean;
  hasParking: boolean;
  hasCellar: boolean;
  hasEquippedKitchen: boolean;
  isFurnished: boolean;
  furnishedEquipment: string[];
  // Orientation & vue (Lot)
  outdoorArea: string;
  floor: string;
  orientation: string;
  exposure: string;
  view: string;
  specialFeatures: string;
  // Description & environnement (Program)
  description: string;
  environment: string;
  transport: string;
  schools: string;
  shops: string;
  pointsOfInterest: string;
  amenities: string;
  // Arguments commerciaux (Program)
  features: string;
  advantages: string;
  // Mentions légales (Lot + Program)
  dpeEnergyClass: string;
  dpeGesClass: string;
  isCoOwnership: boolean;
  condoLotsCount: string;
  condoAnnualCharges: string;
  // Options avancées (Program, cas multi-unités / neuf)
  programType: string;
  unitsCount: string;
  deliveryDate: string;
}

const EMPTY_VALUES: BienFormValues = {
  name: "",
  city: "",
  address: "",
  district: "",
  propertyType: "",
  roomsCount: "",
  livingArea: "",
  price: "",
  pricePerSqm: "",
  availability: "disponible",
  hasBalcony: false,
  hasTerrace: false,
  hasGarden: false,
  hasParking: false,
  hasCellar: false,
  hasEquippedKitchen: false,
  isFurnished: false,
  furnishedEquipment: [],
  outdoorArea: "",
  floor: "",
  orientation: "",
  exposure: "",
  view: "",
  specialFeatures: "",
  description: "",
  environment: "",
  transport: "",
  schools: "",
  shops: "",
  pointsOfInterest: "",
  amenities: "",
  features: "",
  advantages: "",
  dpeEnergyClass: "",
  dpeGesClass: "",
  isCoOwnership: false,
  condoLotsCount: "",
  condoAnnualCharges: "",
  programType: "",
  unitsCount: "",
  deliveryDate: "",
};

export function CreateBienForm() {
  const router = useRouter();
  const [values, setValues] = useState<BienFormValues>(EMPTY_VALUES);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function field<K extends keyof BienFormValues>(key: K) {
    return {
      value: values[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setValues((v) => ({ ...v, [key]: e.target.value })),
    };
  }

  function setFieldValue<K extends keyof BienFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function checkbox(key: keyof BienFormValues) {
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

  const suggestionContext: SuggestionContext = {
    address: values.address,
    city: values.city,
    district: values.district || undefined,
    programType: values.programType || undefined,
    unitsCount: values.unitsCount || undefined,
    deliveryDate: values.deliveryDate || undefined,
    environment: values.environment || undefined,
    transport: values.transport || undefined,
    schools: values.schools || undefined,
    shops: values.shops || undefined,
    pointsOfInterest: values.pointsOfInterest || undefined,
    amenities: values.amenities || undefined,
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const programPayload = {
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

    const programRes = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(programPayload),
    });

    if (!programRes.ok) {
      setIsSubmitting(false);
      setError("L'enregistrement a échoué. Vérifiez les champs et réessayez.");
      return;
    }

    const { program } = await programRes.json();

    const lotPayload = {
      reference: values.name || "Annonce principale",
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

    const lotRes = await fetch(`/api/programs/${program.id}/lots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lotPayload),
    });

    setIsSubmitting(false);

    if (!lotRes.ok) {
      // Le bien est créé mais son annonce a échoué (ex: type de bien manquant) : on amène quand
      // même l'utilisateur sur la fiche du bien plutôt que de perdre sa saisie dans une erreur
      // générique — il pourra ajouter l'annonce depuis là, avec les données déjà remplies visibles
      // nulle part ailleurs sinon.
      router.push(`/programs/${program.id}`);
      router.refresh();
      return;
    }

    router.push(`/programs/${program.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection icon={Building2} title="Identité du bien" required>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Nom du bien" required placeholder="ex: T3 Bacalan - Quai des Chartrons" {...field("name")} />
          <FormField label="Ville" required {...field("city")} />
          <FormField label="Adresse" required {...field("address")} />
          <FormField label="Quartier" {...field("district")} />
          <FormField label="Type de bien" required placeholder="T1, T2, Maison..." {...field("propertyType")} />
          <FormField label="Pièces" type="number" {...field("roomsCount")} />
          <FormField label="Surface (m²)" type="number" {...field("livingArea")} />
        </div>
      </FormSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormSection icon={Euro} title="Prix & disponibilité" accent="amber">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Prix (€)" type="number" {...field("price")} />
            <FormField label="Prix/m² (€)" type="number" {...field("pricePerSqm")} />
            <div>
              <label htmlFor="bien-availability" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Disponibilité
              </label>
              <select
                id="bien-availability"
                {...field("availability")}
                className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
              >
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

        <FormSection icon={Compass} title="Orientation & vue" accent="teal">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Surface extérieure (m²)" type="number" {...field("outdoorArea")} />
            <FormField label="Étage" type="number" {...field("floor")} />
            <FormField label="Orientation" placeholder="Sud, Est..." {...field("orientation")} />
            <FormField label="Exposition" {...field("exposure")} />
            <FormField label="Vue" placeholder="mer, jardin..." {...field("view")} />
          </div>
          <div className="mt-3">
            <FormTextArea label="Caractéristiques spéciales" rows={1} {...field("specialFeatures")} />
          </div>
        </FormSection>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormSection icon={FileText} title="Description" accent="violet">
          <FormTextArea label="Description" {...field("description")} />
        </FormSection>

        <FormSection icon={Building2} title="Environnement" accent="indigo">
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              La suggestion automatique de localisation (transports, points d&apos;intérêt...) n&apos;est pas
              garantie fiable pour le moment : vérifiez et corrigez-la manuellement avant de vous en servir.
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

      <FormSection icon={ShieldCheck} title="Mentions légales" accent="rose">
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Ces informations sont obligatoires avant publication d&apos;une annonce (DPE, copropriété) et sont ajoutées
          automatiquement au contenu généré.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="bien-dpe-energy" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Classe DPE
            </label>
            <select
              id="bien-dpe-energy"
              {...field("dpeEnergyClass")}
              className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="">—</option>
              {DPE_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c === "vierge" ? "Vierge (vente en VEFA)" : c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bien-dpe-ges" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Classe GES
            </label>
            <select
              id="bien-dpe-ges"
              {...field("dpeGesClass")}
              className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="">—</option>
              {DPE_CLASSES.filter((c) => c !== "vierge").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
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
            <>
              <FormField label="Nombre de lots dans la copropriété" type="number" {...field("condoLotsCount")} />
              <FormField label="Charges annuelles copropriété (€)" type="number" {...field("condoAnnualCharges")} />
            </>
          )}
        </div>
      </FormSection>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          Options avancées (bien avec plusieurs unités)
        </button>
        {showAdvanced && (
          <div className="mt-3 grid grid-cols-1 gap-3 rounded-2xl border border-dashed dark:border-gray-700 p-4 sm:grid-cols-3">
            <FormField label="Type" placeholder="ancien, neuf, à rénover..." {...field("programType")} />
            <FormField label="Nombre d'unités (le cas échéant)" type="number" {...field("unitsCount")} />
            <FormField label="Date de disponibilité" type="date" {...field("deliveryDate")} />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Création..." : "Créer le bien"}
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
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
      />
      {label}
    </label>
  );
}
