export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mats Tyldum",
    url: "https://tyldum.dev",
    image: "https://tyldum.dev/android-chrome-512x512.png",
    jobTitle: "Chief Technology Officer",
    description:
      "Technology leader with a developer background. Enjoy combining strategy, leadership, and technical work.",
    worksFor: {
      "@type": "Organization",
      name: "Outlet Group",
    },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "NTNU - Norwegian University of Science and Technology",
      },
      {
        "@type": "CollegeOrUniversity",
        name: "University of Stavanger",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bergen",
      addressCountry: "Norway",
    },
    knowsAbout: [
      "React",
      "TypeScript",
      "Next.js",
      ".NET",
      "C#",
      "REST/OpenAPI",
      "MongoDB",
      "Azure",
      "Kubernetes",
      "Docker",
      "GitHub Actions",
      "Team Leadership",
      "Technical Roadmapping",
      "Technical Architecture",
      "Payment Services",
      "Software Development",
    ],
    hasOccupation: {
      "@type": "Occupation",
      name: "Chief Technology Officer",
      occupationLocation: {
        "@type": "City",
        name: "Bergen",
      },
      description:
        "Leading technology strategy, product development, and technical execution across Outlet Group.",
    },
    sameAs: [
      "https://www.linkedin.com/in/mtyldum/",
      "https://github.com/maattss",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function CvProfileJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "Mats Tyldum",
      url: "https://tyldum.dev/en/cv",
      image: "https://tyldum.dev/android-chrome-512x512.png",
      jobTitle: "Chief Technology Officer",
      description:
        "Technology leader with a developer background. Enjoy combining strategy, leadership, and technical work.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bergen",
        addressCountry: "Norway",
      },
      worksFor: {
        "@type": "Organization",
        name: "Outlet Group",
      },
      sameAs: [
        "https://www.linkedin.com/in/mtyldum/",
        "https://github.com/maattss",
      ],
      hasCredential: [
        {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "degree",
          name: "MSc in Computer Science",
          description: "Specialization in software development.",
          recognizedBy: {
            "@type": "CollegeOrUniversity",
            name: "NTNU - Norwegian University of Science and Technology",
          },
        },
        {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "degree",
          name: "BSc in Computer Science",
          recognizedBy: {
            "@type": "CollegeOrUniversity",
            name: "University of Stavanger",
          },
        },
      ],
      knowsAbout: [
        "React",
        "TypeScript",
        "Next.js",
        ".NET",
        "C#",
        "REST/OpenAPI",
        "MongoDB",
        "Azure",
        "Kubernetes",
        "Docker",
        "GitHub Actions",
        "Team Leadership",
        "Technical Roadmapping",
        "Technical Architecture",
        "Payment Services",
        "Software Development",
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mats Tyldum",
    url: "https://tyldum.dev",
    image: "https://tyldum.dev/android-chrome-512x512.png",
    description: "Personal website for Mats Tyldum - CTO at Outlet Group",
    author: {
      "@type": "Person",
      name: "Mats Tyldum",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
