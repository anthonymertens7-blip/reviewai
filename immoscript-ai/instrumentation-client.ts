import * as Sentry from "@sentry/nextjs";

// NEXT_PUBLIC_SENTRY_DSN (et non SENTRY_DSN) : ce fichier tourne dans le navigateur, la clé doit
// donc être exposée côté client — même DSN que sentry.server.config.ts/sentry.edge.config.ts,
// dupliqué sous son nom NEXT_PUBLIC_* comme l'exige Next.js pour toute variable lue côté client.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});

// Requis par le SDK pour instrumenter les changements de page côté client (App Router).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
