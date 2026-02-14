import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { ArrowRight, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function Hero() {
  const [heroT, aboutT, navT, socialT, locale] = await Promise.all([
    getTranslations("hero"),
    getTranslations("about"),
    getTranslations("nav"),
    getTranslations("social"),
    getLocale(),
  ]);

  return (
    <section className="py-14 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-6 animate-fade-in">
          <p className="text-sm font-medium text-muted-foreground">{heroT("greeting")}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {heroT("name")}
          </h1>
          <p className="text-xl font-medium text-foreground/85 sm:text-2xl">{heroT("tagline")}</p>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">{heroT("description")}</p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link href={`/${locale}/cv`}>
                {navT("cv")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="gap-2 border-border bg-card text-foreground">
              <a
                href="https://www.linkedin.com/in/mtyldum/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-4 w-4" />
                {socialT("linkedin")}
              </a>
            </Button>

            <Button asChild variant="ghost" size="lg" className="gap-2 text-muted-foreground hover:text-foreground">
              <a href="https://github.com/maattss" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                {socialT("github")}
              </a>
            </Button>
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-card p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)] animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
              <Image
                src="/images/profile.jpg"
                alt={heroT("name")}
                width={80}
                height={80}
                className="h-full w-full object-cover"
                sizes="80px"
                priority
                fetchPriority="high"
              />
            </div>
            <div>
              <p className="font-semibold text-foreground">{heroT("name")}</p>
              <p className="text-sm text-muted-foreground">{aboutT("role")}</p>
            </div>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="border-t border-border pt-3">{aboutT("role")} - {aboutT("company")}</li>
            <li className="border-t border-border pt-3">{aboutT("location")}</li>
            <li className="border-t border-border pt-3">{aboutT("education")}</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
