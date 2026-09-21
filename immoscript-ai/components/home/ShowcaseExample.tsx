import { ArrowRight, MapPin, Ruler, Compass, Gauge } from "lucide-react";

// Exemple réel, généré par le pipeline de production (AIService.generateContent, type
// "listing_short") à partir des champs listés dans INPUT_FIELDS ci-dessous — pas un texte rédigé
// à la main pour la démo. Volontairement figé (pas régénéré à l'affichage) : un exemple marketing
// ne doit pas coûter un appel IA à chaque visite de la page publique.
const INPUT_FIELDS = [
  { icon: MapPin, label: "Bacalan, Bordeaux — vue sur la Garonne" },
  { icon: Ruler, label: "T3 traversant, 64 m², balcon 9 m²" },
  { icon: Compass, label: "2ème étage, orientation Sud-Ouest" },
  { icon: Gauge, label: "DPE B / GES A, parking et cave inclus" },
];

const GENERATED_TITLE = "T3 vue Garonne aux Rives d'Argent - Bacalan";
const GENERATED_DESCRIPTION =
  "À Bordeaux-Bacalan, dans la résidence neuve Les Rives d'Argent en bord de fleuve, découvrez ce T3 traversant de 64 m² au 2ème étage. Baigné de lumière grâce à ses larges baies vitrées, il offre une vue dégagée sur la Garonne et un balcon de 9 m² plein Sud-Ouest. Idéal pour jeunes actifs et primo-accédants séduits par un cadre de vie premium, à deux pas du tramway et de la Cité du Vin. Parking et cave inclus, DPE B. Un quartier en pleine mutation, une résidence à taille humaine (48 lots) : le moment idéal pour investir dans votre futur chez-vous.";
const GENERATED_HIGHLIGHTS = [
  "T3 traversant de 64 m² avec balcon 9 m²",
  "Vue dégagée sur la Garonne",
  "Parking sécurisé et cave inclus",
  "Tramway ligne B à 4 min à pied",
];
const GENERATED_CTA = "Réservez votre visite dès aujourd'hui";

export function ShowcaseExample() {
  return (
    <div className="w-full">
      <h2 className="mb-2 text-center text-2xl font-bold tracking-tight">De vos données à une annonce prête à publier</h2>
      <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Exemple réel généré par ImmoScript AI — uniquement à partir des informations ci-dessous.
      </p>

      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Ce que vous saisissez
          </p>
          <ul className="space-y-2.5">
            {INPUT_FIELDS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <ArrowRight className="mx-auto hidden h-6 w-6 shrink-0 text-gray-300 dark:text-gray-600 sm:block" />

        <div className="rounded-3xl border border-brand-200 bg-brand-50 p-5 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:border-brand-900/60 dark:bg-gray-800 dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Ce que génère l&apos;IA
          </p>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{GENERATED_TITLE}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{GENERATED_DESCRIPTION}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {GENERATED_HIGHLIGHTS.map((h) => (
              <li key={h} className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                {h}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-medium text-brand-700 dark:text-brand-400">{GENERATED_CTA}</p>
        </div>
      </div>
    </div>
  );
}
