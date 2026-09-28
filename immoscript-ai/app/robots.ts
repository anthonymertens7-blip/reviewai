import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://immoscriptai.vercel.app";

// Seules les pages publiques (voir isPublicRoute dans middleware.ts) ont un intérêt à être
// indexées — tout le reste nécessite une session Clerk et n'est de toute façon pas crawlable.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/tarifs", "/blog", "/blog/", "/mentions-legales", "/cgu", "/cgv", "/confidentialite"],
      disallow: ["/api/", "/dashboard", "/programs", "/library", "/settings", "/statistics", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
