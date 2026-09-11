"use client";

import { OrganizationProfile } from "@clerk/nextjs";

export function OrganizationSection() {
  return (
    <div className="overflow-hidden rounded-3xl border bg-white p-2 dark:border-gray-700 dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
      <OrganizationProfile
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
            card: "w-full shadow-none border-none",
          },
        }}
      />
    </div>
  );
}
