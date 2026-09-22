import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, Check, ShieldCheck, Sparkles, Video } from "lucide-react";
import { PersonalizedGreeting } from "@/components/home/PersonalizedGreeting";
import { ShowcaseExample } from "@/components/home/ShowcaseExample";
import { PublicHeader } from "@/components/home/PublicHeader";
import { CARD_ACCENT_STYLES, type CardAccent } from "@/components/ui/cardAccents";
import { SUPPORT_EMAIL } from "@/lib/support";

const REASSURANCES = ["Sans carte bancaire", "Essai gratuit 30 générations", "Annulable à tout moment"];

const FEATURES: { icon: typeof Sparkles; title: string; description: string; accent: CardAccent }[] = [
  {
    icon: Sparkles,
    title: "Multi-format en un clic",
    description: "Annonces, réseaux sociaux, portails, scripts vidéo — générés en parallèle depuis les mêmes données.",
    accent: "violet",
  },
  {
    icon: ShieldCheck,
    title: "Zéro invention",
    description: "L'IA n'utilise que les informations que vous avez renseignées, jamais de détail fabriqué.",
    accent: "teal",
  },
  {
    icon: Video,
    title: "Scripts vidéo prêts à tourner",
    description: "5 angles narratifs, scène par scène, avec voix off et texte à l'écran.",
    accent: "amber",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-16 px-4 py-20">
      <SignedOut>
        <PublicHeader active="accueil" />

        <div className="flex flex-col items-center gap-6 text-center">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            IA pour l&apos;immobilier neuf
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Vos programmes immobiliers, prêts à publier en un clic
          </h1>
          <p className="max-w-xl text-lg text-gray-600 dark:text-gray-400">
            Générez en un clic les annonces, réseaux sociaux et scripts vidéo de vos programmes immobiliers.
          </p>
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
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
            {REASSURANCES.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid w-full gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, accent }) => (
            <div
              key={title}
              className={`rounded-3xl border p-5 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_36px_-10px_rgba(15,23,42,0.22)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] ${CARD_ACCENT_STYLES[accent].card}`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${CARD_ACCENT_STYLES[accent].badge}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          ))}
        </div>

        <ShowcaseExample />

        <Link
          href="/tarifs"
          className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Voir les tarifs
          <ArrowRight className="h-4 w-4" />
        </Link>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">ImmoScript AI</h1>
          <PersonalizedGreeting />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Aller au dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </SignedIn>

      <footer className="flex flex-col items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
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
