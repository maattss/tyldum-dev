import { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { absoluteUrl } from "@/lib/site";

// Blog is intentionally excluded until there is content to publish.
const staticPages = [
  { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/cv", changeFrequency: "monthly" as const, priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

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
