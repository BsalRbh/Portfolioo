// Visual mode cycle — driven by the T key (and the cmdk "Cycle visual mode").
// Each mode either sets `data-theme="light"` (the two base looks) or adds a
// class on <html> (crt / newspaper / blueprint / neon). Only one mode is
// active at a time; cycling swaps it cleanly.

export type Mode = {
  id: string;
  label: string;
  className?: string; // class on <html>
  light?: boolean;    // sets data-theme="light"
};

export const MODES: Mode[] = [
  { id: "dark", label: "dark" },
  { id: "light", label: "light", light: true },
  { id: "crt", label: "crt", className: "crt" },
  { id: "newspaper", label: "newspaper", className: "newspaper" },
  { id: "blueprint", label: "blueprint", className: "blueprint" },
  { id: "neon", label: "neon", className: "neon" },
];

const STORAGE_KEY = "visual-mode";

function applyMode(mode: Mode) {
  const html = document.documentElement;
  // clear any existing mode classes
  MODES.forEach((m) => m.className && html.classList.remove(m.className));
  if (mode.light) html.setAttribute("data-theme", "light");
  else html.removeAttribute("data-theme");
  if (mode.className) html.classList.add(mode.className);
  try {
    localStorage.setItem(STORAGE_KEY, mode.id);
  } catch {}
  window.dispatchEvent(
    new CustomEvent("portfolio-syscall", { detail: `$ theme --set ${mode.label}` })
  );
}

export function currentMode(): Mode {
  if (typeof document === "undefined") return MODES[0];
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    const found = MODES.find((m) => m.id === id);
    if (found) return found;
  } catch {}
  // Fall back to whatever the DOM already reflects (set by the inline init script)
  const html = document.documentElement;
  if (html.getAttribute("data-theme") === "light") return MODES[1];
  for (const m of MODES) {
    if (m.className && html.classList.contains(m.className)) return m;
  }
  return MODES[0];
}

export function cycleMode() {
  const cur = currentMode();
  const i = MODES.indexOf(cur);
  const next = MODES[(i + 1) % MODES.length];
  applyMode(next);
  return next;
}

export function restoreMode() {
  applyMode(currentMode());
}
