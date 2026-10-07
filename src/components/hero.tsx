import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/site";

const inlineLink =
  "text-foreground underline decoration-1 underline-offset-4 hover:decoration-2";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="pt-16 pb-14 sm:pt-24">
      <Image
        src="/images/profile.jpg"
        alt={t("name")}
        width={88}
        height={88}
        sizes="88px"
        className="mb-8 h-[88px] w-[88px] rounded-[14px] border border-border object-cover"
        preload
        fetchPriority="high"
      />
      <h1 className="text-[40px] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[52px]">
        <span className="mr-3 font-mono font-normal text-primary sm:mr-4" aria-hidden="true">
          #
        </span>
        {t("name")}
      </h1>
      <p className="mt-5 text-lg sm:text-xl">{t("tagline")}.</p>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
        {t.rich("description", {
          github: (chunks) => (
            <a href={GITHUB_URL} className={inlineLink}>
              {chunks}
            </a>
          ),
          linkedin: (chunks) => (
            <a href={LINKEDIN_URL} className={inlineLink}>
              {chunks}
            </a>
          ),
        })}
      </p>
    </section>
  );
}
