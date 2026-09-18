"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Wand2, X } from "lucide-react";

interface Photo {
  id: string;
  mimeType: string;
}

export function LotPhotosPanel({ lotId, currentSpecialFeatures }: { lotId: string; currentSpecialFeatures?: string | null }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetch(`/api/lots/${lotId}/photos`)
      .then((res) => res.json())
      .then((body) => setPhotos(body.photos ?? []))
      .finally(() => setIsLoading(false));
  }, [lotId]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/lots/${lotId}/photos`, { method: "POST", body: formData });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "L'envoi d'une photo a échoué.");
        continue;
      }

      const { photo } = await res.json();
      setPhotos((p) => [...p, photo]);
    }

    setIsUploading(false);
  }

  async function handleDelete(photoId: string) {
    setPhotos((p) => p.filter((photo) => photo.id !== photoId));
    await fetch(`/api/lots/${lotId}/photos/${photoId}`, { method: "DELETE" });
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setApplied(false);

    const res = await fetch(`/api/lots/${lotId}/photos/suggest`, { method: "POST" });
    setIsGenerating(false);

    if (!res.ok) {
      if (res.status === 429) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "Quota IA mensuel atteint.");
      } else if (res.status === 400) {
        setError("Ajoutez au moins une photo avant de générer.");
      } else {
        setError("La génération a échoué.");
      }
      return;
    }

    const { suggestions } = (await res.json()) as { suggestions: string[] };

    // Ajoute aux caractéristiques déjà saisies plutôt que de les remplacer : un promoteur qui a
    // déjà rédigé du texte manuel (avant d'ajouter des photos) ne doit pas le perdre en un clic.
    const existing = currentSpecialFeatures?.trim();
    const merged = existing ? `${existing}, ${suggestions.join(", ")}` : suggestions.join(", ");

    const patchRes = await fetch(`/api/lots/${lotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ specialFeatures: merged }),
    });

    if (patchRes.ok) {
      setApplied(true);
      router.refresh();
    }
  }

  if (isLoading) return null;

  return (
    <div className="mt-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Photos du lot</p>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          <ImagePlus className="h-3.5 w-3.5" />
          {isUploading ? "Envoi..." : "Ajouter des photos"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            disabled={isUploading}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </label>
      </div>

      {photos.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">Aucune photo. Ajoutez-en pour générer une description ancrée sur le réel.</p>
      ) : (
        <div className="mb-3 flex flex-wrap gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative h-16 w-16 overflow-hidden rounded-lg border dark:border-gray-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/lots/${lotId}/photos/${photo.id}`} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => handleDelete(photo.id)}
                aria-label="Supprimer la photo"
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={photos.length === 0 || isGenerating}
        className="flex items-center gap-1.5 rounded-md border dark:border-gray-700 px-3 py-1.5 text-xs font-medium hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
      >
        <Wand2 className={`h-3.5 w-3.5 ${isGenerating ? "animate-pulse" : ""}`} />
        {isGenerating ? "Analyse des photos..." : "Générer une description depuis les photos"}
      </button>

      {applied && <p className="mt-2 text-xs text-teal-600 dark:text-teal-400">Ajouté aux caractéristiques spéciales du lot ✓</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
