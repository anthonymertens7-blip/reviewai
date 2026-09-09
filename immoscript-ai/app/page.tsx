import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">ImmoScript AI</h1>
      <p className="text-lg text-gray-600">
        Génère en un clic les annonces, réseaux sociaux et scripts vidéo de tes programmes
        immobiliers.
      </p>
      <SignedOut>
        <Link
          href="/sign-in"
          className="rounded-md bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
        >
          Se connecter
        </Link>
      </SignedOut>
      <SignedIn>
        <Link
          href="/dashboard"
          className="rounded-md bg-gray-900 px-6 py-3 text-white hover:bg-gray-800"
        >
          Aller au dashboard
        </Link>
      </SignedIn>
    </main>
  );
}
