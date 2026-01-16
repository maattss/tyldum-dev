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
        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 group"
      >
        <a
          href="https://www.linkedin.com/in/mtyldum/"
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
        >
          <Linkedin className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          {t("linkedin")}
        </a>
      </Button>
      <Button 
        variant="outline" 
        size="lg" 
        asChild
        className="w-full sm:w-auto border-2 hover:bg-accent hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group"
      >
        <a
          href="https://github.com/maattss"
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
        >
          <Github className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          {t("github")}
        </a>
      </Button>
    </div>
  );
}
