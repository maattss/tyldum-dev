import { useTranslations } from "next-intl";
import Image from "next/image";
import { SocialLinks } from "./social-links";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
      <div className="mb-8 animate-fade-in">
        <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-background sm:h-44 sm:w-44 glow animate-float">
          <Image
            src="/images/profile.jpg"
            alt={t("name")}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground animate-fade-in-delay-1">
          {t("greeting")}
        </p>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl animate-fade-in-delay-1">
          <span className="gradient-text">{t("name")}</span>
        </h1>
        <p className="text-xl font-medium text-foreground/80 sm:text-2xl animate-fade-in-delay-2">
          {t("tagline")}
        </p>
        <p className="mx-auto max-w-lg text-muted-foreground leading-relaxed animate-fade-in-delay-2">
          {t("description")}
        </p>
      </div>
      <div className="mt-10 animate-fade-in-delay-3">
        <SocialLinks />
      </div>
    </section>
  );
}
