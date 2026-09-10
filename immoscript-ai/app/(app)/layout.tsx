import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CreateOrganization, OrganizationSwitcher, UserButton } from "@clerk/nextjs";

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
          <Link href="/dashboard" className="font-semibold text-gray-900">
            ImmoScript AI
          </Link>
          <Link href="/programs">Programmes</Link>
          <Link href="/library">Bibliothèque</Link>
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
