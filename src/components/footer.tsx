import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { COLUMN } from "@/lib/layout";

// Prerendered with the page and refreshed daily, so the year rolls over on
// 1 January without a deploy.
async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const t = await getTranslations("footer");
  const year = await getCurrentYear();

  return (
    <footer className="mt-auto print:hidden">
      <div
        className={`${COLUMN} pt-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))]`}
      >
        <p className="border-t border-border pt-6 font-mono text-xs text-muted-foreground">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
