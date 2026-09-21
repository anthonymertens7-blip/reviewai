import { getAuthContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsageService } from "@/lib/services/UsageService";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default async function SettingsPage() {
  const { organizationId, role } = await getAuthContext();

  const [organization, usage] = await Promise.all([
    // Organization n'est pas scopé par le client Prisma étendu (voir lib/db/scoped-client.ts) :
    // le filtre par organizationId est manuel, comme dans les routes /api/billing/*.
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, stripeCustomerId: true },
    }),
    UsageService.getUsage(organizationId),
  ]);

  const billing = {
    plan: organization?.plan ?? "trial",
    hasStripeCustomer: Boolean(organization?.stripeCustomerId),
    used: usage.used,
    quota: usage.quota,
    periodEnd: usage.periodEnd.toISOString(),
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Paramètres</h1>
      <SettingsTabs role={role} billing={billing} />
    </div>
  );
}
