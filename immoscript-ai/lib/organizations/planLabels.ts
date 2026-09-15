export const PLAN_LABELS: Record<string, string> = {
  trial: "Essai gratuit",
  starter: "Starter",
  pro: "Pro",
  agency: "Agence",
};

export function planLabel(plan: string): string {
  return PLAN_LABELS[plan] ?? plan;
}
