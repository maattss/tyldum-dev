import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tyldum.dev";
  const locales = ["no", "en"];
  
  // Static pages
  const staticPages = ["", "/cv", "/blog", "/reading"];
  
  const staticUrls = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? "weekly" as const : "monthly" as const,
      priority: page === "" ? 1.0 : 0.8,
    }))
  );

  // Blog posts
  const blogUrls = locales.flatMap((locale) => {
    const posts = getBlogPosts(locale);
    return posts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  });

  return [...staticUrls, ...blogUrls];
}
