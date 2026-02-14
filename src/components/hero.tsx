import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SocialLinks } from "./social-links";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
      <div className="mb-8 animate-fade-in">
        <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border border-border bg-card ring-4 ring-primary/20 sm:h-44 sm:w-44">
          <Image
            src="/images/profile.jpg"
            alt={t("name")}
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
        <p className="text-lg text-muted-foreground">{t("greeting")}</p>
        <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          {t("name")}
        </h1>
        <p className="text-xl font-medium text-foreground/85 sm:text-2xl">{t("tagline")}</p>
        <p className="mx-auto max-w-lg leading-relaxed text-muted-foreground">{t("description")}</p>
      </div>

      <div className="mt-10 animate-fade-in">
        <SocialLinks />
      </div>
    </section>
  );
}
