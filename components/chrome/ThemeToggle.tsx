"use client";
import { cycleMode } from "@/lib/visualMode";

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => cycleMode()}
      aria-label="Cycle visual theme"
      title="Cycle theme (T)"
    >
      ☾
    </button>
  );
}
