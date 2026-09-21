import { COMPANY } from "@/lib/legal/company";

export const metadata = { title: "Mentions légales — ImmoScript AI" };

export default function MentionsLegalesPage() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p>Dernière mise à jour : 21 septembre 2026.</p>

      <h2>Éditeur du site</h2>
      <p>
        Le site et le service ImmoScript AI sont édités par {COMPANY.legalName}, {COMPANY.legalForm} au
        capital social de {COMPANY.shareCapital}, immatriculée au {COMPANY.rcsCityAndNumber} sous le numéro
        SIRET {COMPANY.siret}, numéro de TVA intracommunautaire {COMPANY.vatNumber}, dont le siège social est
        situé au {COMPANY.address}.
      </p>
      <p>Directeur de la publication : {COMPANY.publicationDirector}.</p>
      <p>Contact : {COMPANY.contactEmail}.</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par {COMPANY.hostingProvider}, {COMPANY.hostingAddress}, {COMPANY.hostingPhone}.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site (textes, graphismes, logo, logiciel) est protégé par le droit
        d&apos;auteur et le droit des marques. Toute reproduction non autorisée est interdite.
      </p>

      <h2>Contenus générés par l&apos;intelligence artificielle</h2>
      <p>
        ImmoScript AI génère du contenu marketing à partir des informations que vous saisissez sur vos
        programmes et lots immobiliers, à l&apos;aide d&apos;un modèle d&apos;intelligence artificielle
        (Anthropic Claude). Ce contenu est une proposition de rédaction : il reste sous votre responsabilité
        de le relire et de le valider avant toute diffusion, notamment au regard des obligations légales
        applicables aux annonces immobilières (mentions DPE, ALUR, copropriété, etc.).
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement des données personnelles est détaillé dans notre{" "}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>
    </>
  );
}
