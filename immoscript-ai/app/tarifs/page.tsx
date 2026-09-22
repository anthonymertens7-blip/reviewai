import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/home/PublicNav";
import { PricingSection } from "@/components/home/PricingSection";
import { SUPPORT_EMAIL } from "@/lib/support";

export const metadata = { title: "Tarifs — ImmoScript AI" };

export default function TarifsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-10 px-4 py-12">
      <div className="flex w-full items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          ImmoScript AI
        </Link>
        <PublicNav active="tarifs" />
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tarifs</h1>
        <p className="max-w-xl text-gray-600 dark:text-gray-400">
          Un plan pour chaque taille d&apos;équipe, sans engagement.
        </p>
      </div>

      <PricingSection />

      <SignedOut>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="flex items-center gap-2 rounded-md bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Essayer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-in"
            className="flex items-center gap-2 rounded-md px-6 py-3 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Se connecter
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-md bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
        >
          Gérer mon abonnement
          <ArrowRight className="h-4 w-4" />
        </Link>
      </SignedIn>

      <footer className="mt-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
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
      </footer>
    </main>
  );
}
