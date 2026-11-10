import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import enMessages from "@/i18n/messages/en.json";
import noMessages from "@/i18n/messages/no.json";
import { fontVariables } from "@/lib/fonts";
import { COLUMN } from "@/lib/layout";
import { PERSON_NAME, SITE_NAME } from "@/lib/site";
import { getThemeBootstrapScript } from "@/lib/theme/theme-meta";
import "./globals.css";

// Served for every URL that matches no route, without rendering a layout: one
// static page instead of an on-demand render per unknown URL. The root layout
// lives under [locale], so this page cannot know the visitor's language and
// shows both. It sits outside the layout, so it brings its own fonts, styles
// and theme script.

// Next adds <meta name="robots" content="noindex"> to 404s itself.
export const metadata: Metadata = {
  title: `404 – ${PERSON_NAME}`,
};

const versions = [
  { locale: "no", messages: noMessages.notFound },
  { locale: "en", messages: enMessages.notFound },
] as const;

const link = "text-primary underline decoration-1 underline-offset-4 hover:decoration-2";

export default function GlobalNotFound() {
  return (
    <html lang="no" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground">
        <header className="pt-[env(safe-area-inset-top)]">
          <div className={`${COLUMN} flex h-[72px] items-center`}>
            <Link href="/" className="flex items-center gap-2.5 rounded-md font-mono text-sm font-medium">
              <BrandMark className="h-6 w-6 shrink-0 rounded-md" />
              <span>
                <span className="text-muted-foreground" aria-hidden="true">
                  ~/
                </span>
                {SITE_NAME}
              </span>
            </Link>
          </div>
        </header>
        <main className={`${COLUMN} flex-1 pt-16 pb-24 sm:pt-24`}>
          <p className="font-mono text-[13px] text-muted-foreground">404</p>
          <div className="mt-3 space-y-12">
            {versions.map(({ locale, messages }) => (
              <section key={locale} lang={locale}>
                <h1 className="text-[34px] leading-[1.1] font-semibold tracking-[-0.03em] sm:text-[40px]">
                  <span className="mr-3 font-mono font-normal text-primary" aria-hidden="true">
                    #
                  </span>
                  {messages.title}
                </h1>
                <p className="mt-5 leading-relaxed text-muted-foreground">{messages.description}</p>
                <p className="mt-4 text-[15px]">
                  <Link href={`/${locale}`} className={link}>
                    {messages.home}
                  </Link>
                </p>
              </section>
            ))}
          </div>
        </main>
      </body>
    </html>
  );
}
