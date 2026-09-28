import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import { BLOG_POSTS } from "@/lib/blog/posts";

const post = BLOG_POSTS.find((p) => p.slug === "mentions-obligatoires-annonce-immobiliere-neuve")!;

export const metadata = {
  title: `${post.title} — ImmoScript AI`,
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
        disponible. Pour un logement neuf, cette information reste attendue au même titre que pour l&apos;ancien.
      </p>

      <h2>La surface et les caractéristiques du lot</h2>
      <p>
        Surface habitable, nombre de pièces, étage, présence d&apos;annexes (balcon, cave, parking) : ces informations
        doivent correspondre exactement à ce qui figure dans les documents contractuels du programme, pas à une
        estimation arrondie pour l&apos;annonce.
      </p>

      <h2>Le prix et les frais associés</h2>
      <p>
        Le prix affiché doit être sans ambiguïté sur ce qu&apos;il inclut (frais de notaire réduits du neuf, place de
        parking, etc.). Si l&apos;annonce est diffusée par un intermédiaire percevant des honoraires, ceux-ci sont
        généralement à mentionner explicitement.
      </p>

      <h2>Le statut du bien et de la copropriété</h2>
      <p>
        Pour un lot en copropriété (ce qui est le cas de la plupart des programmes collectifs), certaines mentions
        relatives au régime de copropriété peuvent être attendues selon l&apos;avancement de la commercialisation et
        le support de diffusion utilisé.
      </p>

      <h2>Pourquoi ce n&apos;est pas qu&apos;une formalité</h2>
      <p>
        Une annonce incomplète ou approximative sur ces points peut retarder une vente, créer un désaccord avec un
        acquéreur qui découvre une information tardivement, ou exposer à un contrôle. À l&apos;échelle d&apos;un
        programme avec plusieurs dizaines de lots, s&apos;assurer que chaque annonce reprend systématiquement les mêmes
        informations obligatoires — sans variation d&apos;un lot à l&apos;autre par oubli — devient un vrai enjeu
        opérationnel, pas seulement juridique.
      </p>
    </BlogArticleLayout>
  );
}
