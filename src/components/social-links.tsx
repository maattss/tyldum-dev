import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";

export async function SocialLinks() {
  const t = await getTranslations("social");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Button
        size="lg"
        asChild
        className="w-full sm:w-auto bg-primary text-primary-foreground shadow-[0_18px_45px_-25px_rgba(78,167,252,0.95)] hover:bg-primary/90"
      >
        <a
          href="https://www.linkedin.com/in/mtyldum/"
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
        >
          <Linkedin className="h-5 w-5" />
          {t("linkedin")}
        </a>
      </Button>
      <Button
        variant="outline"
        size="lg"
        asChild
        className="w-full sm:w-auto border-border bg-card/75 hover:bg-secondary/75 backdrop-blur-sm"
      >
        <a
          href="https://github.com/maattss"
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
        >
          <Github className="h-5 w-5" />
          {t("github")}
        </a>
      </Button>
    </div>
  );
}
