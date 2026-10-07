import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";

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
      <Separator />
      <div className="container mx-auto px-4 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <p className="text-center text-sm text-muted-foreground">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
