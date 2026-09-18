"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteLotButton({ lotId }: { lotId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Supprimer ce lot ?")) return;
    setIsDeleting(true);
    setError(null);
    const res = await fetch(`/api/lots/${lotId}`, { method: "DELETE" });
    setIsDeleting(false);
    if (res.ok) {
      router.refresh();
      return;
    }
    setError("La suppression a échoué.");
  }

  return (
    <span>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-sm text-red-600 hover:underline disabled:opacity-50"
      >
        {isDeleting ? "..." : "Supprimer"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </span>
  );
}
