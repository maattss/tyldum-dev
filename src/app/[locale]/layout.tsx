import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PersonJsonLd, WebsiteJsonLd } from "@/components/json-ld";
import { locales } from "@/i18n/config";
import "../globals.css";

// Export viewport for optimal initial render
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
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
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');var isDark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches)||(t===null);var color=isDark?'#08090a':'#f7f9fd';if(isDark){d.classList.add('dark')}else{d.classList.remove('dark')}d.style.backgroundColor=color;document.head.querySelectorAll('meta[name="theme-color"][media]').forEach(function(node){node.remove()});var themeMeta=document.head.querySelector('meta[name="theme-color"]:not([media])');if(!themeMeta){themeMeta=document.createElement('meta');themeMeta.name='theme-color';document.head.appendChild(themeMeta)}themeMeta.setAttribute('content',color);var appleMeta=document.head.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]:not([media])');if(!appleMeta){appleMeta=document.createElement('meta');appleMeta.name='apple-mobile-web-app-status-bar-style';document.head.appendChild(appleMeta)}appleMeta.setAttribute('content',isDark?'black-translucent':'default')}catch(e){}})()`,
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
