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

**Pas encore fait** (voir le plan de phases du document d'architecture) : quotas/usage
réels, facturation Stripe, invitations d'équipe via Clerk, export PDF/DOCX, panel admin,
monitoring Sentry.

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
