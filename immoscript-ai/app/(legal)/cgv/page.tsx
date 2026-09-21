import { COMPANY } from "@/lib/legal/company";
import { PLANS, PLAN_ORDER, formatPlanPrice } from "@/lib/billing/plans";

export const metadata = { title: "Conditions générales de vente — ImmoScript AI" };

export default function CgvPage() {
  return (
    <>
      <h1>Conditions générales de vente</h1>
      <p>Dernière mise à jour : 21 septembre 2026.</p>

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales de vente (« CGV ») s&apos;appliquent à tout abonnement au
        service ImmoScript AI souscrit auprès de {COMPANY.legalName}. Le service est réservé aux
        professionnels (relation B2B) ; les dispositions du code de la consommation relatives aux
        particuliers ne s&apos;appliquent pas.
      </p>

      <h2>2. Plans et tarifs</h2>
      <ul>
        {PLAN_ORDER.map((planId) => {
          const config = PLANS[planId];
          return (
            <li key={planId}>
              <strong>{config.label}</strong> —{" "}
              {config.priceEurCents === 0 ? "gratuit" : `${formatPlanPrice(config.priceEurCents)} TTC / mois`},{" "}
              {config.monthlyQuota} générations de contenu par mois.
            </li>
          );
        })}
      </ul>
      <p>
        Les tarifs affichés dans le service au moment de la souscription font foi. Nous nous réservons le
        droit de faire évoluer la grille tarifaire ; toute modification est sans effet sur un abonnement en
        cours jusqu&apos;à son prochain renouvellement, dont vous êtes informé à l&apos;avance.
      </p>

      <h2>3. Souscription et paiement</h2>
      <p>
        La souscription à un plan payant s&apos;effectue depuis les paramètres de facturation du service, via
        notre prestataire de paiement Stripe. L&apos;abonnement est mensuel, reconduit tacitement chaque
        mois par prélèvement automatique sur le moyen de paiement enregistré, jusqu&apos;à résiliation.
      </p>

      <h2>4. Quotas et dépassement</h2>
      <p>
        Chaque plan inclut un quota mensuel de générations de contenu IA, réinitialisé au début de chaque
        période de facturation. Le quota non consommé sur une période ne se reporte pas sur la suivante.
        Un changement de plan en cours de mois ne s&apos;applique qu&apos;au quota du mois suivant.
      </p>

      <h2>5. Résiliation et remboursement</h2>
      <p>
        Vous pouvez résilier votre abonnement à tout moment depuis le portail de gestion Stripe, accessible
        depuis les paramètres de facturation. La résiliation prend effet à la fin de la période déjà payée ;
        aucun remboursement au prorata n&apos;est effectué pour la période en cours, sauf disposition légale
        contraire.
      </p>

      <h2>6. Facturation</h2>
      <p>
        Une facture est émise par Stripe pour chaque paiement et vous est transmise par e-mail ainsi que
        via le portail de gestion de votre abonnement.
      </p>

      <h2>7. Contact</h2>
      <p>Pour toute question relative à la facturation : {COMPANY.contactEmail}.</p>
    </>
  );
}
