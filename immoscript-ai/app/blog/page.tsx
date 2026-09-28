import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/home/PublicHeader";
import { SUPPORT_EMAIL } from "@/lib/support";
import { BLOG_POSTS, formatPostDate } from "@/lib/blog/posts";

export const metadata = { title: "Blog — ImmoScript AI" };

export default function BlogIndexPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-10 px-4 py-12">
      <PublicHeader active="blog" />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Conseils pratiques pour le marketing des programmes immobiliers neufs.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-10px_rgba(15,23,42,0.22)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]"
          >
            <p className="text-xs text-gray-400 dark:text-gray-500">{formatPostDate(post.date)}</p>
            <h2 className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
              {post.title}
              <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-400" />
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{post.excerpt}</p>
          </Link>
        ))}
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
