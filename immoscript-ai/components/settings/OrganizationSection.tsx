"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Mail, UserPlus, X } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "org:admin", label: "Administrateur" },
  { value: "org:promoteur", label: "Promoteur" },
  { value: "org:member", label: "Collaborateur" },
];

function roleLabel(role: string) {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;
}

export function OrganizationSection() {
  const { organization, membership, memberships, invitations } = useOrganization({
    memberships: { infinite: true },
    invitations: { infinite: true },
  });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("org:member");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const isAdmin = membership?.role === "org:admin";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!organization) return;

    setIsInviting(true);
    setError(null);
    setSent(false);

    try {
      await organization.inviteMember({ emailAddress: email, role });
      setEmail("");
      setSent(true);
      invitations?.revalidate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'invitation a échoué.");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRevoke(invitationId: string) {
    const invitation = invitations?.data?.find((i) => i.id === invitationId);
    await invitation?.revoke();
    invitations?.revalidate?.();
  }

  if (!organization) return null;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
        <h2 className="font-semibold">{organization.name}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {memberships?.data?.length ?? 0} membre(s)
        </p>

        <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
          {memberships?.data?.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">
                  {m.publicUserData?.firstName
                    ? `${m.publicUserData.firstName} ${m.publicUserData.lastName ?? ""}`.trim()
                    : (m.publicUserData?.identifier ?? "—")}
                </p>
                <p className="text-gray-500 dark:text-gray-400">{m.publicUserData?.identifier}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {roleLabel(m.role)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && (
        <div className="rounded-3xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-gray-700">
              <UserPlus className="h-4 w-4" />
            </span>
            <h2 className="font-semibold">Inviter un collègue</h2>
          </div>

          <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="invite-email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse e-mail
              </label>
              <input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collegue@exemple.com"
                className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
            <div>
              <label htmlFor="invite-role" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rôle
              </label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isInviting}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              {isInviting ? "Envoi..." : "Inviter"}
            </button>
          </form>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {sent && <p className="mt-2 text-sm text-green-600">Invitation envoyée.</p>}

          {invitations?.data && invitations.data.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Invitations en attente</p>
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {invitations.data.map((invitation) => (
                  <li key={invitation.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{invitation.emailAddress}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {roleLabel(invitation.role)}
                      </span>
                      <button
                        onClick={() => handleRevoke(invitation.id)}
                        aria-label="Annuler l'invitation"
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
