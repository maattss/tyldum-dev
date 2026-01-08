import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mats Tyldum | Teknologileder",
  description:
    "Personlig nettside for Mats Tyldum - Teknologileder hos Sparebanken Norge",
  keywords: ["Mats Tyldum", "teknologileder", "utvikler", "Bergen", "Sparebanken Norge"],
  authors: [{ name: "Mats Tyldum" }],
  openGraph: {
    title: "Mats Tyldum | Teknologileder",
    description:
      "Personlig nettside for Mats Tyldum - Teknologileder hos Sparebanken Norge",
    url: "https://tyldum.dev",
    siteName: "tyldum.dev",
    locale: "no_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mats Tyldum | Teknologileder",
    description:
      "Personlig nettside for Mats Tyldum - Teknologileder hos Sparebanken Norge",
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
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
