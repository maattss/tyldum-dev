import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "@/components/brand-icons";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/site";

export async function SocialLinks() {
  const t = await getTranslations("social");

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button size="lg" asChild className="w-full sm:w-auto">
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-4 w-4" />
          {t("linkedin")}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="lg"
        asChild
        className="w-full bg-transparent shadow-none sm:w-auto"
      >
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          <Github className="h-4 w-4" />
          {t("github")}
          <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
        </a>
      </Button>
    </div>
  );
}
