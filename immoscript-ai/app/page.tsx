import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, ShieldCheck, Sparkles, Video } from "lucide-react";
import { PersonalizedGreeting } from "@/components/home/PersonalizedGreeting";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Multi-format en un clic",
    description: "Annonces, réseaux sociaux, portails, scripts vidéo — générés en parallèle depuis les mêmes données.",
  },
  {
    icon: ShieldCheck,
    title: "Zéro invention",
    description: "L'IA n'utilise que les informations que vous avez renseignées, jamais de détail fabriqué.",
  },
  {
    icon: Video,
    title: "Scripts vidéo prêts à tourner",
    description: "5 angles narratifs, scène par scène, avec voix off et texte à l'écran.",
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
          <p className="max-w-xl text-lg text-gray-600">
            Générez en un clic les annonces, réseaux sociaux et scripts vidéo de vos programmes immobiliers.
          </p>
          <Link
            href="/sign-in"
            className="flex items-center gap-2 rounded-md bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Se connecter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid w-full gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-3xl border bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            </div>
          ))}
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
