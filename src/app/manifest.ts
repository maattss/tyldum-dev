import type { MetadataRoute } from "next";
import enMessages from "@/i18n/messages/en.json";
import { PERSON_NAME, SITE_NAME } from "@/lib/site";
import { LIGHT_THEME_COLOR } from "@/lib/theme/theme-constants";

// Generated rather than a file in public/, so the name, description and colours
// follow the same sources as the rest of the site. Next links it from every page.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PERSON_NAME,
    short_name: SITE_NAME,
    description: enMessages.metadata.description,
    start_url: "/",
    display: "standalone",
    theme_color: LIGHT_THEME_COLOR,
    background_color: LIGHT_THEME_COLOR,
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
