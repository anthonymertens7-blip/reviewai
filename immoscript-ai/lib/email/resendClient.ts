import { Resend } from "resend";

let client: Resend | undefined;

/** Retourne `null` si RESEND_API_KEY n'est pas configuré, plutôt que de lever une erreur — le digest est un bonus, pas une fonctionnalité critique. */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new Resend(apiKey);
  }
  return client;
}

export const DIGEST_FROM_EMAIL = process.env.DIGEST_FROM_EMAIL ?? "ImmoScript AI <digest@immoscript.ai>";
