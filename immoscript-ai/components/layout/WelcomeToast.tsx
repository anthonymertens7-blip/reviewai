"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Bonjour";
  if (hour >= 12 && hour < 18) return "Bon après-midi";
  if (hour >= 18 && hour < 22) return "Bonsoir";
  return "Bonne nuit";
}

export function WelcomeToast() {
  const { user, isLoaded } = useUser();
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    if (sessionStorage.getItem("immoscript-welcomed")) return;
    sessionStorage.setItem("immoscript-welcomed", "1");

    setShouldRender(true);
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    const hideTimer = setTimeout(() => setIsVisible(false), 4500);
    const removeTimer = setTimeout(() => setShouldRender(false), 4900);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [isLoaded]);

  if (!shouldRender || !user) return null;

  const greeting = getGreeting(new Date().getHours());

  return (
    <div
      className={`fixed left-24 top-6 z-50 flex items-center gap-3 rounded-3xl border bg-white px-5 py-4 shadow-xl transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-lg">👋</span>
      <div>
        <p className="font-semibold text-gray-900">
          {greeting}
          {user.firstName ? `, ${user.firstName}` : ""}
        </p>
        <p className="text-sm text-gray-500">Bon retour sur ImmoScript AI.</p>
      </div>
    </div>
  );
}
