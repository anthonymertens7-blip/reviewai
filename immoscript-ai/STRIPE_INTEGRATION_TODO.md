# Intégration Stripe Checkout — récapitulatif

Scénario détecté : **A — appel Checkout Session existant**, dans
[app/api/billing/checkout/route.ts](app/api/billing/checkout/route.ts). Les paramètres configurés
via Checkout Studio (Dashboard Stripe) y ont été ajoutés sans toucher au reste du fichier.

## Écart volontaire par rapport au prompt Checkout Studio

Le prompt généré par Checkout Studio demande de retirer tout paramètre absent de sa liste de
"Field Intents". Cette règle n'a **pas** été appliquée à `customer`, `client_reference_id` et
`metadata` : ce sont eux qui relient un paiement Stripe à une organisation ImmoScript AI via le
webhook ([app/api/billing/webhook/route.ts](app/api/billing/webhook/route.ts)). Les supprimer
aurait cassé l'activation du plan après paiement (Stripe aurait créé un nouveau client à chaque
checkout au lieu de réutiliser celui de l'organisation).

## Values to Replace

Aucune — `mode`, `success_url`, `cancel_url` et `line_items[].price` utilisent déjà des valeurs
réelles et dynamiques (plan choisi, organisation, domaine courant), pas des placeholders.

## Configured Parameters

Ces paramètres viennent de Checkout Studio (compte Stripe `reviewAI`, mode live) et sont déjà
correctement en place.

**Fichier concerné :**
- [app/api/billing/checkout/route.ts](app/api/billing/checkout/route.ts)

| Parameter | Value |
|-----------|-------|
| ui_mode | hosted_page |
| billing_address_collection | auto |
| phone_number_collection | { enabled: false } |
| automatic_tax | { enabled: false } |
| allow_promotion_codes | false |
| payment_method_collection | always |
| submit_type | auto |
| saved_payment_method_options | { payment_method_save: "enabled" } |
| integration_identifier | hosted_web_0001 |
| origin_context | web |

## Fonctionnement

`POST /api/billing/checkout` (voir [lib/billing/plans.ts](lib/billing/plans.ts) pour les 3 plans
payants — Starter/Pro/Agency) :
1. Crée le client Stripe de l'organisation s'il n'existe pas encore (réutilisé ensuite).
2. Si l'organisation a déjà un abonnement actif, modifie son prix directement (upgrade/downgrade
   avec proration) au lieu de repasser par Checkout.
3. Sinon, crée une session Checkout Stripe (paramètres ci-dessus) et redirige vers `session.url`.
4. Le webhook Stripe (`customer.subscription.created/updated/deleted`) est la seule source de
   vérité qui écrit `Organization.plan` — voir `lib/billing/subscriptionStatus.ts`.

## Prochaines étapes

- Aucune clé/URL supplémentaire à configurer : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` et les
  3 `STRIPE_PRICE_*` sont déjà posées dans Vercel (mode live, compte `reviewAI`).
- Tester un vrai paiement (carte réelle) sur le plan le moins cher pour valider de bout en bout,
  puis rembourser depuis le Dashboard Stripe si besoin.
- Ressources : https://support.stripe.com et https://docs.stripe.com/mcp
