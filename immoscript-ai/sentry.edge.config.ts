import * as Sentry from "@sentry/nextjs";

// Runtime Edge (middleware.ts) : config distincte du serveur Node car le SDK Sentry n'a pas les
// mêmes intégrations disponibles (pas d'accès aux API Node) — c'est l'exigence du SDK Next.js.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
