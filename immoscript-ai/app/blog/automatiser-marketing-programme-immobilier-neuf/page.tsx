import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import { BLOG_POSTS } from "@/lib/blog/posts";

const post = BLOG_POSTS.find((p) => p.slug === "automatiser-marketing-programme-immobilier-neuf")!;

export const metadata = {
  title: post.title,
  description: post.excerpt,
};

export default function Article() {
  return (
    <BlogArticleLayout title={post.title} date={post.date}>
      <p>
        Un bien ne se vend pas avec une seule annonce. Il faut une annonce pour chaque portail (SeLoger,
        Bien&apos;ici, Leboncoin...), des posts pour les réseaux sociaux, parfois un script pour une vidéo de
        visite — et ça recommence à chaque nouveau mandat. Multiplié par le nombre de biens en portefeuille en
        parallèle, la production de contenu devient vite le goulot d&apos;étranglement de la semaine, au détriment
        du temps passé avec les clients.
      </p>

      <h2>Le problème n&apos;est pas la créativité, c&apos;est la répétition</h2>
      <p>
        Rédiger une bonne annonce demande de la réflexion. Mais rédiger la 10e annonce de la semaine pour un bien aux
        caractéristiques différentes (surface, étage, exposition) ne demande pas de créativité supplémentaire —
        seulement du temps. C&apos;est cette partie répétitive qui peut être déléguée.
      </p>

      <h2>Ce que gagne un agent qui automatise cette étape</h2>
      <ul>
        <li>Du temps commercial récupéré : moins d&apos;heures passées à rédiger, plus de temps pour les visites et les clients.</li>
        <li>Une cohérence de marque : le même ton, les mêmes informations clés reprises sur tous les formats et tous les biens.</li>
        <li>Moins d&apos;oublis : les informations obligatoires (DPE, surface, prix) saisies une fois, reprises partout sans ressaisie manuelle.</li>
      </ul>

      <h2>Comment ImmoScript AI aborde ce problème</h2>
      <p>
        Le principe est simple : vous renseignez les informations du bien une seule fois (surface, localisation,
        prestations, diagnostics...). ImmoScript AI génère ensuite en parallèle l&apos;annonce longue, les
        déclinaisons pour les réseaux sociaux et un script vidéo, en ne réutilisant que les informations que vous avez
        fournies — sans inventer de détails qui ne figurent pas dans votre saisie.
      </p>
      <p>
        L&apos;objectif n&apos;est pas de remplacer votre connaissance du bien et de ses acheteurs potentiels, mais de
        supprimer le temps perdu sur la partie mécanique de la rédaction, pour le réinvestir ailleurs.
      </p>
    </BlogArticleLayout>
  );
}
