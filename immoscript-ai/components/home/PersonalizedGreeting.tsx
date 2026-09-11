"use client";

import { useUser } from "@clerk/nextjs";
import { getGreeting } from "@/lib/greeting";

export function PersonalizedGreeting() {
  const { user } = useUser();
  const greeting = getGreeting(new Date().getHours());

  return (
    <p className="max-w-xl text-lg text-gray-600">
      {greeting}
      {user?.firstName ? `, ${user.firstName}` : ""} — retrouvez votre espace ImmoScript AI.
    </p>
  );
}
