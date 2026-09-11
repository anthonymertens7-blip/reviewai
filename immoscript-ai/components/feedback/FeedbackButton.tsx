"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X } from "lucide-react";

export function FeedbackButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setIsOpen(false);
    setMessage("");
    setIsSent(false);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, page: pathname }),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError("L'envoi a échoué. Réessayez.");
      return;
    }

    setIsSent(true);
    setMessage("");
    setTimeout(close, 1500);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex h-11 w-11 items-center justify-center rounded-2xl text-gray-500 shadow-transparent transition-all hover:bg-brand-50 hover:text-brand-600 hover:shadow-sm dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <MessageSquarePlus className="h-5 w-5" />
        <span className="pointer-events-none absolute left-full ml-3 -translate-x-1 whitespace-nowrap rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100">
          Feedback
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Envoyer un feedback</h2>
              <button onClick={close} aria-label="Fermer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {isSent ? (
              <p className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">Merci, c&apos;est envoyé !</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Un bug, une idée, une remarque..."
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
                  autoFocus
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={close} className="rounded-md border dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
