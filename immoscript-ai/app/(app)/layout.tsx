import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CreateOrganization, OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Building2, Library } from "lucide-react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { orgId } = await auth();

  if (!orgId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Crée ou sélectionne une organisation</h1>
          <p className="mt-1 text-sm text-gray-500">
            ImmoScript AI organise les programmes par organisation (une organisation = une équipe/un promoteur).
          </p>
        </div>
        <CreateOrganization afterCreateOrganizationUrl="/dashboard" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3">
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-gray-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
              I
            </span>
            ImmoScript AI
          </Link>
          <Link href="/programs" className="flex items-center gap-1.5 hover:text-brand-600">
            <Building2 className="h-4 w-4" />
            Programmes
          </Link>
          <Link href="/library" className="flex items-center gap-1.5 hover:text-brand-600">
            <Library className="h-4 w-4" />
            Bibliothèque
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/dashboard" />
          <UserButton />
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
