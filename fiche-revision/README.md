# IAexam

Application Next.js (App Router) + Tailwind CSS qui génère une fiche de révision à partir d'un cours collé par l'utilisateur, en appelant l'API Anthropic (Claude Sonnet 5).

## Fonctionnalités

- Connexion avec Google (Apple en option, voir plus bas) via NextAuth.js
- Zone de texte pour coller un cours
- Bouton "Générer la fiche" qui appelle une route API serveur (`/api/generate`) qui elle-même appelle Claude
- Affichage du résultat en Markdown formaté, avec surlignage des éléments importants
- Compteur de générations persisté côté serveur (Upstash Redis), par compte utilisateur : après 2 générations gratuites, le bouton de génération est remplacé par "🎓 Pass Examen" et "💬 Donner mon avis"

## Configuration

### 1. Variables d'environnement

Copier `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

### 2. Clé API Anthropic

`ANTHROPIC_API_KEY` — créée sur [console.anthropic.com](https://console.anthropic.com) > API Keys.

### 3. NextAuth

- `NEXTAUTH_SECRET` : générer avec `openssl rand -base64 32`
- `NEXTAUTH_URL` : `http://localhost:3000` en local, l'URL de prod en déploiement (Vercel la déduit automatiquement si non définie)

### 4. Google OAuth

1. [console.cloud.google.com](https://console.cloud.google.com) > créer un projet (ou en choisir un existant)
2. APIs & Services > OAuth consent screen : configurer l'écran de consentement
3. APIs & Services > Credentials > Create Credentials > OAuth client ID (type "Web application")
4. Authorized redirect URIs : ajouter `http://localhost:3000/api/auth/callback/google` en local, et `https://<ton-domaine>/api/auth/callback/google` en production
5. Copier `Client ID` et `Client Secret` dans `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

### 5. Apple Sign In (optionnel)

Nécessite un compte [Apple Developer Program](https://developer.apple.com/programs/) payant (99$/an). Tant que `APPLE_CLIENT_ID` et `APPLE_CLIENT_SECRET` ne sont pas définis, le bouton Apple n'apparaît simplement pas — Google fonctionne indépendamment.

Étapes (une fois le compte Apple Developer actif) :
1. Créer un identifiant Service ID (= `APPLE_CLIENT_ID`) lié à un App ID
2. Créer une clé "Sign in with Apple", télécharger le fichier `.p8`
3. Générer le client secret : c'est un JWT signé (ES256) avec cette clé, valable au maximum 6 mois — à régénérer périodiquement. Voir la [doc NextAuth Apple Provider](https://next-auth.js.org/providers/apple) pour le script de génération.
4. Ajouter l'URI de redirection `https://<ton-domaine>/api/auth/callback/apple` dans la configuration du Service ID

### 6. Compteur de générations (Upstash Redis)

Sur Vercel : Storage > Create Database > Redis (via Upstash) > Connect to Project. Les variables `KV_REST_API_URL` et `KV_REST_API_TOKEN` sont alors injectées automatiquement dans le projet.

En local, sans ces variables configurées, le compteur reste à 0 (mode dégradé, pratique pour tester sans dépendance externe).

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

La clé API Anthropic et les secrets OAuth ne sont jamais exposés au client : ils ne sont utilisés que côté serveur (routes `app/api/*`).
