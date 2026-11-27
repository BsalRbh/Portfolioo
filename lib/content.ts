// Plain-language content for the main (non-terminal) portfolio at "/".
// Career history is shared with the terminal site via lib/stations.ts.
import { STATIONS, type Station } from "@/lib/stations";

export const PROFILE = {
  name: "Bishal Rajbahak",
  role: "Full-stack developer",
  location: "Kathmandu, Nepal",
  timezone: "UTC+05:45",
  email: "bsl.rbh@gmail.com",
  availability: "Open to interesting product work",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/bishalrajbahak" },
    { label: "Instagram", href: "https://www.instagram.com/bsal.rbh/" },
    { label: "Facebook", href: "https://www.facebook.com/bsal.rbh/" },
  ],
};

export const SERVICES = [
  {
    title: "Websites & web apps",
    body: "Fast, accessible sites and apps built with React and Next.js that work well on every screen size.",
  },
  {
    title: "Backends & APIs",
    body: "Reliable services in Go and Node with PostgreSQL — the parts users never see but always depend on.",
  },
  {
    title: "End-to-end features",
    body: "From a rough idea to something shipped: planning, building, testing, and the small details in between.",
  },
];

export type WorkItem = {
  title: string;
  context: string;
  year: string;
  summary: string;
  tags: string[];
};

export const WORK: WorkItem[] = [
  {
    title: "One Accord",
    context: "Product engineering · Remote, US",
    year: "2025 — now",
    summary:
      "Building product features end to end for a US-based team — React and Next.js interfaces backed by Go services and PostgreSQL.",
    tags: ["React", "Next.js", "Go", "PostgreSQL"],
  },
  {
    title: "E-commerce platform",
    context: "Full-stack build",
    year: "2025",
    summary:
      "A complete online store: a Next.js storefront with cart, checkout and inventory services written in Go on top of PostgreSQL.",
    tags: ["Next.js", "Go", "PostgreSQL"],
  },
  {
    title: "Webpoint Solutions",
    context: "Internal products · Kathmandu",
    year: "2023 — 25",
    summary:
      "Shipped features across several internal products, growing from trainee to associate engineer along the way.",
    tags: ["React", "Next.js", "Go"],
  },
  {
    title: "Component Kit",
    context: "Open source",
    year: "2025",
    summary:
      "Reusable, themeable React building blocks I use to ship consistent interfaces faster across projects.",
    tags: ["React", "TypeScript"],
  },
];

const EDUCATION_TAGS = new Set(["academic", "diploma"]);

export const EXPERIENCE: Station[] = STATIONS.filter(
  (s) => !s.stack.some((t) => EDUCATION_TAGS.has(t)),
);

export const EDUCATION: Station[] = STATIONS.filter((s) =>
  s.stack.some((t) => EDUCATION_TAGS.has(t)),
);

export const PRINCIPLES = [
  {
    title: "Understand the problem first",
    body: "Every feature starts as a short plain-English note about what's broken and what should happen.",
  },
  {
    title: "Ship a working version early",
    body: "A rough end-to-end version on day one beats a polished half — it shows what actually matters.",
  },
  {
    title: "Leave it easy to maintain",
    body: "Clear commits, short notes, and no “just in case” code, so the next change is as easy as the last.",
  },
];

export const SKILLS = ["React", "Next.js", "TypeScript", "Go", "Node.js", "PostgreSQL", "Tailwind CSS"];
