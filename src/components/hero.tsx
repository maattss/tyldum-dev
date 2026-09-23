import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SocialLinks } from "./social-links";
import { HeroScroll } from "./hero-scroll";
import { RidgePanel, SketchPanel, tornEdge } from "./hero-art";
import {
  parseCvEducationItems,
  parseCvExperienceItems,
} from "@/lib/content-schemas";

export async function Hero() {
  const locale = await getLocale();
  const t = await getTranslations("hero");
  const cvT = await getTranslations("cv");

  const jobs = parseCvExperienceItems(cvT.raw("experience.items"), locale);
  const [degree] = parseCvEducationItems(cvT.raw("education.items"), locale);
  const glance = [
    { label: t("glance.based"), value: cvT("contact.location") },
    {
      label: t("glance.previously"),
      value: jobs
        .slice(1, 4)
        .map((job) => job.company)
        .join(", "),
    },
    { label: t("glance.education"), value: `${degree.degree}, ${degree.school}` },
  ];

  return (
    <>
      <HeroScroll className="hero-scroll">
        <div className="hero-stage">
          <div className="horizon">
            <div className="horizon-words">
              <p className="horizon-greeting" aria-hidden="true">
                {t("greeting")}
              </p>
              <h1 className="horizon-name">{t("name")}</h1>
            </div>
            <div className="horizon-planet" aria-hidden="true" />
          </div>

          <div className="curtain curtain-left" aria-hidden="true">
            <div className="curtain-paper" style={{ clipPath: tornEdge("left", 3) }}>
              <SketchPanel />
            </div>
          </div>
          <div className="curtain curtain-right" aria-hidden="true">
            <div className="curtain-paper" style={{ clipPath: tornEdge("right", 11) }}>
              <RidgePanel />
            </div>
          </div>

          <p className="hero-hint" aria-hidden="true">
            {t("scrollHint")}
          </p>
        </div>
      </HeroScroll>

      <section className="mx-auto max-w-2xl px-4 py-20 sm:py-28">
        <div className="mb-8 h-16 w-16 overflow-hidden rounded-sm border border-border bg-card">
          <Image
            src="/images/profile.jpg"
            alt={t("name")}
            width={64}
            height={64}
            sizes="64px"
            className="h-full w-full object-cover"
          />
        </div>

        <p className="text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
          {t("tagline")}
        </p>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {t("description")}
        </p>

        <div className="mt-8">
          <SocialLinks />
        </div>

        <div className="mt-16 font-sans">
          <h2 className="mb-3 text-sm font-medium text-foreground">
            {t("glance.title")}
          </h2>
          <table className="w-full border-collapse text-left text-sm">
            <tbody>
              {glance.map((row) => (
                <tr key={row.label}>
                  <th
                    scope="row"
                    className="w-1/3 border border-border px-3 py-3 align-top font-medium text-foreground"
                  >
                    {row.label}
                  </th>
                  <td className="border border-border px-3 py-3 text-muted-foreground">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link
            href={`/${locale}/cv`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {t("glance.cv")}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
