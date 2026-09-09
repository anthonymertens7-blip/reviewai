"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateProgramForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, city }),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError("La création a échoué. Vérifie les champs et réessaie.");
      return;
    }

    setName("");
    setCity("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Nom du programme
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-md border-gray-300 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="city" className="text-sm font-medium text-gray-700">
          Ville
        </label>
        <input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="rounded-md border-gray-300 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? "Création..." : "Créer le programme"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
