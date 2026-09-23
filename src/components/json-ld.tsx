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

const OG_IMAGE = absoluteUrl("/android-chrome-512x512.png");
const SOCIAL_PROFILES = [LINKEDIN_URL, GITHUB_URL];
const JOB_TITLE = "Chief Technology Officer";
const EMPLOYER = cv.experience.items[0].company;
const KNOWS_ABOUT = cv.skills.categories.flatMap((category) => category.items);
const ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Bergen",
  addressCountry: "Norway",
};

// Full institution names; the CV itself uses the short forms.
const SCHOOL_NAMES: Record<string, string> = {
  NTNU: "NTNU - Norwegian University of Science and Technology",
};

function schoolName(school: string): string {
  return SCHOOL_NAMES[school] ?? school;
}

const personBase = {
  "@type": "Person",
  name: PERSON_NAME,
  image: OG_IMAGE,
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
            name: "Bergen",
          },
          description: cv.experience.items[0].description,
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
        name: PERSON_NAME,
        url: SITE_URL,
        image: OG_IMAGE,
        description: enMessages.metadata.description,
        author: {
          "@type": "Person",
          name: PERSON_NAME,
        },
      }}
    />
  );
}
