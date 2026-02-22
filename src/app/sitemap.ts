import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tyldum.dev";
  const locales = ["no", "en"];

  // Blog is intentionally hidden from navigation until content is ready.
  const staticPages = ["", "/cv"];

  return locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      changeFrequency: page === "" ? ("weekly" as const) : ("monthly" as const),
      priority: page === "" ? 1.0 : 0.8,
    })),
  );
}
