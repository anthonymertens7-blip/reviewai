"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Distinct de app/error.tsx : ce fichier ne rattrape que les erreurs du root layout lui-même
// (app/layout.tsx, ex: ClerkProvider) — un cas que app/error.tsx ne peut pas couvrir puisqu'il est
// rendu À L'INTÉRIEUR de ce layout. Next.js exige qu'il redéfinisse <html>/<body> puisqu'il
// remplace tout le rendu, layout racine compris.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Une erreur est survenue</h1>
        <p className="max-w-sm text-sm text-gray-600">
          Quelque chose s&apos;est mal passé au chargement de l&apos;application. Rechargez la page.
        </p>
      </body>
    </html>
  );
}
