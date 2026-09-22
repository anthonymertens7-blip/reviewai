import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/tarifs",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/mentions-legales",
  "/cgu",
  "/cgv",
  "/confidentialite",
  "/api/billing/webhook",
  "/api/cron(.*)", // auth par secret dédié (CRON_SECRET), pas par session Clerk — voir app/api/cron/*
]);

// LOCAL_TEST_MODE : sandbox de test local sans accès réseau à Clerk (voir lib/auth.ts). Même sans
// auth.protect(), clerkMiddleware() déclenche à chaque requête un "handshake" réseau vers le
// Frontend API Clerk (comportement du mode dev) — il faut donc le sauter entièrement, pas
// seulement sauter la vérification.
export default process.env.LOCAL_TEST_MODE === "1"
  ? () => NextResponse.next()
  : clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    });

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
