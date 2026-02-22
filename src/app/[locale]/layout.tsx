import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PersonJsonLd, WebsiteJsonLd } from "@/components/json-ld";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { SpeedInsightsClient } from "@/components/speed-insights-client";
import { locales } from "@/i18n/config";
import { getThemeBootstrapScript } from "@/lib/theme/theme-meta";
import "../globals.css";

// Export viewport for optimal initial render
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const ibmPlexSans = localFont({
  variable: "--font-plex-sans",
  src: [
    {
      path: "../../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
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
  preload: false,
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
    metadataBase: new URL("https://tyldum.dev"),
    title: {
      template: "tyldum.dev | %s",
      default: t("title"),
    },
    description: t("description"),
    keywords: t("keywords").split(", "),
    authors: [{ name: "Mats Tyldum" }],
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      ],
      apple: [{ url: "/apple-touch-icon.png" }],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://tyldum.dev",
      siteName: "tyldum.dev",
      locale: locale === "no" ? "no_NO" : "en_US",
      type: "website",
      images: [
        {
          url: "/android-chrome-512x512.png",
          width: 512,
          height: 512,
          alt: "Mats Tyldum",
        },
      ],
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
      canonical: `https://tyldum.dev/${locale}`,
      languages: {
        "no": "https://tyldum.dev/no",
        "en": "https://tyldum.dev/en",
      },
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "tyldum.dev",
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
  const messages = await getMessages();
  const clientMessages = {
    language: messages.language,
    theme: messages.theme,
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <PersonJsonLd />
        <WebsiteJsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeBootstrapScript(),
          }}
        />
      </head>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeColorSync />
          <NextIntlClientProvider messages={clientMessages}>
            <div className="bg-gradient-blur" aria-hidden="true" />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
        <WebVitalsReporter />
        <Analytics />
        <SpeedInsightsClient />
      </body>
    </html>
  );
}
