import enMessages from "@/i18n/messages/en.json";
import {
  GITHUB_URL,
  LINKEDIN_URL,
  PERSON_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/site";

// Structured data stays in English on both locales, and is derived from the
// English CV messages so it cannot drift from what the CV page renders.
const cv = enMessages.cv;

const PROFILE_IMAGE = absoluteUrl("/images/profile.jpg");
// Stable node ids, so the Person, WebSite and ProfilePage blocks are read as
// one entity rather than three unrelated ones.
const PERSON_ID = absoluteUrl("/#person");
const WEBSITE_ID = absoluteUrl("/#website");
const SOCIAL_PROFILES = [LINKEDIN_URL, GITHUB_URL];
// Full forms for structured data; the CV itself uses the short ones.
const ROLE_NAMES: Record<string, string> = {
  CTO: "Chief Technology Officer",
};
const SCHOOL_NAMES: Record<string, string> = {
  NTNU: "NTNU - Norwegian University of Science and Technology",
};

const currentJob = cv.experience.items[0];
const JOB_TITLE = ROLE_NAMES[currentJob.role] ?? currentJob.role;
const EMPLOYER = currentJob.company;
const KNOWS_ABOUT = cv.skills.categories.flatMap((category) => category.items);

// "Bergen, Norway" in the CV header, split into its schema.org parts.
const [CITY, COUNTRY] = cv.contact.location.split(",").map((part) => part.trim());
const ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: CITY,
  ...(COUNTRY ? { addressCountry: COUNTRY } : {}),
};

function schoolName(school: string): string {
  return SCHOOL_NAMES[school] ?? school;
}

const personBase = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: PERSON_NAME,
  image: PROFILE_IMAGE,
  jobTitle: JOB_TITLE,
  description: cv.summary,
  address: ADDRESS,
  worksFor: {
    "@type": "Organization",
    name: EMPLOYER,
  },
  knowsAbout: KNOWS_ABOUT,
  sameAs: SOCIAL_PROFILES,
};

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        ...personBase,
        url: SITE_URL,
        alumniOf: [...new Set(cv.education.items.map((edu) => edu.school))].map(
          (school) => ({
            "@type": "CollegeOrUniversity",
            name: schoolName(school),
          }),
        ),
        hasOccupation: {
          "@type": "Occupation",
          name: JOB_TITLE,
          occupationLocation: {
            "@type": "City",
            name: CITY,
          },
          description: currentJob.description,
        },
      }}
    />
  );
}

export function CvProfileJsonLd({ locale }: { locale: string }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        url: absoluteUrl(`/${locale}/cv`),
        inLanguage: locale === "no" ? "nb" : "en",
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: {
          ...personBase,
          url: SITE_URL,
          hasCredential: cv.education.items.map((edu) => ({
            "@type": "EducationalOccupationalCredential",
            credentialCategory: "degree",
            name: edu.degree,
            ...(edu.description ? { description: edu.description } : {}),
            recognizedBy: {
              "@type": "CollegeOrUniversity",
              name: schoolName(edu.school),
            },
          })),
        },
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: PERSON_NAME,
        inLanguage: ["nb", "en"],
        url: SITE_URL,
        image: PROFILE_IMAGE,
        description: enMessages.metadata.description,
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
      }}
    />
  );
}
