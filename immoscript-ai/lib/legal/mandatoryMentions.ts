export const DPE_CLASSES = ["A", "B", "C", "D", "E", "F", "G", "vierge"] as const;
export type DpeClass = (typeof DPE_CLASSES)[number];

export interface LegalMentionsProgram {
  isCoOwnership: boolean;
  condoLotsCount?: number | null;
}

export interface LegalMentionsLot {
  dpeEnergyClass?: string | null;
  dpeGesClass?: string | null;
  condoAnnualCharges?: number | null;
}

/**
 * Champs obligatoires (DPE, mentions copropriété — décret n° 2017-1103, loi ALUR)
 * qui manquent pour ce couple programme/lot. Utilisé pour alerter le promoteur
 * avant publication, indépendamment de la génération IA.
 */
export function getMissingMandatoryMentions(program: LegalMentionsProgram, lot?: LegalMentionsLot): string[] {
  const missing: string[] = [];

  if (!lot) {
    return missing;
  }

  if (!lot.dpeEnergyClass) {
    missing.push("Classe DPE (diagnostic de performance énergétique)");
  }

  if (program.isCoOwnership) {
    if (!program.condoLotsCount) {
      missing.push("Nombre de lots de la copropriété");
    }
    if (!lot.condoAnnualCharges && lot.condoAnnualCharges !== 0) {
      missing.push("Charges annuelles de copropriété pour ce lot");
    }
  }

  return missing;
}

/**
 * Texte des mentions légales obligatoires, calculé de façon déterministe à
 * partir des données saisies — jamais généré par l'IA, pour garantir son
 * exactitude même si le modèle se trompe ou omet une information.
 */
export function buildMandatoryMentionsText(program: LegalMentionsProgram, lot?: LegalMentionsLot): string | null {
  if (!lot) {
    return null;
  }

  const lines: string[] = [];

  if (lot.dpeEnergyClass) {
    if (lot.dpeEnergyClass === "vierge") {
      lines.push("DPE : vierge (bien neuf vendu en l'état futur d'achèvement, non encore soumis au diagnostic).");
    } else {
      const ges = lot.dpeGesClass ? ` — classe climat (GES) : ${lot.dpeGesClass}` : "";
      lines.push(`DPE : classe énergie ${lot.dpeEnergyClass}${ges}.`);
    }
  }

  if (program.isCoOwnership) {
    const lotsCount = program.condoLotsCount ? `${program.condoLotsCount} lots` : "nombre de lots non communiqué";
    const charges =
      lot.condoAnnualCharges || lot.condoAnnualCharges === 0
        ? `${lot.condoAnnualCharges.toLocaleString("fr-FR")} € / an`
        : "montant non communiqué";
    lines.push(`Bien soumis au statut de la copropriété (${lotsCount}). Charges annuelles prévisionnelles pour ce lot : ${charges}.`);
  }

  return lines.length > 0 ? lines.join("\n") : null;
}
