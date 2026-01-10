import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";

export async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      <Separator />
      <div className="container mx-auto px-4 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <p className="text-center text-sm text-muted-foreground">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
