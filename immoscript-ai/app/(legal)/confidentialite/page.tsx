import { COMPANY } from "@/lib/legal/company";

export const metadata = { title: "Politique de confidentialité — ImmoScript AI" };

export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p>Dernière mise à jour : 21 septembre 2026.</p>

      <h2>1. Responsable de traitement</h2>
      <p>
        {COMPANY.legalName}, {COMPANY.address}, est responsable du traitement des données personnelles
        décrit ci-dessous. Pour toute question ou exercice de vos droits : {COMPANY.contactEmail}.
      </p>

      <h2>2. Données que nous traitons</h2>
      <ul>
        <li>
          <strong>Compte et organisation</strong> : nom, e-mail, rôle au sein de votre organisation (via
          Clerk, notre prestataire d&apos;authentification).
        </li>
        <li>
          <strong>Données de facturation</strong> : plan souscrit, historique de paiement, géré par Stripe —
          nous ne stockons jamais votre numéro de carte bancaire.
        </li>
        <li>
          <strong>Contenu métier</strong> : les informations que vous saisissez sur vos programmes et lots
          immobiliers (adresse, description, prix, photos), ainsi que le contenu marketing généré à partir
          de ces informations.
        </li>
        <li>
          <strong>Données techniques</strong> : journaux d&apos;erreurs applicatives (via Sentry), en cas de
          dysfonctionnement du service.
        </li>
      </ul>

      <h2>3. Finalités et bases légales</h2>
      <ul>
        <li>Fourniture du service (génération de contenu, gestion de compte) — exécution du contrat.</li>
        <li>Facturation de votre abonnement — exécution du contrat et obligations comptables/fiscales.</li>
        <li>Sécurité et prévention des abus (quotas, détection d&apos;anomalies) — intérêt légitime.</li>
        <li>
          Envoi du résumé hebdomadaire par e-mail (optionnel, activable par votre organisation) — intérêt
          légitime / consentement selon le paramétrage.
        </li>
      </ul>

      <h2>4. Sous-traitants et destinataires</h2>
      <p>Nous faisons appel aux prestataires suivants, chacun agissant en tant que sous-traitant :</p>
      <ul>
        <li><strong>Clerk</strong> — authentification et gestion des comptes/organisations.</li>
        <li><strong>Anthropic</strong> — génération du contenu marketing par intelligence artificielle, à partir des données de vos programmes et lots.</li>
        <li><strong>Stripe</strong> — traitement des paiements et de la facturation.</li>
        <li><strong>Resend</strong> — envoi des e-mails transactionnels (résumé hebdomadaire).</li>
        <li><strong>Sentry</strong> — suivi des erreurs techniques du service.</li>
        <li><strong>{COMPANY.hostingProvider}</strong> — hébergement de l&apos;infrastructure et de la base de données.</li>
      </ul>
      <p>
        Ces prestataires ne traitent vos données que pour le compte d&apos;ImmoScript AI et dans la limite
        de ce qui est nécessaire à la fourniture de leur service.
      </p>

      <h2>5. Durée de conservation</h2>
      <p>
        Les données de votre compte et de votre organisation sont conservées pendant toute la durée de votre
        abonnement, puis supprimées ou anonymisées dans un délai raisonnable après la résiliation de votre
        compte, sauf obligation légale de conservation plus longue (données de facturation notamment).
      </p>

      <h2>6. Vos droits</h2>
      <p>
        Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un
        droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de
        portabilité de vos données personnelles. Vous pouvez exercer ces droits en nous contactant à{" "}
        {COMPANY.contactEmail}. Vous disposez également du droit d&apos;introduire une réclamation auprès de
        la CNIL (www.cnil.fr).
      </p>

      <h2>7. Cookies</h2>
      <p>
        Le service utilise des cookies strictement nécessaires à son fonctionnement (authentification via
        Clerk, préférences d&apos;affichage). Aucun cookie publicitaire ou de mesure d&apos;audience tiers
        n&apos;est utilisé à ce jour.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        Chaque organisation cliente ne peut accéder qu&apos;à ses propres données : l&apos;isolation entre
        organisations est appliquée au niveau de l&apos;application sur l&apos;ensemble des accès aux
        données. Les accès sont protégés par une authentification et un contrôle des rôles.
      </p>
    </>
  );
}
