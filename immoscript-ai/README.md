# ImmoScript AI

Génération de contenu commercial (annonces, réseaux sociaux, scripts vidéo) pour les
promoteurs immobiliers, à partir des programmes et lots qu'ils ont saisis.

Voir [`../docs/immoscript-architecture.md`](../docs/immoscript-architecture.md) pour le
document d'architecture complet (concept, schéma de données, plan de phases).

## État actuel

**Phase 0 (socle technique)** et une première tranche verticale de la **Phase 1** sont
implémentées :

- Next.js 15 (App Router) + TypeScript strict + Tailwind CSS
- Auth Clerk avec Organizations (multi-tenant), rôles ADMIN / PROMOTEUR / COLLABORATEUR
- Prisma + PostgreSQL, avec un client scopé par organisation (`lib/db/scoped-client.ts`)
  qui injecte automatiquement `organizationId` sur toutes les requêtes métier
- CRUD Programme (API + UI), avec scoping par accès explicite pour les Collaborateurs
- `AIService` (Anthropic, tool-use forcé + validation Zod + 1 retry automatique)
- Génération de contenu à l'unité ou en batch (`POST /api/generate`), régénération
  unitaire (`POST /api/contents/:id/regenerate`), édition manuelle
  (`PATCH /api/contents/:id`)
- Page Générateur (positionnement, cible, ton, CTA, checklist de types de contenu,
  paramètres vidéo) + affichage des résultats (copier / modifier / régénérer)

Voir le plan de phases du document d'architecture pour la suite (au-delà de ce qui est
listé ci-dessus).

## Démarrage

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Copier `.env.example` en `.env.local` et renseigner les clés :

   ```bash
   cp .env.example .env.local
   ```

   - `DATABASE_URL` : une base Postgres (Neon ou Vercel Postgres recommandés)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` : depuis le dashboard Clerk
     (activer **Organizations**, et créer un rôle custom `org:promoteur` en plus des
     rôles par défaut `org:admin` / `org:member` — voir `lib/auth.ts`)
   - `ANTHROPIC_API_KEY` : clé API Anthropic
   - `RESEND_API_KEY` / `DIGEST_FROM_EMAIL` / `CRON_SECRET` (optionnels) : digest hebdomadaire
     par email — voir "Digest hebdomadaire" ci-dessous
   - `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRICE_*` (optionnels) :
     facturation par abonnement — voir "Facturation" ci-dessous
   - `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` (optionnels) : monitoring d'erreurs —
     voir "Monitoring" ci-dessous
   - `SUPPORT_EMAIL` (optionnel) : adresse affichée comme canal de support dans l'app

3. Appliquer le schéma à la base :

   ```bash
   npm run prisma:migrate
   ```

4. Lancer le serveur de développement :

   ```bash
   npm run dev
   ```

5. Ouvrir [http://localhost:3000](http://localhost:3000), se connecter, créer une
   organisation, puis un programme.

## Digest hebdomadaire

Un job cron (`GET /api/cron/weekly-digest`) envoie un résumé hebdomadaire (générations
IA du mois, nouveaux contenus de la semaine) à chaque utilisateur de chaque
organisation. Fonctionnement :

- Route publique côté Clerk (exclue du middleware d'auth, voir `middleware.ts`) mais
  protégée par un secret partagé : la requête doit porter `Authorization: Bearer
  <CRON_SECRET>`, sinon 401. Sans `CRON_SECRET` défini, la route répond 501 (désactivée).
- Sans `RESEND_API_KEY`, la route répond 200 sans rien envoyer — le digest est un bonus,
  jamais un point de blocage du reste de l'app.
- `vercel.json` déclenche cette route chaque lundi 8h UTC si l'app est déployée sur
  Vercel (Vercel Cron). Sur un autre hébergeur, planifier un appel HTTP équivalent
  (ex: cron système + `curl`) avec le même header d'autorisation.

## Facturation

Abonnement par plan (`lib/billing/plans.ts` : Essai gratuit / Starter / Pro / Agence),
géré via Stripe Checkout + Billing Portal :

- Onglet **Facturation** dans les paramètres (visible ADMIN/PROMOTEUR uniquement) :
  usage du mois, changement de plan, accès au portail client Stripe.
- `POST /api/billing/checkout` démarre un abonnement (Stripe Checkout Session) ;
  `POST /api/billing/portal` ouvre le portail Stripe (moyen de paiement, factures,
  résiliation) — tous deux nécessitent `STRIPE_SECRET_KEY` et le Price ID du plan
  concerné (`STRIPE_PRICE_STARTER` / `_PRO` / `_AGENCY`), sinon 501.
- `POST /api/billing/webhook` (route publique, authentifiée par signature Stripe via
  `STRIPE_WEBHOOK_SECRET`, pas par session Clerk) est la source de vérité du plan actif
  d'une organisation : elle applique `customer.subscription.created/updated/deleted` à
  `Organization.plan`. À configurer côté Stripe Dashboard sur
  `<votre domaine>/api/billing/webhook`.
- Sans `STRIPE_SECRET_KEY`, toute la facturation répond 501 (`billing_not_configured`)
  plutôt que de planter — utile en dev/démo avant de brancher un compte Stripe réel.

## Monitoring

Erreurs (client, serveur, edge) capturées via [Sentry](https://sentry.io) (`@sentry/nextjs`) :

- `instrumentation.ts` (Node/Edge) + `instrumentation-client.ts` (navigateur) initialisent le
  SDK et capturent automatiquement les erreurs non gérées des Server Components et Route
  Handlers (`onRequestError`), sans avoir à instrumenter chaque route individuellement.
- `app/error.tsx` / `app/global-error.tsx` : capture manuelle en plus de l'affichage de l'écran
  d'erreur, pour les erreurs de rendu React qui remontent jusqu'à ces limites.
- Sans `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`, `Sentry.init` ne fait rien (aucun envoi) — comme
  pour Stripe/Resend, la fonctionnalité est simplement absente tant que le compte n'est pas créé.
- `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` (optionnels, build uniquement) : upload
  des source maps pour des stack traces lisibles en production — sans eux, `next build` fonctionne
  normalement, juste sans source maps côté Sentry.

## Pages légales et support

- `/mentions-legales`, `/cgu`, `/cgv`, `/confidentialite` : pages publiques (routes
  déclarées dans `middleware.ts`), avec l'identité de la société en placeholders
  (`lib/legal/company.ts`) tant qu'aucune société n'est immatriculée — **à remplacer et
  à faire relire par un juriste avant toute mise en ligne publique**. Le contenu des CGV
  (grille tarifaire) se dérive automatiquement de `lib/billing/plans.ts`.
- Canal de support : une adresse e-mail (`SUPPORT_EMAIL`), affichée via un lien
  "Contacter le support" dans l'app et sur la page d'accueil. La page `/admin/feedback`
  affiche l'auteur de chaque retour avec un lien `mailto:` pré-rempli pour y répondre
  directement.

## Points d'architecture à connaître

- **Ne jamais importer `lib/prisma.ts` directement dans du code métier.** Toute lecture/
  écriture doit passer par `authContext.db`, fourni par `getAuthContext()`
  (`lib/auth.ts`) — c'est ce qui garantit l'étanchéité multi-tenant.
- Chaque route API protégée s'écrit avec `withOrgAuth` (`lib/with-org-auth.ts`), qui
  résout la session Clerk, scope le client Prisma, et peut exiger un rôle minimum.
- Chaque appel de génération IA produit **un seul type de contenu** (`AIService.
  generateContent`) ; un clic "Générer" sur plusieurs types crée une `GenerationRequest`
  et lance un appel par type en parallèle (`ContentService.generateBatch`), ce qui
  permet la régénération unitaire d'un seul contenu sans toucher aux autres.
