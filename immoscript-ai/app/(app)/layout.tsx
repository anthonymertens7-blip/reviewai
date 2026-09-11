import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CreateOrganization, OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Building2, Library, Settings, ShieldCheck } from "lucide-react";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { NavIcon } from "@/components/layout/NavIcon";
import { PageTransition } from "@/components/layout/PageTransition";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { isOwner } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { orgId } = await auth();
  const showOwnerLink = orgId ? await isOwner() : false;

  if (!orgId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Créez ou sélectionnez une organisation</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ImmoScript AI organise les programmes par organisation (une organisation = une équipe/un promoteur).
          </p>
        </div>
        <CreateOrganization afterCreateOrganizationUrl="/dashboard" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="relative z-10 flex w-20 flex-col items-center gap-3 border-r bg-white py-5 shadow-[6px_0_24px_-6px_rgba(15,23,42,0.22)] dark:bg-gray-800 dark:shadow-[6px_0_24px_-6px_rgba(0,0,0,0.6)]">
        <Link
          href="/dashboard"
          className="group relative mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#151F6D] text-sm font-bold text-white shadow-lg shadow-[#151F6D]/40"
        >
          I
          <span className="pointer-events-none absolute left-full ml-3 -translate-x-1 whitespace-nowrap rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
            ImmoScript AI
          </span>
        </Link>

        <nav className="flex flex-col items-center gap-2">
          <NavIcon href="/programs" icon={<Building2 className="h-5 w-5" />} label="Programmes" />
          <NavIcon href="/library" icon={<Library className="h-5 w-5" />} label="Bibliothèque" />
          {showOwnerLink && (
            <NavIcon href="/admin/feedback" icon={<ShieldCheck className="h-5 w-5" />} label="Feedback (admin)" />
          )}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-3">
          <NavIcon href="/settings" icon={<Settings className="h-5 w-5" />} label="Paramètres" />
          <ThemeToggle />
          <FeedbackButton />
          <OrganizationSwitcher
            hidePersonal
            afterSelectOrganizationUrl="/dashboard"
            appearance={{ elements: { organizationPreviewTextContainer: "hidden", userPreviewTextContainer: "hidden" } }}
          />
          <UserButton />
        </div>
      </aside>
      <main className="flex-1 px-6 py-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
