export type Station = {
  year: string;
  role: string;
  org: string;
  desc: string;
  stack: string[];
  now?: boolean;
};

export const STATIONS: Station[] = [
  {
    year: "2025 — now",
    role: "Software Engineer (Full-stack)",
    org: "One Accord · United States (remote)",
    desc: "Full-stack work for a US-based team. React/Next on the front, Go services on the back, postgres underneath.",
    stack: ["react", "next.js", "go", "postgres"],
    now: true,
  },
  {
    year: "2024 — 25",
    role: "Associate Software Engineer",
    org: "Webpoint Solutions, LLC · Kathmandu",
    desc: "Promoted from trainee. Shipped features end-to-end across several internal projects — React/Next on the front, Go services on the back.",
    stack: ["react", "next", "go"],
  },
  {
    year: "2023 — 24",
    role: "Associate Software Engineer (Trainee)",
    org: "Webpoint Solutions, LLC",
    desc: "First engineering role. Learned the shape of a real codebase — PRs, reviews, the joy of a green CI.",
    stack: ["react", "javascript"],
  },
  {
    year: "2024 — 25",
    role: "Postgraduate Diploma in Computer Science",
    org: "Purbanchal University",
    desc: "One-year postgraduate diploma alongside full-time work. Coursework in algorithms, software design, and modern web architecture.",
    stack: ["academic"],
  },
  {
    year: "2023",
    role: "BTEC Subsidiary Diploma in IT",
    org: "Pearson Online Academy UK (Global)",
    desc: "Six-month onsite-in-Nepal program. The bridge between teaching and engineering.",
    stack: ["diploma"],
  },
  {
    year: "2018 — 23",
    role: "Teacher",
    org: "Motherland Secondary School",
    desc: "Five years teaching. Lesson planning, student assessment, parent engagement — the work that still shapes how I write code today.",
    stack: ["teaching"],
  },
  {
    year: "2017 — 18",
    role: "Junior Accountant",
    org: "Sipradi Trading Pvt. Ltd",
    desc: "Invoicing, cash handling, filing. Learned that spreadsheets are just stubborn frontends.",
    stack: ["accounts"],
  },
  {
    year: "2016 — 17",
    role: "Intern",
    org: "Nepal SBI Bank · Lainchaur",
    desc: "Customer assistance, documenting and reporting. First proper desk job; first taste of how systems fail people.",
    stack: ["banking"],
  },
];
