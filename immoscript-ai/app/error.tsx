"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#E3FBFF] to-[#7FD9EC] px-4 text-center dark:from-[#0B1220] dark:to-[#111827]">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-600 shadow-lg dark:bg-gray-800">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Une erreur est survenue</h1>
      <p className="max-w-sm text-sm text-gray-600 dark:text-gray-300">
        Quelque chose s&apos;est mal passé. Vous pouvez réessayer, ou revenir au dashboard si le problème persiste.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Réessayer
        </button>
        <Link
          href="/dashboard"
          className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}
