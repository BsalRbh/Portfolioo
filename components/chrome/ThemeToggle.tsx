"use client";
import { useTheme } from "@/lib/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const onClick = () => {
    toggle();
    window.dispatchEvent(
      new CustomEvent("portfolio-syscall", { detail: "$ chmod +x ./theme.sh" })
    );
  };
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onClick}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Theme: ${theme}`}
    >
      {theme === "dark" ? "☾" : "☀"}
    </button>
  );
}
