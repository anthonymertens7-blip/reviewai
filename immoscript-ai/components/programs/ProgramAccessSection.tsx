"use client";

import { useEffect, useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Users } from "lucide-react";

// Un Collaborateur ne voit que les programmes auxquels un Promoteur/Admin lui a donné un accès
// explicite (ProgramService.get) — sans cette UI, rien dans l'app ne permettait de remplir
// ProgramAccess, rendant le rôle Collaborateur inutilisable (aucun programme jamais visible).
export function ProgramAccessSection({ programId }: { programId: string }) {
  const { memberships } = useOrganization({ memberships: { infinite: true } });
  const [accessUserIds, setAccessUserIds] = useState<string[] | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/programs/${programId}/access`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body) => setAccessUserIds(body.userIds ?? []))
      .catch(() => setAccessUserIds([]));
  }, [programId]);

  const collaborators = (memberships?.data ?? []).filter((m) => m.role === "org:member");

  async function toggleAccess(userId: string, hasAccess: boolean) {
    setPendingUserId(userId);
    setError(null);

    const res = await fetch(`/api/programs/${programId}/access${hasAccess ? `/${userId}` : ""}`, {
      method: hasAccess ? "DELETE" : "POST",
      headers: hasAccess ? undefined : { "Content-Type": "application/json" },
      body: hasAccess ? undefined : JSON.stringify({ userId }),
    });
    setPendingUserId(null);

    if (!res.ok) {
      setError("La mise à jour de l'accès a échoué.");
      return;
    }

    setAccessUserIds((ids) => (hasAccess ? (ids ?? []).filter((id) => id !== userId) : [...(ids ?? []), userId]));
  }

  if (collaborators.length === 0 || accessUserIds === null) return null;

  return (
    <div className="rounded-3xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-gray-700">
          <Users className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-semibold">Accès collaborateurs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Les collaborateurs ne voient que les programmes auxquels vous leur donnez accès ici.
          </p>
        </div>
      </div>

      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {collaborators.map((m) => {
          const userId = m.publicUserData?.userId;
          if (!userId) return null;
          const hasAccess = accessUserIds.includes(userId);
          return (
            <li key={m.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">
                  {m.publicUserData?.firstName
                    ? `${m.publicUserData.firstName} ${m.publicUserData.lastName ?? ""}`.trim()
                    : (m.publicUserData?.identifier ?? "—")}
                </p>
                <p className="text-gray-500 dark:text-gray-400">{m.publicUserData?.identifier}</p>
              </div>
              <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
                <input
                  type="checkbox"
                  role="switch"
                  className="peer sr-only"
                  checked={hasAccess}
                  disabled={pendingUserId === userId}
                  onChange={() => toggleAccess(userId, hasAccess)}
                  aria-label={`Accès de ${m.publicUserData?.identifier ?? "ce collaborateur"} à ce programme`}
                />
                <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-brand-600 dark:bg-gray-600" />
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </label>
            </li>
          );
        })}
      </ul>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
