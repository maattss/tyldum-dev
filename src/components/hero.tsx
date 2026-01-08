import { useTranslations } from "next-intl";
import Image from "next/image";
import { SocialLinks } from "./social-links";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-primary/10 sm:h-40 sm:w-40">
          {/* Replace with your profile photo: /public/images/profile.jpg */}
          <Image
            src="/images/profile-placeholder.svg"
            alt={t("name")}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-lg text-muted-foreground">{t("greeting")}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {t("name")}
        </h1>
        <p className="text-xl text-muted-foreground sm:text-2xl">
          {t("tagline")}
        </p>
        <p className="mx-auto max-w-md text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <div className="mt-8">
        <SocialLinks />
      </div>
    </section>
  );
}
