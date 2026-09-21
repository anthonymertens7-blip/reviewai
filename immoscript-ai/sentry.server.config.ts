import * as Sentry from "@sentry/nextjs";

// SENTRY_DSN absent : Sentry.init reste un no-op (aucun envoi), comme getResendClient/getStripeClient
// pour les autres intégrations optionnelles — permet de livrer sans compte Sentry déjà créé.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
