export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mats Tyldum",
    url: "https://tyldum.dev",
    image: "https://tyldum.dev/android-chrome-512x512.png",
    jobTitle: "Technology Leader",
    worksFor: {
      "@type": "Organization",
      name: "Sparebanken Norge",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "NTNU - Norwegian University of Science and Technology",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bergen",
      addressCountry: "Norway",
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

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mats Tyldum",
    url: "https://tyldum.dev",
    image: "https://tyldum.dev/android-chrome-512x512.png",
    description: "Personal website for Mats Tyldum - Technology Leader",
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
