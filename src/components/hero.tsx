import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SocialLinks } from "./social-links";

export async function Hero() {
  const heroT = await getTranslations("hero");

  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
      <div className="mb-8 animate-fade-in">
        <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-2xl border border-border/90 bg-card ring-1 ring-white/10 shadow-[0_24px_80px_-50px_rgba(47,185,255,0.65)] sm:h-44 sm:w-44">
          <Image
            src="/images/profile.jpg"
            alt={heroT("name")}
            width={176}
            height={176}
            sizes="(max-width: 640px) 144px, 176px"
            className="h-full w-full object-cover"
            priority
            fetchPriority="high"
          />
        </div>
      </div>

      <div className="space-y-6 animate-fade-in">
        <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          <span className="gradient-text">{heroT("name")}</span>
        </h1>
        <p className="text-xl font-medium text-foreground/90 sm:text-2xl">{heroT("tagline")}</p>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {heroT("description")}
        </p>
      </div>

      <div className="mt-10 animate-fade-in">
        <SocialLinks />
      </div>
    </section>
  );
}
