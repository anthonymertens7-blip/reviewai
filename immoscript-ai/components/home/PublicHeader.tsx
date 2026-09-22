import Link from "next/link";
import { PublicNav } from "./PublicNav";

export function PublicHeader({ active }: { active: "accueil" | "tarifs" }) {
  return (
    <header className="flex w-full items-center justify-between border-b border-gray-200/70 pb-5 dark:border-gray-700/70">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151F6D] text-sm font-bold text-white shadow-md shadow-[#151F6D]/30">
          I
        </span>
        <span className="text-lg font-bold tracking-tight">ImmoScript AI</span>
      </Link>
      <PublicNav active={active} />
    </header>
  );
}
