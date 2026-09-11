"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavIcon({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all active:scale-90 ${
        isActive
          ? "bg-brand-600 text-white shadow-lg shadow-brand-600/40"
          : "text-gray-500 shadow-transparent hover:bg-brand-50 hover:text-brand-600 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-700"
      }`}
    >
      {icon}
      <span
        className="pointer-events-none absolute left-full ml-3 -translate-x-1 whitespace-nowrap rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100"
      >
        {label}
      </span>
    </Link>
  );
}
