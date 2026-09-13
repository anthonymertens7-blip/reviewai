"use client";

import { useState } from "react";
import { AlertTriangle, Copy } from "lucide-react";
import { LotForm, EMPTY_LOT_VALUES, type LotFormValues } from "./LotForm";
import { DeleteLotButton } from "./DeleteLotButton";
import { getMissingMandatoryMentions } from "@/lib/legal/mandatoryMentions";

export interface LotSummary {
  id: string;
  reference: string;
  propertyType: string;
  roomsCount: number | null;
  livingArea: number | null;
  outdoorArea: number | null;
  floor: number | null;
  orientation: string | null;
  exposure: string | null;
  view: string | null;
  hasBalcony: boolean;
  hasTerrace: boolean;
  hasGarden: boolean;
  hasParking: boolean;
  hasCellar: boolean;
  hasEquippedKitchen: boolean;
  isFurnished: boolean;
  furnishedEquipment: string[];
  dpeEnergyClass: string | null;
  dpeGesClass: string | null;
  condoAnnualCharges: number | null;
  price: number | null;
  pricePerSqm: number | null;
  availability: string | null;
  specialFeatures: string | null;
}

function duplicateValues(lot: LotSummary): LotFormValues {
  return {
    reference: "",
    propertyType: lot.propertyType,
    roomsCount: lot.roomsCount?.toString() ?? "",
    livingArea: lot.livingArea?.toString() ?? "",
    outdoorArea: lot.outdoorArea?.toString() ?? "",
    floor: lot.floor?.toString() ?? "",
    orientation: lot.orientation ?? "",
    exposure: lot.exposure ?? "",
    view: lot.view ?? "",
    price: lot.price?.toString() ?? "",
    pricePerSqm: lot.pricePerSqm?.toString() ?? "",
    availability: lot.availability ?? "",
    specialFeatures: lot.specialFeatures ?? "",
    hasBalcony: lot.hasBalcony,
    hasTerrace: lot.hasTerrace,
    hasGarden: lot.hasGarden,
    hasParking: lot.hasParking,
    hasCellar: lot.hasCellar,
    hasEquippedKitchen: lot.hasEquippedKitchen,
    isFurnished: lot.isFurnished,
    furnishedEquipment: lot.furnishedEquipment,
    // DPE et charges de copropriété sont propres à chaque lot : jamais copiés lors d'une duplication.
    dpeEnergyClass: "",
    dpeGesClass: "",
    condoAnnualCharges: "",
  };
}

export function LotsManager({
  programId,
  lots,
  programIsCoOwnership,
  programCondoLotsCount,
}: {
  programId: string;
  lots: LotSummary[];
  programIsCoOwnership?: boolean;
  programCondoLotsCount?: number | null;
}) {
  const [formValues, setFormValues] = useState<LotFormValues | null>(null);
  const [formKey, setFormKey] = useState(0);

  function openCreate() {
    setFormValues(EMPTY_LOT_VALUES);
    setFormKey((k) => k + 1);
  }

  function openDuplicate(lot: LotSummary) {
    setFormValues(duplicateValues(lot));
    setFormKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      {formValues ? (
        <LotForm
          key={formKey}
          programId={programId}
          initialValues={formValues}
          programIsCoOwnership={programIsCoOwnership}
          onCancel={() => setFormValues(null)}
          onCreated={() => setFormValues(null)}
        />
      ) : (
        <button
          onClick={openCreate}
          className="rounded-md border dark:border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          + Ajouter un lot
        </button>
      )}

      {lots.length === 0 ? (
        <p className="rounded-3xl border dark:border-gray-700 border-dashed p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Aucun lot pour le moment.
        </p>
      ) : (
        <ul className="divide-y dark:divide-gray-700 rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
          {lots.map((lot) => {
            const missingMentions = getMissingMandatoryMentions(
              { isCoOwnership: !!programIsCoOwnership, condoLotsCount: programCondoLotsCount },
              lot
            );
            return (
              <li key={lot.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="font-medium">
                    {lot.reference} — {lot.propertyType}
                    {lot.roomsCount ? ` · ${lot.roomsCount} pièces` : ""}
                    {lot.livingArea ? ` · ${lot.livingArea} m²` : ""}
                    {lot.isFurnished ? " · Meublé" : ""}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lot.price ? `${lot.price.toLocaleString("fr-FR")} € · ` : ""}
                    {lot.availability ?? "disponibilité non renseignée"}
                  </p>
                  {missingMentions.length > 0 && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Mentions manquantes : {missingMentions.join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openDuplicate(lot)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Dupliquer
                  </button>
                  <DeleteLotButton lotId={lot.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
