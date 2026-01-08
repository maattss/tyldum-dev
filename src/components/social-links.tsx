import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";

export function SocialLinks() {
  const t = useTranslations("social");

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="lg" asChild>
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
      <Button variant="outline" size="lg" asChild>
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
