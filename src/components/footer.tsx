import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto font-sans print:hidden">
      <Separator />
      <div className="container mx-auto px-4 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <p className="text-xs text-muted-foreground">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
