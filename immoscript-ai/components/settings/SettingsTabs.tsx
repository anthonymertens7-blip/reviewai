"use client";

import { useState } from "react";
import { Palette, User, Building2, Megaphone, Sparkles, Eye, CreditCard } from "lucide-react";
import type { Role } from "@prisma/client";
import { AppearanceSection } from "./AppearanceSection";
import { AccessibilitySection } from "./AccessibilitySection";
import { AccountSection } from "./AccountSection";
import { OrganizationSection } from "./OrganizationSection";
import { BrandVoiceSection } from "./BrandVoiceSection";
import { ChangelogSection } from "./ChangelogSection";
import { BillingSection, type BillingInfo } from "./BillingSection";

const TABS = [
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "accessibility", label: "Accessibilité", icon: Eye },
  { id: "account", label: "Compte", icon: User },
  { id: "organization", label: "Organisation", icon: Building2 },
  { id: "billing", label: "Facturation", icon: CreditCard },
  { id: "brand-voice", label: "Voix de marque", icon: Megaphone },
  { id: "changelog", label: "Nouveautés", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsTabs({ role, billing }: { role: Role; billing: BillingInfo }) {
  const [active, setActive] = useState<TabId>("appearance");

  // Facturation gérée par les mêmes rôles que le checkout/portail Stripe côté API (minRole:
  // "PROMOTEUR") — un Collaborateur ne peut de toute façon rien y faire, autant ne pas afficher
  // l'onglet plutôt que des boutons qui échoueraient tous en 403.
  const tabs = TABS.filter((tab) => tab.id !== "billing" || role !== "COLLABORATEUR");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              active === id
                ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {active === "appearance" && <AppearanceSection />}
      {active === "accessibility" && <AccessibilitySection />}
      {active === "account" && <AccountSection />}
      {active === "organization" && <OrganizationSection />}
      {active === "billing" && role !== "COLLABORATEUR" && <BillingSection billing={billing} />}
      {active === "brand-voice" && <BrandVoiceSection />}
      {active === "changelog" && <ChangelogSection />}
    </div>
  );
}
