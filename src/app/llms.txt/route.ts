import enMessages from "@/i18n/messages/en.json";
import {
  GITHUB_URL,
  LINKEDIN_URL,
  PERSON_NAME,
  absoluteUrl,
} from "@/lib/site";

// Generated from the English CV messages at build time, so it cannot fall out
// of step with the CV page the way a hand-copied public/llms.txt did.
export const dynamic = "force-static";

function entry(title: string, period: string, description: string): string {
  const line = `- ${title} (${period})`;
  return description ? `${line}: ${description}` : line;
}

export function GET(): Response {
  const { cv, hero } = enMessages;

  const body = [
    `# ${PERSON_NAME}`,
    "",
    `> ${hero.tagline}. Based in ${cv.contact.location}.`,
    "",
    cv.summary,
    "",
    "## CV",
    "",
    `- [CV (English)](${absoluteUrl("/en/cv")}): Full CV with work experience, education, and skills`,
    `- [CV (Norwegian)](${absoluteUrl("/no/cv")}): Full CV in Norwegian`,
    "",
    "## Contact & Profiles",
    "",
    `- [LinkedIn](${LINKEDIN_URL}): LinkedIn profile`,
    `- [GitHub](${GITHUB_URL}): GitHub profile`,
    "",
    `## ${cv.experience.title}`,
    "",
    ...cv.experience.items.map((job) =>
      entry(`${job.role} at ${job.company}`, job.period, job.description),
    ),
    "",
    `## ${cv.education.title}`,
    "",
    ...cv.education.items.map((edu) =>
      entry(`${edu.degree}, ${edu.school}`, edu.period, edu.description),
    ),
    "",
    `## ${cv.skills.title}`,
    "",
    ...cv.skills.categories.map(
      (category) => `- ${category.name}: ${category.items.join(", ")}`,
    ),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
