import { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The blog is unlinked and empty; keep it out of the index for now.
      disallow: ["/no/blog", "/en/blog"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
