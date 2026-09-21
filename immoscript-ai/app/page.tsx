import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, Check, ShieldCheck, Sparkles, Video } from "lucide-react";
import { PersonalizedGreeting } from "@/components/home/PersonalizedGreeting";
import { CARD_ACCENT_STYLES, type CardAccent } from "@/components/ui/cardAccents";
import { PLANS, PLAN_ORDER, formatPlanPrice } from "@/lib/billing/plans";

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
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            IA pour l&apos;immobilier neuf
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">ImmoScript AI</h1>
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
        </div>

        <div className="grid w-full gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, accent }) => (
            <div key={title} className={`rounded-3xl border shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] p-5 ${CARD_ACCENT_STYLES[accent].card}`}>
              <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${CARD_ACCENT_STYLES[accent].badge}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          ))}
        </div>

        <div className="w-full">
          <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">Tarifs</h2>
          <div className="grid w-full gap-6 sm:grid-cols-4">
            {PLAN_ORDER.map((planId) => {
              const config = PLANS[planId];
              return (
                <div
                  key={planId}
                  className="rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]"
                >
                  <h3 className="font-semibold">{config.label}</h3>
                  <p className="mt-1 text-2xl font-bold">
                    {config.priceEurCents === 0 ? "0 €" : formatPlanPrice(config.priceEurCents)}
                    {config.priceEurCents > 0 && (
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400"> / mois</span>
                    )}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="h-4 w-4 shrink-0 text-brand-600" />
                    {config.monthlyQuota} générations / mois
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Sans carte bancaire pour l&apos;essai gratuit. Changez ou annulez votre plan à tout moment.
          </p>
        </div>
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
    </main>
  );
}
