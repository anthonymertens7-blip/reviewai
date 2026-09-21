import * as Sentry from "@sentry/nextjs";

// Point d'entrée unique appelé par Next.js au démarrage de chaque runtime serveur — le SDK Sentry
// exige une config distincte par runtime (Node vs Edge, voir sentry.server.config.ts /
// sentry.edge.config.ts) car les API disponibles diffèrent.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Capture automatiquement les erreurs non gérées des Server Components / Route Handlers, sans
// avoir à instrumenter chaque route individuellement (ex: le throw générique de withOrgAuth pour
// toute erreur non reconnue, voir lib/with-org-auth.ts).
export const onRequestError = Sentry.captureRequestError;
