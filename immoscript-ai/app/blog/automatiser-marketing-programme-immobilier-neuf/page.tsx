import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import { BLOG_POSTS } from "@/lib/blog/posts";

const post = BLOG_POSTS.find((p) => p.slug === "automatiser-marketing-programme-immobilier-neuf")!;

export const metadata = {
  title: `${post.title} — ImmoScript AI`,
  description: post.excerpt,
};

export default function Article() {
  return (
    <BlogArticleLayout title={post.title} date={post.date}>
      <p>
        Un programme immobilier neuf ne se vend pas avec une seule annonce. Il faut une annonce pour chaque portail
        (SeLoger, Bien&apos;ici, Logic-Immo...), des posts pour les réseaux sociaux, parfois un script pour une vidéo
        de présentation — et tout ça pour chaque lot ou chaque typologie disponible. Multiplié par plusieurs
        programmes en commercialisation en parallèle, la production de contenu devient vite le goulot
        d&apos;étranglement de l&apos;équipe marketing ou commerciale.
      </p>

      <h2>Le problème n&apos;est pas la créativité, c&apos;est la répétition</h2>
      <p>
        Rédiger une bonne annonce demande de la réflexion. Mais rédiger la 40e variante de la même annonce pour un
        lot légèrement différent (2 m² de plus, un étage en plus, une exposition différente) ne demande pas de
        créativité supplémentaire — seulement du temps. C&apos;est cette partie répétitive qui peut être déléguée.
      </p>

      <h2>Ce que gagne une équipe qui automatise cette étape</h2>
      <ul>
        <li>Du temps commercial récupéré : moins d&apos;heures passées à rédiger, plus de temps pour les visites et les clients.</li>
        <li>Une cohérence de marque : le même ton, les mêmes informations clés reprises sur tous les formats et tous les lots.</li>
        <li>Moins d&apos;oublis : les informations obligatoires (DPE, surface, prix) saisies une fois, reprises partout sans ressaisie manuelle.</li>
      </ul>

      <h2>Comment ImmoScript AI aborde ce problème</h2>
      <p>
        Le principe est simple : vous renseignez les informations du programme et du lot une seule fois (surface,
        localisation, prestations, diagnostics...). ImmoScript AI génère ensuite en parallèle l&apos;annonce longue, les
        déclinaisons pour les réseaux sociaux et un script vidéo, en ne réutilisant que les informations que vous avez
        fournies — sans inventer de détails qui ne figurent pas dans votre saisie.
      </p>
      <p>
        L&apos;objectif n&apos;est pas de remplacer le jugement humain sur la stratégie commerciale d&apos;un programme, mais de
        supprimer le temps perdu sur la partie mécanique de la rédaction, pour le réinvestir ailleurs.
      </p>
    </BlogArticleLayout>
  );
}
