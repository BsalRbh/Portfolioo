export type Project = {
  num: string;
  title: string;
  tag: string;
  kind: string;
  year: string;
  x: number;
  y: number;
  desc: string;
};

export const PROJECTS: Project[] = [
  {
    num: "01",
    title: "One Accord App",
    tag: "work · react/next · go",
    kind: "product",
    year: "2025",
    x: 60,
    y: 50,
    desc: "Full-stack work at One Accord — React/Next on the front, Go services on the back. Building for a US-based team from Kathmandu.",
  },
  {
    num: "02",
    title: "Webpoint Suite",
    tag: "work · react/next · go",
    kind: "product",
    year: "2024",
    x: 380,
    y: 90,
    desc: "Worked across a handful of internal projects at Webpoint Solutions — frontends in React/Next, services in Go.",
  },
  {
    num: "03",
    title: "E-commerce Platform",
    tag: "product · next/go",
    kind: "product",
    year: "2025",
    x: 700,
    y: 30,
    desc: "End-to-end commerce build — storefront in Next.js, cart/checkout/inventory services in Go, postgres underneath.",
  },
  {
    num: "04",
    title: "This Site",
    tag: "personal · react",
    kind: "play",
    year: "2026",
    x: 140,
    y: 320,
    desc: "Keyboard-first, draggable, slightly weird. You're looking at it.",
  },
  {
    num: "05",
    title: "Component Kit",
    tag: "oss · ts",
    kind: "library",
    year: "2025",
    x: 460,
    y: 380,
    desc: "Headless React primitives I keep reusing across projects. Composable, themable.",
  },
];
