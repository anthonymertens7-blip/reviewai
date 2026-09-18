"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";

export function DuplicateProgramButton({ programId }: { programId: string }) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDuplicate() {
    setIsDuplicating(true);
    setError(null);
    const res = await fetch(`/api/programs/${programId}/duplicate`, { method: "POST" });
    setIsDuplicating(false);

    if (!res.ok) {
      setError("La duplication a échoué.");
      return;
    }

    const { program } = await res.json();
    router.push(`/programs/${program.id}/edit`);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={handleDuplicate}
        disabled={isDuplicating}
        className="flex items-center gap-1.5 rounded-md border dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700"
      >
        <Copy className="h-4 w-4" />
        {isDuplicating ? "Duplication..." : "Dupliquer"}
      </button>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
