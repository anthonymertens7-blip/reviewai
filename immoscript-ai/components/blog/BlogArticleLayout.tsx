import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/home/PublicHeader";
import { SUPPORT_EMAIL } from "@/lib/support";
import { formatPostDate } from "@/lib/blog/posts";

export function BlogArticleLayout({
  title,
  date,
  children,
}: {
  title: string;
  date: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-12">
      <PublicHeader active="blog" />

      <div className="flex flex-col gap-6">
        <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="h-4 w-4" />
          Retour au blog
        </Link>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-400 dark:text-gray-500">{formatPostDate(date)}</p>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>

        <article className="flex flex-col gap-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 dark:[&_h2]:text-gray-100 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </article>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="flex-1 text-sm text-gray-600 dark:text-gray-400">
            ImmoScript AI génère vos annonces, posts réseaux sociaux et scripts vidéo à partir des informations de votre programme.
          </p>
          <Link
            href="/sign-up"
            className="flex items-center gap-2 whitespace-nowrap rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Essayer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <footer className="mt-auto flex flex-col items-center gap-2 pt-8 text-xs text-gray-400 dark:text-gray-500">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/mentions-legales" className="hover:underline">
            Mentions légales
          </Link>
          <Link href="/cgu" className="hover:underline">
            CGU
          </Link>
          <Link href="/cgv" className="hover:underline">
            CGV
          </Link>
          <Link href="/confidentialite" className="hover:underline">
            Confidentialité
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:underline">
            Contact
          </a>
        </div>
        <p>© {new Date().getFullYear()} ImmoScript AI</p>
      </footer>
    </main>
  );
}
