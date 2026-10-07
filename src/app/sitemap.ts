import { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { absoluteUrl } from "@/lib/site";

// No lastModified, changeFrequency or priority: there is no real modification
// date to report (a generated "now" claims every page changed), and Google
// ignores the other two.
const paths = ["", "/cv"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: absoluteUrl(`/${locale}${path}`),
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.map((alternate) => [alternate, absoluteUrl(`/${alternate}${path}`)]),
          ),
          // The unprefixed path picks the visitor's language (see proxy.ts).
          "x-default": absoluteUrl(path || "/"),
        },
      },
    })),
  );
}
