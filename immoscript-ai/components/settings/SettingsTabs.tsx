"use client";

import { useState } from "react";
import { Palette, User, Building2 } from "lucide-react";
import { AppearanceSection } from "./AppearanceSection";
import { AccountSection } from "./AccountSection";
import { OrganizationSection } from "./OrganizationSection";

const TABS = [
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "account", label: "Compte", icon: User },
  { id: "organization", label: "Organisation", icon: Building2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsTabs() {
  const [active, setActive] = useState<TabId>("appearance");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
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
      {active === "account" && <AccountSection />}
      {active === "organization" && <OrganizationSection />}
    </div>
  );
}
