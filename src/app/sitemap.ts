import { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { locales } from "@/i18n/config";
import { absoluteUrl } from "@/lib/site";

// Blog is intentionally excluded until there is content to publish.
const staticPages = [
  { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/cv", changeFrequency: "monthly" as const, priority: 0.8 },
];

// Captured when the sitemap is (re)generated, refreshed daily like the pages.
async function getLastModified(): Promise<Date> {
  "use cache";
  cacheLife("days");
  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = await getLastModified();

  return locales.flatMap((locale) =>
    staticPages.map(({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(`/${locale}${path}`),
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alternate) => [
            alternate,
            absoluteUrl(`/${alternate}${path}`),
          ]),
        ),
      },
    })),
  );
}
