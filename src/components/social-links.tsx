import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";

export function SocialLinks() {
  const t = useTranslations("social");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Button 
        size="lg" 
        asChild
        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
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
        className="w-full sm:w-auto border-2 hover:bg-accent transition-all hover:-translate-y-0.5"
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
