import { NextResponse } from "next/server";
import { withOrgAuth } from "@/lib/with-org-auth";
import { updatePreferencesSchema } from "@/lib/validation/preferences";

/** Préférences d'apparence propres à l'utilisateur (pas à l'organisation) — enregistrées en base
 * pour suivre le compte d'un appareil/navigateur à l'autre, en complément du localStorage qui
 * applique le changement instantanément sur ce navigateur (voir lib/useBackgroundPreset.ts). */
export const PATCH = withOrgAuth(async (req, authContext) => {
  const body = await req.json();
  const parsed = updatePreferencesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  await authContext.db.user.update({
    where: { id: authContext.userId },
    data: { backgroundPreset: parsed.data.backgroundPreset },
  });

  return NextResponse.json({ ok: true });
});
