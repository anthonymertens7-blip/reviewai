import Link from "next/link";

const TABS = [
  { id: "accueil", label: "Accueil", href: "/" },
  { id: "tarifs", label: "Tarifs", href: "/tarifs" },
] as const;

export function PublicNav({ active }: { active: (typeof TABS)[number]["id"] }) {
  return (
    <nav className="flex gap-2">
      {TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            active === tab.id
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
