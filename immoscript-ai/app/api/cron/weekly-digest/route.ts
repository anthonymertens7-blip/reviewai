import { NextResponse } from "next/server";
import { DigestService } from "@/lib/services/DigestService";
import { getResendClient, DIGEST_FROM_EMAIL } from "@/lib/email/resendClient";
import { buildWeeklyDigestHtml, buildWeeklyDigestSubject } from "@/lib/email/weeklyDigestEmail";

/**
 * Déclenché par un cron externe (ex: Vercel Cron, voir vercel.json) une fois par
 * semaine. Authentifié par secret partagé (CRON_SECRET), pas par session Clerk —
 * cette route est explicitement exclue du middleware d'auth (voir middleware.ts).
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "cron_not_configured" }, { status: 501 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json({ error: "email_not_configured", sent: 0 }, { status: 200 });
  }

  const digests = await DigestService.buildAllOrganizationDigests();

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const digest of digests) {
    for (const recipient of digest.recipients) {
      try {
        // Le SDK Resend ne lève pas d'exception sur un rejet de l'API (domaine
        // non vérifié, adresse invalide...) : l'erreur revient dans le champ
        // `error` de la réponse résolue, jamais via une exception JS.
        const result = await resend.emails.send({
          from: DIGEST_FROM_EMAIL,
          to: recipient.email,
          subject: buildWeeklyDigestSubject(digest, recipient),
          html: buildWeeklyDigestHtml(digest, recipient),
        });

        if (result.error) {
          failed++;
          errors.push(`${recipient.email}: ${result.error.message}`);
        } else {
          sent++;
        }
      } catch (error) {
        failed++;
        errors.push(`${recipient.email}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  return NextResponse.json({ organizations: digests.length, sent, failed, errors });
}
