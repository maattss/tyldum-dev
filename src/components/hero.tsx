import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SocialLinks } from "./social-links";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
      <div className="mb-8 group">
        {/* Using content-visibility for better paint performance */}
        <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-background sm:h-44 sm:w-44 glow animate-float-delayed transition-all duration-300 group-hover:ring-primary/40 group-hover:scale-105">
          <Image
            src="/images/profile.jpg"
            alt={t("name")}
            width={176}
            height={176}
            sizes="(max-width: 640px) 144px, 176px"
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            priority
            fetchPriority="high"
          />
        </div>
      </div>
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">
          {t("greeting")}
        </p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          <span className="gradient-text">{t("name")}</span>
        </h1>
        <p className="text-xl font-medium text-foreground/80 sm:text-2xl">
          {t("tagline")}
        </p>
        <p className="mx-auto max-w-lg text-muted-foreground leading-relaxed">
          {t("description")}
        </p>
      </div>
      <div className="mt-10">
        <SocialLinks />
      </div>
    </section>
  );
}
