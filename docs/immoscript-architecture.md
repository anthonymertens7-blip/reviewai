# ImmoScript AI — Document d'architecture (v1 — à valider avant implémentation)

Ce document couvre les étapes 1 à 8 demandées avant tout développement : analyse du concept, architecture technique, schéma de données, arborescence, API, composants frontend, système de prompts IA, et plan d'implémentation. Rien n'est codé tant que ce document n'est pas validé (étape 9).

---

## Étape 1 — Analyse du concept et failles identifiées

Le concept est solide : B2B, besoin concret et récurrent (production de contenu commercial), cible avec budget, use case qui fait gagner un temps mesurable. Voici les points qui doivent être tranchés ou surveillés avant de coder, parce qu'ils changent des choix structurants :

1. **Coût IA vs modèle de facturation.** Un seul clic sur "Générer" peut produire 8 à 15 contenus différents (annonce longue, courte, portail, site, 4 réseaux sociaux, plusieurs scripts vidéo × plusieurs angles). Le coût en tokens API par génération complète n'est pas négligeable. Il faut des quotas par plan dès la conception (pas ajoutés après coup), sinon le service perd de l'argent sur les premiers clients actifs.
2. **Étanchéité multi-tenant.** Le risque numéro un d'un SaaS B2B multi-tenant est qu'une requête oublie de filtrer par organisation et expose les données d'un promoteur à un autre. Ça doit être imposé au niveau de l'architecture (un point d'accès unique aux données qui injecte automatiquement le tenant), pas laissé à la discipline de chaque développeur.
3. **Régénération unitaire.** Le besoin réel n'est pas "tout régénérer" mais "je n'aime pas ce script TikTok, régénère juste celui-là". L'API doit être pensée dès le départ pour générer/régénérer un contenu à l'unité, pas uniquement en gros batch.
4. **Fiabilité factuelle (règle absolue du brief).** Une contrainte de prompt seule ("n'invente rien") ne suffit pas à garantir zéro hallucination. Il faut une deuxième ligne de défense : le prompt liste explicitement les champs fournis et interdit toute mention d'un champ absent, et l'UI affiche clairement au promoteur quels champs étaient vides avant qu'il publie un contenu généré (relecture humaine avant diffusion = garde-fou réel).
5. **Rôle Collaborateur = accès scoped, pas un rôle plat.** "Accès aux programmes autorisés" implique une relation many-to-many entre utilisateurs et programmes, pas juste un rôle "collaborateur" au niveau de l'organisation.
6. **Versionning des prompts.** Chaque contenu généré doit être rattaché à la version du prompt qui l'a produit, sinon impossible d'auditer une génération problématique ou d'améliorer un prompt sans casser la traçabilité de l'historique.
7. **Portails immobiliers = format générique en V1.** SeLoger, Bien'ici, Leboncoin ont chacun leurs contraintes de longueur/format. Les gérer un par un est un travail de V2 ; le MVP doit proposer un format "portail" générique.
8. **Export.** Le brief demande "export" sans préciser le format. Proposition : copier-coller + export texte brut en MVP, PDF/DOCX en V2 (le format le plus utile pour un commercial terrain).

Ces points sont repris dans l'architecture et le plan ci-dessous plutôt que laissés en l'air.

---

## Étape 2 — Architecture technique

### Choix de stack — un point à valider avec toi

Ton profil actuel est Vite/React + Clerk + Vercel + Stripe + API Anthropic. Pour ce projet précis, je recommande **Next.js (App Router)** plutôt que Vite/React pur, pour des raisons concrètes, pas par dogme :

- Vite/React est une SPA côté client : elle n'a pas de backend. Il t'en faudrait un séparé (Express, par exemple) pour appeler l'API Anthropic (jamais depuis le navigateur — la clé serait exposée) et pour recevoir les webhooks Stripe. Ça fait deux projets à déployer et à synchroniser.
- Next.js sur Vercel te donne le frontend et le backend (Route Handlers) dans un seul projet, un seul déploiement, et les clés secrètes restent côté serveur nativement.
- Clerk a une intégration Next.js de premier ordre, avec un concept **Organizations** qui correspond exactement à ton besoin multi-tenant : une Organisation Clerk = un promoteur/une entreprise, avec des rôles membres. Ça t'évite de reconstruire à la main la gestion d'équipe/invitations/rôles.

Si tu préfères rester sur Vite/React (par exemple parce que tu es plus à l'aise dessus), c'est faisable, mais il faudra un backend séparé (Express ou Fastify, déployé aussi sur Vercel en Serverless Functions) — dis-le-moi et j'adapte tout le reste du document. Pour la suite, je pars sur **Next.js**.

### Stack retenue (proposition)

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework full-stack | Next.js 14+ (App Router), TypeScript strict | Frontend + API dans un seul projet, natif sur Vercel |
| Auth + multi-tenant | Clerk (Organizations) | Gestion native des organisations/rôles/invitations |
| Base de données | PostgreSQL (Neon ou Vercel Postgres) | Managé, compatible Prisma, plan gratuit suffisant pour démarrer |
| ORM | Prisma | Typage fort, migrations claires, bonne courbe d'apprentissage |
| Paiement | Stripe (Billing + Customer Portal) | Déjà connu, webhooks pour synchroniser les quotas |
| IA | API Anthropic (Claude), sortie structurée forcée | Déjà utilisé, structured output fiable via tool-use |
| Validation de schéma | Zod | Valide les sorties IA et les payloads API |
| Déploiement | Vercel | Déjà en place |
| Erreurs / monitoring | Sentry (dès que le produit a des utilisateurs réels) | Visibilité sur les échecs de génération IA en prod |

### Couches applicatives

```
Présentation      → pages App Router (Server Components) + composants client interactifs
API               → Route Handlers Next.js (app/api/**)
Services métier   → ProgramService, LotService, ContentService, AIService, BillingService
Accès aux données → Prisma Client, toujours via un wrapper "tenant-scoped"
Fournisseurs      → Clerk, Stripe, Anthropic API
```

### Sécurité et multi-tenant — mécanisme concret

- Chaque route API vérifie la session Clerk et l'appartenance de l'utilisateur à l'organisation ciblée (middleware `withOrgAuth`).
- Toute requête à la base passe par un wrapper unique (`getScopedPrismaClient(organizationId)` ou équivalent) qui filtre automatiquement par organisation. Un développeur (ou toi dans 6 mois) ne peut pas "oublier" le filtre tenant parce qu'il n'a pas d'autre façon d'accéder aux données.
- Rate limiting sur les routes de génération IA (ex : Upstash Ratelimit) pour éviter qu'un abus fasse exploser la facture Anthropic.
- Aucune clé secrète (Anthropic, Stripe secret key) n'est jamais envoyée au client — uniquement utilisée dans les Route Handlers.

---

## Étape 3 — Schéma de base de données

```prisma
model Organization {
  id            String   @id // = Clerk organization id
  name          String
  plan          String   @default("trial") // trial, starter, pro, agency
  createdAt     DateTime @default(now())
  users         User[]
  programs      Program[]
  usageCounters UsageCounter[]
}

model User {
  id             String   @id // = Clerk user id
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  role           Role     @default(COLLABORATEUR) // ADMIN, PROMOTEUR, COLLABORATEUR
  email          String
  name           String?
  createdAt      DateTime @default(now())
  programAccess  ProgramAccess[]
  generatedBy    GeneratedContent[]
}

enum Role {
  ADMIN
  PROMOTEUR
  COLLABORATEUR
}

model Program {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  name           String
  address        String?
  city           String
  district       String?
  description    String?
  deliveryDate   DateTime?
  programType    String?   // neuf, rénové, ...
  unitsCount     Int?
  environment    String?
  transport      String?
  schools        String?
  shops          String?
  pointsOfInterest String?
  amenities      String?
  features       String?
  advantages     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  lots           Lot[]
  access         ProgramAccess[]
  contents       GeneratedContent[]
}

// Scoping des collaborateurs : accès explicite programme par programme
model ProgramAccess {
  id         String  @id @default(cuid())
  programId  String
  program    Program @relation(fields: [programId], references: [id])
  userId     String
  user       User    @relation(fields: [userId], references: [id])
  @@unique([programId, userId])
}

model Lot {
  id              String   @id @default(cuid())
  programId       String
  program         Program  @relation(fields: [programId], references: [id])
  reference       String
  propertyType    String   // T1, T2, maison, ...
  roomsCount      Int?
  livingArea      Float?
  outdoorArea     Float?
  floor           Int?
  orientation     String?
  exposure        String?
  view            String?
  hasBalcony      Boolean  @default(false)
  hasTerrace      Boolean  @default(false)
  hasGarden       Boolean  @default(false)
  hasParking      Boolean  @default(false)
  hasCellar       Boolean  @default(false)
  price           Float?
  pricePerSqm     Float?
  availability    String?  // disponible, réservé, vendu
  specialFeatures String?
  customFields    Json?    // champs libres du promoteur
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  contents        GeneratedContent[]
}

// Une "requête de génération" = un clic sur Générer, avec ses paramètres marketing
model GenerationRequest {
  id             String   @id @default(cuid())
  programId      String
  lotId          String?
  organizationId String
  requestedById  String
  positioning    String[]  // premium, familial, investissement, ...
  target         String?
  tone           String?
  languageLevel  String?
  length         String?
  commercialGoal String?
  mainArgument   String?
  cta            String?
  requestedTypes String[]  // ["listing_full", "instagram", "video_30s_emotion", ...]
  promptVersion  String    // traçabilité
  status         String    @default("pending") // pending, done, failed
  createdAt      DateTime  @default(now())
  contents       GeneratedContent[]
}

// Un contenu généré individuel = régénérable/éditable indépendamment
model GeneratedContent {
  id                  String   @id @default(cuid())
  generationRequestId String
  generationRequest   GenerationRequest @relation(fields: [generationRequestId], references: [id])
  programId           String
  program             Program  @relation(fields: [programId], references: [id])
  lotId               String?
  lot                 Lot?     @relation(fields: [lotId], references: [id])
  type                String   // listing_full, listing_short, portal, website, instagram,
                                // facebook, linkedin, tiktok, video_script
  angle               String?  // emotion, investissement, visite, storytelling, urgence
  duration            Int?     // pour les scripts vidéo (30, 45, 60)
  content             Json     // structure du contenu (voir étape 7)
  status              String   @default("current") // current, edited, archived
  editedByUserId       String?
  createdByUserId      String
  createdBy            User    @relation(fields: [createdByUserId], references: [id])
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model UsageCounter {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  periodStart    DateTime
  periodEnd      DateTime
  generationsUsed Int     @default(0)
  generationsQuota Int
  @@unique([organizationId, periodStart])
}

model PromptTemplate {
  id        String   @id @default(cuid())
  key       String   // "listing_full", "video_script", ...
  version   Int
  content   String   // le template lui-même
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  @@unique([key, version])
}
```

Points clés du schéma : `organizationId` est présent sur toutes les tables métier de premier niveau (isolation tenant), `ProgramAccess` gère le scoping des collaborateurs, `GenerationRequest` sépare "la demande avec ses paramètres marketing" de `GeneratedContent` ("chaque contenu individuel, régénérable et éditable"), et `PromptTemplate` permet le versionning demandé à l'étape 6 du brief.

---

## Étape 4 — Arborescence du projet

```
immoscript-ai/
├── app/
│   ├── (marketing)/                # site vitrine public (optionnel V1)
│   ├── (app)/
│   │   ├── dashboard/page.tsx
│   │   ├── programs/
│   │   │   ├── page.tsx            # liste des programmes
│   │   │   ├── [programId]/
│   │   │   │   ├── page.tsx        # vue détaillée programme
│   │   │   │   ├── lots/page.tsx
│   │   │   │   └── generate/page.tsx
│   │   ├── library/page.tsx        # bibliothèque / historique
│   │   └── admin/
│   │       ├── users/page.tsx
│   │       ├── subscription/page.tsx
│   │       └── ai-settings/page.tsx
│   ├── api/
│   │   ├── programs/route.ts
│   │   ├── programs/[id]/route.ts
│   │   ├── lots/route.ts
│   │   ├── lots/[id]/route.ts
│   │   ├── generate/route.ts
│   │   ├── contents/[id]/route.ts
│   │   ├── contents/[id]/regenerate/route.ts
│   │   ├── billing/webhook/route.ts
│   │   └── admin/usage/route.ts
│   └── layout.tsx
├── components/
│   ├── dashboard/
│   ├── programs/
│   ├── generator/
│   │   ├── PositioningSelector.tsx
│   │   ├── ContentTypeChecklist.tsx
│   │   └── GenerateButton.tsx
│   ├── results/
│   │   ├── ContentCard.tsx
│   │   ├── VideoScriptCard.tsx
│   │   └── ResultsTabs.tsx
│   └── shared/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts                     # helpers Clerk + tenant scoping
│   ├── ai/
│   │   ├── AIService.ts
│   │   ├── prompts/
│   │   │   ├── listing.ts
│   │   │   ├── social.ts
│   │   │   └── videoScript.ts
│   │   └── schemas.ts              # schémas Zod des sorties IA
│   ├── services/
│   │   ├── ProgramService.ts
│   │   ├── LotService.ts
│   │   ├── ContentService.ts
│   │   └── BillingService.ts
│   └── validation/                 # schémas Zod des payloads API
├── prisma/
│   └── schema.prisma
└── middleware.ts                   # protection des routes + injection organisation active
```

---

## Étape 5 — Routes API

| Méthode | Route | Rôle minimum | Description |
|---|---|---|---|
| GET | `/api/programs` | Collaborateur | Liste des programmes accessibles |
| POST | `/api/programs` | Promoteur | Créer un programme |
| GET | `/api/programs/:id` | Collaborateur (scoped) | Détail d'un programme |
| PATCH | `/api/programs/:id` | Promoteur | Modifier un programme |
| DELETE | `/api/programs/:id` | Admin | Supprimer un programme |
| POST | `/api/programs/:id/lots` | Promoteur | Ajouter un lot |
| PATCH | `/api/lots/:id` | Promoteur | Modifier un lot |
| DELETE | `/api/lots/:id` | Promoteur | Supprimer un lot |
| POST | `/api/generate` | Collaborateur (scoped) | Lancer une génération (liste de types demandés + paramètres marketing) |
| GET | `/api/contents?programId=` | Collaborateur (scoped) | Historique des contenus générés |
| PATCH | `/api/contents/:id` | Collaborateur (scoped) | Éditer un contenu (sauvegarde manuelle) |
| POST | `/api/contents/:id/regenerate` | Collaborateur (scoped) | Régénérer un seul contenu |
| GET | `/api/contents/:id/export` | Collaborateur (scoped) | Export texte/PDF |
| POST | `/api/billing/checkout` | Admin | Créer une session Stripe Checkout |
| POST | `/api/billing/webhook` | — (Stripe signé) | Synchroniser abonnement/quotas |
| GET | `/api/admin/usage` | Admin | Statistiques d'usage de l'organisation |
| GET/PATCH | `/api/admin/ai-settings` | Admin | Paramètres IA (modèle, ton par défaut) |

Chaque route passe par le middleware `withOrgAuth` qui résout l'utilisateur Clerk, son rôle, et l'organisation active, puis vérifie l'accès au programme concerné via `ProgramAccess` pour un Collaborateur.

---

## Étape 6 — Composants frontend

- **Dashboard** : programmes actifs, lots en cours, dernières générations, compteur d'usage/quota du mois.
- **Programs (liste + détail)** : formulaire de création/édition (tous les champs de l'étape 3 du brief), liste des lots associés.
- **Lots** : table éditable avec les caractéristiques du lot, champs libres.
- **Générateur** (`generate/page.tsx`) :
  - `PositioningSelector` : sélection du/des positionnements marketing (premium, familial, investissement, ...).
  - Champs cible / ton / niveau de langage / longueur / objectif / argument principal / CTA.
  - `ContentTypeChecklist` : cases à cocher pour chaque type de contenu (annonce, réseaux sociaux, scripts vidéo par durée).
  - `GenerateButton` avec état de chargement (génération = plusieurs appels IA en parallèle, donc prévoir un état "en cours" par contenu, pas un seul spinner global).
- **Résultats** (`ResultsTabs`) : un onglet ou une carte par contenu généré. `ContentCard` générique (texte + copier/modifier/régénérer/sauvegarder/exporter) et `VideoScriptCard` spécialisé (affichage scène par scène : durée / visuel / voix off / texte overlay).
- **Bibliothèque** : historique filtrable par programme, lot, type, date, avec accès à chaque version.
- **Admin** : gestion utilisateurs et rôles, abonnement (lien Customer Portal Stripe), statistiques d'usage, réglages IA.

---

## Étape 7 — Système de prompts IA

### AIService — couche d'abstraction unique

Aucun appel à l'API Anthropic ne se fait ailleurs que dans `lib/ai/AIService.ts`. Interface :

```ts
interface AIService {
  generateContent(input: {
    type: ContentType;              // "listing_full" | "instagram" | "video_script" | ...
    angle?: VideoAngle;
    duration?: 30 | 45 | 60;
    program: ProgramData;           // uniquement les champs renseignés
    lot?: LotData;
    marketing: MarketingParams;     // positioning, target, tone, cta, ...
    promptVersion?: number;         // sinon = version active
  }): Promise<GeneratedContentPayload>;
}
```

Ça permet de changer de fournisseur de modèle plus tard sans toucher au reste de l'application.

### Structure d'un prompt

1. **System prompt** — rôle (rédacteur immobilier senior), ton par défaut, et surtout la règle anti-hallucination explicite : *"Tu ne dois utiliser que les informations listées ci-dessous. Si une information n'est pas fournie, ne l'invente jamais et ne la mentionne pas."*
2. **Données du bien** — uniquement les champs non vides du programme/lot, sérialisés clairement (pas de `null` envoyés au modèle : on omet le champ plutôt que d'envoyer une valeur vide, pour éviter toute ambiguïté).
3. **Paramètres marketing** — positionnement, cible, ton, longueur, objectif, argument principal, CTA.
4. **Format de sortie** — schéma JSON attendu, imposé via **tool use forcé** (le modèle doit répondre en appelant un "outil" dont le schéma correspond exactement à la sortie voulue) — c'est la manière la plus fiable d'obtenir du JSON structuré valide avec l'API Anthropic, plutôt que de parser du texte libre.
5. **Validation de la réponse** — la sortie du modèle est validée par un schéma **Zod** correspondant. Si la validation échoue, un unique retry automatique ; si ça échoue encore, l'erreur est renvoyée à l'utilisateur plutôt que d'afficher un contenu potentiellement invalide.

### Format de sortie (reprend et adapte celui du brief)

```json
{
  "listing": {
    "title": "...",
    "description": "...",
    "highlights": ["..."],
    "cta": "..."
  },
  "social": {
    "instagram": "...",
    "facebook": "...",
    "linkedin": "...",
    "tiktok": "..."
  },
  "video": {
    "angle": "emotion",
    "duration": 30,
    "hook": "...",
    "scenes": [
      { "time": "0-3", "visual": "...", "voiceover": "...", "textOverlay": "..." }
    ],
    "cta": "..."
  }
}
```

En pratique, chaque appel de génération produit **un seul de ces blocs** (listing, ou social, ou un script vidéo précis), pour permettre la régénération unitaire de l'étape 1. Le front assemble l'ensemble des `GeneratedContent` d'une même `GenerationRequest` pour l'affichage en onglets.

### Versionning

Les templates de prompts vivent dans `lib/ai/prompts/*.ts` **et** sont dupliqués en base (`PromptTemplate`) au moment du déploiement d'une nouvelle version, pour que chaque `GenerationRequest` garde une référence immuable à la version exacte utilisée (audit, comparaison A/B, rollback si une nouvelle version dégrade la qualité).

---

## Étape 8 — Plan d'implémentation par étapes

**Phase 0 — Socle technique**
Initialisation Next.js + TypeScript, Clerk (auth + Organizations), Prisma + base Postgres (Neon), déploiement Vercel vide fonctionnel, CI basique.

**Phase 1 — MVP fonctionnel minimal**
CRUD Programme et Lot, génération IA limitée à l'annonce complète + courte + réseaux sociaux (sans scripts vidéo), page Générateur simple, affichage des résultats avec copier/modifier, pas encore de facturation (accès en essai gratuit limité par un quota fixe en dur).

**Phase 2 — Scripts vidéo**
Génération des scripts vidéo (5 angles × 3 durées), `VideoScriptCard`, régénération unitaire de n'importe quel contenu, bibliothèque/historique avec filtres.

**Phase 3 — Facturation et rôles**
Intégration Stripe complète (Checkout, Customer Portal, webhooks), `UsageCounter` branché aux quotas réels par plan, rôle Collaborateur avec `ProgramAccess`, invitations d'équipe via Clerk Organizations.

**Phase 4 — Admin et qualité**
Panel admin (utilisateurs, stats d'usage, réglages IA), export PDF/DOCX, monitoring des erreurs (Sentry), amélioration itérative des prompts avec le versionning déjà en place.

**Phase 5 — Post-MVP (future-proofing du brief)**
Génération d'images/prompts visuels, calendrier éditorial, publication automatique sur les réseaux sociaux, CRM léger, newsletters, génération multilingue — l'architecture actuelle (AIService abstrait, `ContentType` extensible, `GeneratedContent` générique) est conçue pour absorber ces ajouts sans refonte.

Cette découpe priorise volontairement la génération de contenu (la valeur vendue) avant la facturation, pour que tu puisses tester le produit avec de vrais promoteurs en accès gratuit limité avant de brancher Stripe.

---

## Étape 9 — Validation

Avant que je commence à coder quoi que ce soit, j'ai besoin de ta décision sur ces points :

1. **Next.js à la place de Vite/React** — d'accord, ou tu préfères que j'adapte l'architecture pour garder Vite/React + un backend séparé ?
2. **Clerk Organizations** pour le multi-tenant — d'accord pour t'appuyer dessus plutôt que de coder la gestion d'équipe à la main ?
3. **Neon/Vercel Postgres + Prisma** — ok, ou tu as déjà une préférence de base de données ?
4. **Découpage en phases** ci-dessus — ça te va de démarrer par la génération de contenu (Phase 1) avant la facturation (Phase 3), ou tu veux inverser la priorité ?

Dis-moi ce que tu valides ou ce que tu veux changer, et on attaque l'implémentation phase par phase avec du code réellement fonctionnel à chaque étape.
