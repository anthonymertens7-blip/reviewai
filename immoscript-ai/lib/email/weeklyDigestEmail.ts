import type { OrganizationDigest } from "@/lib/services/DigestService";

export function buildWeeklyDigestSubject(digest: OrganizationDigest): string {
  return digest.newContentsCount > 0
    ? `${digest.organizationName} : ${digest.newContentsCount} contenu(s) généré(s) cette semaine`
    : `${digest.organizationName} : récapitulatif hebdomadaire ImmoScript AI`;
}

export function buildWeeklyDigestHtml(digest: OrganizationDigest, recipientName: string | null): string {
  const quotaLine =
    digest.usage.quota === null
      ? "Générations IA : illimitées"
      : `Générations IA ce mois-ci : ${digest.usage.used} / ${digest.usage.quota}`;

  const programsLine =
    digest.recentProgramNames.length > 0
      ? `<p>Programmes actifs cette semaine : ${digest.recentProgramNames.map(escapeHtml).join(", ")}</p>`
      : "";

  return `
    <div style="font-family: sans-serif; color: #111827; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 18px;">Bonjour${recipientName ? ` ${escapeHtml(recipientName)}` : ""},</h1>
      <p>Voici le récapitulatif hebdomadaire de <strong>${escapeHtml(digest.organizationName)}</strong> sur ImmoScript AI :</p>
      <ul style="line-height: 1.8;">
        <li>${digest.newContentsCount} nouveau(x) contenu(s) généré(s) cette semaine</li>
        <li>${quotaLine}</li>
      </ul>
      ${programsLine}
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">Vous recevez cet email car vous faites partie de cette organisation sur ImmoScript AI.</p>
    </div>
  `.trim();
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
