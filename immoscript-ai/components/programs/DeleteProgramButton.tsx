"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteProgramButton({ programId }: { programId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer définitivement ce programme, ses lots et tous les contenus générés ? Cette action est irréversible.")) {
      return;
    }
    setIsDeleting(true);
    const res = await fetch(`/api/programs/${programId}`, { method: "DELETE" });
    setIsDeleting(false);

    if (res.ok) {
      router.push("/programs");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-1.5 rounded-md border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? "Suppression..." : "Supprimer"}
    </button>
  );
}
