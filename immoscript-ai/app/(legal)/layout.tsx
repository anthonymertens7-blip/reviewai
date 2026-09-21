import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>
      <article className="space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:dark:text-gray-100 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:dark:text-gray-100 [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:text-brand-600 [&_a]:underline">
        {children}
      </article>
    </main>
  );
}
