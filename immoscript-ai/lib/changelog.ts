export interface ChangelogEntry {
  title: string;
  description: string;
}

// Le plus récent en premier.
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    title: "Recherche rapide (Ctrl+K)",
    description: "Sautez directement vers un bien ou une page depuis n'importe où dans l'app.",
  },
  {
    title: "Dashboard : checklist, activité récente et badge de plan",
    description: "Un guide de démarrage qui se coche automatiquement, un fil de l'activité de l'équipe, et votre offre affichée clairement.",
  },
  {
    title: "Digest hebdomadaire par email",
    description: "Chaque lundi, un résumé automatique de l'activité de votre équipe et de votre quota IA du mois.",
  },
  {
    title: "Génération ancrée sur photos",
    description: "Uploadez des photos par bien : l'IA décrit uniquement ce qui est réellement visible, jamais inventé.",
  },
  {
    title: "Export CSV du bien",
    description: "Exportez toutes les annonces et leurs textes en un clic, prêt pour l'import vers un portail ou un CRM.",
  },
  {
    title: "Workflow de validation du contenu",
    description: "Statuts Brouillon / À valider / Approuvé sur chaque contenu généré, pour une relecture d'équipe avant diffusion.",
  },
  {
    title: "Préréglages de voix de marque",
    description: "Enregistrez des tons réutilisables (Luxe, Familial, Investissement) partagés par toute l'organisation.",
  },
  {
    title: "Variantes A/B",
    description: "Générez 2 ou 3 versions d'un même contenu avec des nuances de ton différentes, à comparer.",
  },
  {
    title: "Génération en masse",
    description: "Générez le contenu pour toutes les annonces d'un bien en un seul clic.",
  },
  {
    title: "Score de complétude et clonage de bien",
    description: "Un indicateur visuel montre ce qu'il manque pour une génération optimale ; dupliquez un bien pour démarrer plus vite.",
  },
  {
    title: "Mentions légales obligatoires",
    description: "DPE, copropriété : alertes automatiques et texte légal ajouté au contenu destiné à publication.",
  },
  {
    title: "Suggestions IA contextuelles",
    description: "Pré-remplissez rapidement les champs d'un bien à partir de son adresse et de sa ville.",
  },
  {
    title: "Mode sombre et plafond de générations IA",
    description: "Interface disponible en clair/sombre, et quota mensuel par organisation pour maîtriser les coûts.",
  },
];
