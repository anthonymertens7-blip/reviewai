"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-600 shadow-lg dark:bg-gray-800">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Une erreur est survenue</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">Cette page a rencontré un problème. Vous pouvez réessayer.</p>
      <button
        onClick={reset}
        className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Réessayer
      </button>
    </div>
  );
}
