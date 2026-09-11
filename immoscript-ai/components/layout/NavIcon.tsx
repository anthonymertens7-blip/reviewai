import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function NavIcon({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="group relative flex h-11 w-11 items-center justify-center rounded-2xl text-gray-500 dark:text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
    >
      <Icon className="h-5 w-5" />
      <span
        className="pointer-events-none absolute left-full ml-3 -translate-x-1 whitespace-nowrap rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100"
      >
        {label}
      </span>
    </Link>
  );
}
