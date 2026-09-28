/** Source unique de vérité pour les articles du blog public — utilisée par l'index (/blog) et par
 * chaque page d'article pour son titre/résumé/date, plutôt que dupliquée à chaque endroit. */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO, affiché formaté par formatPostDate
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "automatiser-marketing-programme-immobilier-neuf",
    title: "Automatiser la création de contenu marketing pour un programme immobilier neuf",
    excerpt:
      "Annonces, réseaux sociaux, scripts vidéo : comment gagner des heures sur la production de contenu à chaque nouveau programme, sans sacrifier la qualité.",
    date: "2026-09-28",
  },
  {
    slug: "rediger-annonce-immobiliere-neuve-qui-convertit",
    title: "Comment rédiger une annonce immobilière neuve qui convertit",
    excerpt:
      "Les éléments qui font qu'une annonce retient l'attention et déclenche une prise de contact, plutôt que de se noyer dans la masse des programmes neufs.",
    date: "2026-09-28",
  },
  {
    slug: "mentions-obligatoires-annonce-immobiliere-neuve",
    title: "DPE, ALUR, diagnostics : les mentions à ne pas oublier dans une annonce immobilière neuve",
    excerpt:
      "Panorama des informations généralement attendues dans une annonce immobilière en France, et pourquoi les oublier peut coûter cher.",
    date: "2026-09-28",
  },
];

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
