import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import { BLOG_POSTS } from "@/lib/blog/posts";

const post = BLOG_POSTS.find((p) => p.slug === "rediger-annonce-immobiliere-neuve-qui-convertit")!;

export const metadata = {
  title: `${post.title} — ImmoScript AI`,
  description: post.excerpt,
};

export default function Article() {
  return (
    <BlogArticleLayout title={post.title} date={post.date}>
      <p>
        Un acheteur qui cherche un logement neuf voit défiler des dizaines d&apos;annonces qui se ressemblent :
        &quot;cadre exceptionnel&quot;, &quot;prestations haut de gamme&quot;, &quot;emplacement privilégié&quot;.
        Ces formules ne disent rien de concret et finissent par se neutraliser entre elles. Ce qui retient
        l&apos;attention, c&apos;est le détail précis et vérifiable.
      </p>

      <h2>Préférer le concret au générique</h2>
      <p>
        &quot;Vue dégagée sur la Garonne depuis le balcon&quot; convainc davantage que &quot;vue exceptionnelle&quot;.
        &quot;Tramway à 4 minutes à pied&quot; convainc davantage que &quot;proche des transports&quot;. Chaque
        superlatif vague peut presque toujours être remplacé par un fait précis tiré des caractéristiques réelles du
        bien.
      </p>

      <h2>Structurer l&apos;information par ordre de priorité</h2>
      <ul>
        <li>Le titre : la typologie, la localisation et l&apos;élément le plus différenciant du lot.</li>
        <li>Les premières lignes : ce qu&apos;un acheteur presse doit absolument savoir (surface, nombre de pièces, prix, disponibilité).</li>
        <li>Le corps du texte : l&apos;environnement, les prestations, les atouts spécifiques du lot.</li>
        <li>La fin : les informations réglementaires et un appel à l&apos;action clair (visite, contact).</li>
      </ul>

      <h2>Adapter le ton au canal, pas seulement le format</h2>
      <p>
        Une annonce sur un portail immobilier peut se permettre d&apos;être plus détaillée et factuelle. Un post
        réseau social doit accrocher en une phrase et donner envie de cliquer. Un script vidéo doit se dire à voix
        haute et respecter un rythme. Trois formats, trois écritures — c&apos;est souvent là que la rédaction manuelle
        prend le plus de temps, puisqu&apos;il ne suffit pas de raccourcir le même texte.
      </p>

      <h2>Ne jamais inventer un détail qui n&apos;existe pas</h2>
      <p>
        Une annonce qui enjolive un détail inexistant (une vue qui n&apos;existe pas, une prestation non confirmée)
        expose à la déception du visiteur, voire à un litige. La règle la plus sûre reste de ne décrire que ce qui est
        réellement vérifié sur le programme.
      </p>
    </BlogArticleLayout>
  );
}
