import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { PublicNav } from "./PublicNav";

export function PublicHeader({ active }: { active: "accueil" | "tarifs" | "blog" }) {
  return (
    <header className="flex w-full items-center justify-between border-b border-gray-200/70 pb-5 dark:border-gray-700/70">
      <Link href="/" className="flex items-center gap-2.5">
        <LogoMark size={36} className="shadow-md shadow-[#7FD9EC]/40 rounded-xl" />
        <span className="text-lg font-bold tracking-tight">ImmoScript AI</span>
      </Link>
      <PublicNav active={active} />
    </header>
  );
}
