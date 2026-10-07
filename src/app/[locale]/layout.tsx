import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PersonJsonLd, WebsiteJsonLd } from "@/components/json-ld";
import { SpeedInsightsClient } from "@/components/speed-insights-client";
import { ThemeSync } from "@/components/theme-sync";
import { locales } from "@/i18n/config";
import { SITE_NAME, SITE_URL, PERSON_NAME, absoluteUrl } from "@/lib/site";
import { getThemeBootstrapScript } from "@/lib/theme/theme-meta";
import "../globals.css";

// The whole site is static: fail the build if anything would make a page
// render per request.
export const ensureStatic = "navigation";

// Export viewport for optimal initial render
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// One variable file covers every weight the site uses (400-700), at half the
// size of the four static files it replaces.
const ibmPlexSans = localFont({
  variable: "--font-plex-sans",
  src: "../../../node_modules/@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2",
  weight: "100 700",
  style: "normal",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const ibmPlexMono = localFont({
  variable: "--font-plex-mono",
  src: [
    {
      path: "../../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  // Used above the fold (header, section labels), so fetch it early too.
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: `${SITE_NAME} | %s`,
      default: t("title"),
    },
    description: t("description"),
    keywords: t("keywords").split(", "),
    authors: [{ name: PERSON_NAME }],
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      ],
      apple: [{ url: "/apple-touch-icon.png" }],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: absoluteUrl(`/${locale}`),
      siteName: SITE_NAME,
      // Open Graph uses Facebook locale codes, which have no bare `no_NO`.
      locale: locale === "no" ? "nb_NO" : "en_US",
      type: "website",
      // The image itself comes from ./opengraph-image.tsx.
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: absoluteUrl(`/${locale}`),
      languages: {
        no: absoluteUrl("/no"),
        en: absoluteUrl("/en"),
        "x-default": absoluteUrl("/no"),
      },
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: SITE_NAME,
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) {
    notFound();
  }
  // Required for static rendering with next-intl; without it every page
  // opts into dynamic (per-request) rendering.
  setRequestLocale(locale);

  const t = await getTranslations("nav");
  const messages = await getMessages();
  const clientMessages = {
    language: messages.language,
    theme: messages.theme,
  };

  return (
    <html
      lang={locale}
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <PersonJsonLd />
        <WebsiteJsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeBootstrapScript(),
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground">
        <ThemeSync />
        <NextIntlClientProvider messages={clientMessages}>
          <div className="bg-gradient-blur" aria-hidden="true" />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {t("skipToContent")}
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsightsClient />
      </body>
    </html>
  );
}
