import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog/posts";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://immoscriptai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/tarifs", "/blog", "/mentions-legales", "/cgu", "/cgv", "/confidentialite"].map(
    (path) => ({ url: `${SITE_URL}${path}`, lastModified: new Date() })
  );

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [...staticRoutes, ...blogRoutes];
}
