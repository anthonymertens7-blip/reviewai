"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "fiche-revision-count";
const FREE_LIMIT = 2;

export default function Home() {
  const [course, setCourse] = useState("");
  const [fiche, setFiche] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY) || "0");
    setCount(stored);
  }, []);

  const limitReached = count >= FREE_LIMIT;

  async function handleGenerate() {
    if (limitReached || !course.trim() || loading) return;

    setLoading(true);
    setError("");
    setFiche("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
      } else {
        setFiche(data.fiche);
        const next = count + 1;
        window.localStorage.setItem(STORAGE_KEY, String(next));
        setCount(next);
      }
    } catch {
      setError("Impossible de générer la fiche. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-2">
        📚 Générateur de Fiche de Révision
      </h1>
      <p className="text-center text-slate-500 mb-8">
        Colle ton cours, l'IA te génère une fiche de révision structurée.
      </p>

      <textarea
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        placeholder="Colle ton cours ici..."
        disabled={limitReached}
        rows={10}
        className="w-full rounded-lg border border-slate-300 p-4 shadow-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
      />

      <p className="text-sm text-slate-400 mt-1 text-right">
        {count}/{FREE_LIMIT} fiches gratuites utilisées
      </p>

      {!limitReached && (
        <button
          onClick={handleGenerate}
          disabled={loading || !course.trim()}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Génération en cours..." : "Générer la fiche"}
        </button>
      )}

      {limitReached && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-5 text-center">
          <p className="mb-4 font-medium text-amber-800">
            Tu as utilisé tes {FREE_LIMIT} fiches gratuites 🎉
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() =>
                alert("Passe l'examen avec un accès illimité, bientôt disponible !")
              }
              className="rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              🎓 Pass Examen
            </button>
            <a
              href="mailto:feedback@fiche-revision.app?subject=Avis%20sur%20l'app%20Fiche%20de%20R%C3%A9vision"
              onClick={() => setFeedbackSent(true)}
              className="rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              💬 Donner mon avis
            </a>
          </div>
          {feedbackSent && (
            <p className="mt-3 text-sm text-slate-500">Merci pour ton retour !</p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          ⚠️ {error}
        </div>
      )}

      {fiche && (
        <div className="prose prose-slate mt-8 max-w-none rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ReactMarkdown>{fiche}</ReactMarkdown>
        </div>
      )}
    </main>
  );
}
