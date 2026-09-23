import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "@/components/brand-icons";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/site";

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
          href={LINKEDIN_URL}
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
          href={GITHUB_URL}
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
