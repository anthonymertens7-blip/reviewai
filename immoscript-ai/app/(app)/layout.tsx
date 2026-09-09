import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
