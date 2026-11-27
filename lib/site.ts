// Site identity + structured data, shared by both root layouts, the blog,
// the feeds and llms.txt. One source of truth for "who is this site about".

export const SITE_URL = "https://bishalrajbahak.com.np";
export const AUTHOR = "Bishal Rajbahak";
export const SITE_TITLE = "Bishal Rajbahak — Full-Stack Developer in Kathmandu, Nepal";
export const SITE_DESCRIPTION =
  "Bishal Rajbahak is a full-stack developer building fast, reliable web apps with React, Next.js and Go. Based in Kathmandu, working with teams worldwide.";

// Stable @ids so every page's JSON-LD points at the same entities.
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const SAME_AS = [
  "https://www.linkedin.com/in/bishalrajbahak",
  "https://www.facebook.com/bsal.rbh/",
  "https://www.instagram.com/bsal.rbh/",
];

export const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: AUTHOR,
  alternateName: "बिशाल राजबाहक",
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  email: "mailto:bsl.rbh@gmail.com",
  jobTitle: "Full-Stack Developer",
  description:
    "Full-stack developer (React, Next.js, Go, PostgreSQL) in Kathmandu, Nepal, working remotely with a US-based team at One Accord. Former teacher and accountant.",
  worksFor: { "@type": "Organization", name: "One Accord" },
  address: { "@type": "PostalAddress", addressLocality: "Kathmandu", addressCountry: "NP" },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Purbanchal University" },
    { "@type": "EducationalOrganization", name: "Pearson Online Academy UK" },
  ],
  hasOccupation: {
    "@type": "Occupation",
    name: "Full-Stack Developer",
    occupationLocation: { "@type": "City", name: "Kathmandu" },
    skills: "React, Next.js, TypeScript, Go, Node.js, PostgreSQL, Tailwind CSS",
  },
  knowsAbout: ["React", "Next.js", "TypeScript", "Go", "Node.js", "PostgreSQL", "Full-Stack Development", "Web Performance"],
  knowsLanguage: ["English", "Nepali"],
  sameAs: SAME_AS,
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: AUTHOR,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
};

/** Home page: a ProfilePage about the person (Google's profile-page markup). */
export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profile`,
      url: SITE_URL,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
      inLanguage: "en",
    },
    person,
    website,
  ],
};

/** Every other page: just the site + person, so the graph stays connected. */
export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [person, website],
};
