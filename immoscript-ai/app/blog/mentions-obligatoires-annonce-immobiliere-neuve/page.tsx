import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import { BLOG_POSTS } from "@/lib/blog/posts";

const post = BLOG_POSTS.find((p) => p.slug === "mentions-obligatoires-annonce-immobiliere-neuve")!;

export const metadata = {
  title: post.title,
  description: post.excerpt,
};

export default function Article() {
  return (
    <BlogArticleLayout title={post.title} date={post.date}>
      <p>
        Une annonce immobilière en France n&apos;est pas un simple texte marketing : plusieurs informations sont
        généralement attendues pour que l&apos;annonce soit conforme et que l&apos;acheteur soit correctement informé
        avant même la visite. Cet article donne un aperçu des catégories d&apos;informations à ne pas oublier — il ne
        remplace pas l&apos;avis d&apos;un professionnel du droit immobilier sur un cas précis, les règles pouvant
        varier selon le type de bien et évoluer dans le temps.
      </p>

      <h2>La performance énergétique</h2>
      <p>
        Le diagnostic de performance énergétique (classe énergie et émissions de gaz à effet de serre) figure
        normalement dans une annonce, avec une estimation des dépenses énergétiques associées lorsque celle-ci est
        disponible. C&apos;est l&apos;un des premiers critères de tri des acheteurs, et une omission se remarque vite.
      </p>

      <h2>La surface et les caractéristiques du bien</h2>
      <p>
        Surface habitable, nombre de pièces, étage, présence d&apos;annexes (balcon, cave, parking) : ces informations
        doivent correspondre exactement à ce qui figure dans les documents du mandat, pas à une estimation arrondie
        pour l&apos;annonce.
      </p>

      <h2>Le prix et les frais associés</h2>
      <p>
        Le prix affiché doit être sans ambiguïté sur ce qu&apos;il inclut (honoraires d&apos;agence à la charge de
        l&apos;acheteur ou du vendeur, place de parking, etc.). Si l&apos;annonce est diffusée par un intermédiaire
        percevant des honoraires, ceux-ci sont généralement à mentionner explicitement.
      </p>

      <h2>Le statut du bien et de la copropriété</h2>
      <p>
        Pour un bien en copropriété, certaines mentions relatives au régime de copropriété (nombre de lots, montant
        des charges, existence d&apos;une procédure en cours) peuvent être attendues selon le support de diffusion
        utilisé.
      </p>

      <h2>Pourquoi ce n&apos;est pas qu&apos;une formalité</h2>
      <p>
        Une annonce incomplète ou approximative sur ces points peut retarder une vente, créer un désaccord avec un
        acquéreur qui découvre une information tardivement, ou exposer à un contrôle. À l&apos;échelle d&apos;un
        portefeuille de plusieurs dizaines de mandats, s&apos;assurer que chaque annonce reprend systématiquement les
        mêmes informations obligatoires — sans variation d&apos;un bien à l&apos;autre par oubli — devient un vrai
        enjeu opérationnel, pas seulement juridique.
      </p>
    </BlogArticleLayout>
  );
}
