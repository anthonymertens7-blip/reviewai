import { getMissingMandatoryMentions, type LegalMentionsLot, type LegalMentionsProgram } from "@/lib/legal/mandatoryMentions";

export interface CompletenessProgram extends LegalMentionsProgram {
  address?: string | null;
  description?: string | null;
  environment?: string | null;
  transport?: string | null;
  schools?: string | null;
  shops?: string | null;
  pointsOfInterest?: string | null;
  features?: string | null;
  advantages?: string | null;
  deliveryDate?: unknown;
}

export interface CompletenessLot extends LegalMentionsLot {
  price?: number | null;
}

export interface ProgramCompleteness {
  score: number;
  missing: string[];
}

const PROGRAM_CHECKS: { key: keyof CompletenessProgram; label: string }[] = [
  { key: "address", label: "Adresse" },
  { key: "description", label: "Description" },
  { key: "environment", label: "Environnement" },
  { key: "transport", label: "Transports" },
  { key: "schools", label: "Écoles" },
  { key: "shops", label: "Commerces" },
  { key: "pointsOfInterest", label: "Points d'intérêt" },
  { key: "features", label: "Caractéristiques" },
  { key: "advantages", label: "Avantages" },
  { key: "deliveryDate", label: "Date de livraison" },
];

/**
 * Score indicatif (0-100) de ce qu'il manque pour une génération IA optimale :
 * plus les champs sources sont remplis, plus le contenu généré peut être
 * riche et concret (rappel : l'IA ne peut jamais valoriser une information
 * absente, cf. lib/ai/prompts/system.ts).
 */
export function computeProgramCompleteness(program: CompletenessProgram, lots: CompletenessLot[]): ProgramCompleteness {
  const missing: string[] = [];
  const total = PROGRAM_CHECKS.length + 3; // + au moins un lot, prix renseignés, mentions légales
  let passed = 0;

  for (const check of PROGRAM_CHECKS) {
    if (program[check.key]) {
      passed++;
    } else {
      missing.push(check.label);
    }
  }

  if (lots.length === 0) {
    missing.push("Au moins un lot");
  } else {
    passed++;

    const missingPriceCount = lots.filter((l) => l.price == null).length;
    if (missingPriceCount === 0) {
      passed++;
    } else {
      missing.push(`Prix sur ${missingPriceCount} lot(s)`);
    }

    const missingLegalCount = lots.filter((l) => getMissingMandatoryMentions(program, l).length > 0).length;
    if (missingLegalCount === 0) {
      passed++;
    } else {
      missing.push(`Mentions légales sur ${missingLegalCount} lot(s)`);
    }
  }

  return { score: Math.round((passed / total) * 100), missing };
}
