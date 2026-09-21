import { COMPANY } from "@/lib/legal/company";

export const metadata = { title: "Conditions générales d'utilisation — ImmoScript AI" };

export default function CguPage() {
  return (
    <>
      <h1>Conditions générales d&apos;utilisation</h1>
      <p>Dernière mise à jour : 21 septembre 2026.</p>

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales d&apos;utilisation (« CGU ») régissent l&apos;accès et
        l&apos;usage du service ImmoScript AI, édité par {COMPANY.legalName} (voir nos{" "}
        <a href="/mentions-legales">mentions légales</a>), par toute organisation et tout utilisateur
        (« vous ») disposant d&apos;un compte. ImmoScript AI est un service B2B réservé aux professionnels
        de la promotion et de la commercialisation immobilière.
      </p>

      <h2>2. Compte et organisation</h2>
      <p>
        L&apos;accès au service nécessite la création d&apos;un compte et d&apos;une organisation.
        L&apos;administrateur d&apos;une organisation peut inviter d&apos;autres utilisateurs et leur
        attribuer un rôle (Administrateur, Promoteur, Collaborateur) déterminant leurs permissions au sein
        de l&apos;organisation. Vous êtes responsable de la confidentialité de vos identifiants et de toute
        activité réalisée depuis votre compte.
      </p>

      <h2>3. Contenu généré par intelligence artificielle</h2>
      <p>
        Le service génère, à partir des informations que vous saisissez, des propositions de contenu
        marketing (annonces, réseaux sociaux, scripts vidéo) à l&apos;aide d&apos;un modèle d&apos;IA. Ce
        contenu :
      </p>
      <ul>
        <li>est une proposition de rédaction, pas un contenu validé prêt à diffuser sans relecture ;</li>
        <li>
          reste, une fois publié par vous, sous votre entière responsabilité — y compris le respect des
          obligations légales applicables aux annonces immobilières (DPE, loi ALUR, mentions de
          copropriété, etc.) ;
        </li>
        <li>
          n&apos;utilise que les informations que vous avez renseignées sur vos programmes et lots ; le
          service s&apos;interdit d&apos;inventer des caractéristiques non fournies, mais ne garantit pas
          l&apos;absence totale d&apos;erreur — toute génération doit être relue avant diffusion.
        </li>
      </ul>

      <h2>4. Usage autorisé</h2>
      <p>Vous vous engagez à ne pas :</p>
      <ul>
        <li>utiliser le service à des fins illicites ou pour publier du contenu trompeur ou diffamatoire ;</li>
        <li>
          tenter de contourner les quotas d&apos;utilisation, les mesures de sécurité, ou d&apos;accéder à
          des données d&apos;une autre organisation ;
        </li>
        <li>revendre ou sous-licencier l&apos;accès au service sans accord écrit préalable.</li>
      </ul>

      <h2>5. Quotas et abonnement</h2>
      <p>
        L&apos;usage du service (nombre de générations de contenu par mois) est soumis à un quota qui dépend
        du plan souscrit par votre organisation. Les modalités de facturation sont détaillées dans nos{" "}
        <a href="/cgv">conditions générales de vente</a>.
      </p>

      <h2>6. Disponibilité et évolution du service</h2>
      <p>
        Nous nous efforçons d&apos;assurer une disponibilité continue du service, sans garantie
        d&apos;absence totale d&apos;interruption (maintenance, incident technique, indisponibilité
        d&apos;un fournisseur tiers). Les fonctionnalités du service peuvent évoluer ; nous informons les
        utilisateurs des changements significatifs.
      </p>

      <h2>7. Résiliation</h2>
      <p>
        Vous pouvez cesser d&apos;utiliser le service et résilier votre abonnement à tout moment depuis les
        paramètres de facturation. En cas de manquement grave aux présentes CGU, nous nous réservons le
        droit de suspendre ou résilier votre accès au service, après notification lorsque cela est possible.
      </p>

      <h2>8. Contact</h2>
      <p>Pour toute question relative aux présentes CGU : {COMPANY.contactEmail}.</p>
    </>
  );
}
