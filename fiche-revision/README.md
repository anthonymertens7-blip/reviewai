# Fiche de Révision IA

Application Next.js (App Router) + Tailwind CSS qui génère une fiche de révision à partir d'un cours collé par l'utilisateur, en appelant l'API Anthropic (Claude 3.5 Sonnet).

## Fonctionnalités

- Zone de texte pour coller un cours
- Bouton "Générer la fiche" qui appelle une route API serveur (`/api/generate`) qui elle-même appelle Claude 3.5 Sonnet
- Affichage du résultat en Markdown formaté
- Compteur de générations stocké dans `localStorage` : après 2 générations gratuites, le bouton de génération est remplacé par "🎓 Pass Examen" et "💬 Donner mon avis"

## Démarrage

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Copier `.env.example` en `.env.local` et renseigner ta clé API Anthropic :

   ```bash
   cp .env.example .env.local
   ```

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Lancer le serveur de développement :

   ```bash
   npm run dev
   ```

4. Ouvrir [http://localhost:3000](http://localhost:3000)

La clé API n'est jamais exposée au client : elle est utilisée uniquement côté serveur dans `app/api/generate/route.js`.
