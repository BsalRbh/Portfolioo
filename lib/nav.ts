export type NavEntry = { key: string; label: string; id: string };

export const NAV: NavEntry[] = [
  { key: "h", label: "Home", id: "hero" },
  { key: "w", label: "Work", id: "work" },
  { key: "a", label: "About", id: "about" },
  { key: "p", label: "Process", id: "process" },
  { key: "r", label: "Writing", id: "writing" },
  { key: "o", label: "Tools", id: "tools" },
  { key: "c", label: "CV", id: "cv" },
  { key: "n", label: "Now", id: "now" },
  { key: "x", label: "Contact", id: "contact" },
];

export type Command = { id: string; label: string; hint: string };

export const COMMANDS: Command[] = [
  { id: "goto:hero", label: "Go to Hero", hint: "g h" },
  { id: "goto:work", label: "Go to Selected Work", hint: "g w" },
  { id: "goto:about", label: "Go to About", hint: "g a" },
  { id: "goto:process", label: "Go to Process", hint: "g p" },
  { id: "goto:writing", label: "Go to Writing", hint: "g r" },
  { id: "goto:tools", label: "Go to Tools", hint: "g o" },
  { id: "goto:cv", label: "Go to CV", hint: "g c" },
  { id: "goto:now", label: "Go to Now", hint: "g n" },
  { id: "goto:contact", label: "Go to Contact", hint: "g x" },
  { id: "act:email", label: "Compose email", hint: "↵" },
  { id: "act:linkedin", label: "Open LinkedIn", hint: "↵" },
  { id: "act:facebook", label: "Open Facebook", hint: "↵" },
  { id: "act:instagram", label: "Open Instagram", hint: "↵" },
  { id: "act:reset", label: "Reset project layout", hint: "↵" },
  { id: "act:theme", label: "Cycle theme (dark / light / crt / newspaper / blueprint / neon)", hint: "t" },
  { id: "act:aviary", label: "Toggle aviary (shoot the birds)", hint: "b" },
  { id: "act:leaderboard", label: "View aviary leaderboard", hint: "l" },
  { id: "act:screensaver", label: "Start screensaver", hint: "s" },
  { id: "act:tools", label: "Open tools page", hint: "↵" },
];
