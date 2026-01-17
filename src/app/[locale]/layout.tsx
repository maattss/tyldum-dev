import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PersonJsonLd, WebsiteJsonLd } from "@/components/json-ld";
import "../globals.css";

// Export viewport for optimal initial render
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafd" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1b1f" },
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Not critical for FCP
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
  };
}

export function generateStaticParams() {
  return [{ locale: "no" }, { locale: "en" }];
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

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <PersonJsonLd />
        <WebsiteJsonLd />
        {/* Inline script to set theme before paint - prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');var isDark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(isDark){d.classList.add('dark')}}catch(e){}})();(function(){try{var s='color:#06b6d4;font-weight:bold;font-size:12px;font-family:Consolas,Monaco,monospace;line-height:1.3';var h='color:#22d3ee;font-weight:900;font-size:11px;letter-spacing:1px';var t='color:#e2e8f0;font-size:12px';var m='color:#94a3b8;font-size:11px';var a='color:#a78bfa;font-weight:bold;font-size:12px';var l='color:#22d3ee;font-size:12px;text-decoration:underline';var f='color:#64748b;font-size:10px;font-style:italic';console.log('%c\\n╔══════════════════════════╗',s);console.log('%c   %cDEVELOPER CONSOLE%c   ',s,h,s);console.log('%c╠══════════════════════════╣',s);console.log('%c  %cWelcome explorer 👋%c   ',s,t,s);console.log('%c  %cOpen source site%c       ',s,m,s);console.log('%c  %c→%c %cgithub.com/maattss%c ',s,a,s,l,s);console.log('%c  %cNext.js · TS · CSS%c   ',s,f,s);console.log('%c╚══════════════════════════╝\\n',s)}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <div className="bg-gradient-blur" aria-hidden="true" />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
