"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { COMMANDS } from "@/lib/nav";

type Props = {
  open: boolean;
  seed?: string;
  onClose: () => void;
  toggleTheme: () => void;
  toggleAviary: () => void;
  toggleLeaderboard: () => void;
  startScreensaver: () => void;
};

export function CommandPalette({ open, seed, onClose, toggleTheme, toggleAviary, toggleLeaderboard, startScreensaver }: Props) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQ(seed ?? "");
      setI(0);
      const t = setTimeout(() => {
        inputRef.current?.focus();
        // place caret at end so subsequent typing appends
        const el = inputRef.current;
        if (el && seed) {
          el.setSelectionRange(seed.length, seed.length);
        }
      }, 30);
      return () => clearTimeout(t);
    }
  }, [open, seed]);

  const filtered = useMemo(
    () => COMMANDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  if (!open) return null;

  const run = (cmd: (typeof COMMANDS)[number] | undefined) => {
    if (!cmd) return;
    if (cmd.id.startsWith("goto:")) {
      const id = cmd.id.split(":")[1];
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (cmd.id === "act:email") {
      window.location.href = "mailto:bsl.rbh@gmail.com";
    } else if (cmd.id === "act:linkedin") {
      window.open("https://www.linkedin.com/in/bishalrajbahak", "_blank");
    } else if (cmd.id === "act:facebook") {
      window.open("https://www.facebook.com/bsal.rbh/", "_blank");
    } else if (cmd.id === "act:instagram") {
      window.open("https://www.instagram.com/bsal.rbh/", "_blank");
    } else if (cmd.id === "act:reset") {
      window.dispatchEvent(new CustomEvent("portfolio-action", { detail: "reset-canvas" }));
    } else if (cmd.id === "act:theme") {
      toggleTheme();
    } else if (cmd.id === "act:aviary") {
      toggleAviary();
    } else if (cmd.id === "act:leaderboard") {
      toggleLeaderboard();
    } else if (cmd.id === "act:screensaver") {
      startScreensaver();
    }
    onClose();
  };

  return (
    <div className="cmdk-shroud" onClick={onClose}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-input">
          <span>›</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setI(0);
            }}
            placeholder="Type a command or 'go to about' …"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setI((x) => Math.min(filtered.length - 1, x + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setI((x) => Math.max(0, x - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                run(filtered[i]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
          />
        </div>
        <div className="cmdk-list">
          {filtered.map((c, idx) => (
            <div
              key={c.id}
              className={"cmdk-item" + (idx === i ? " active" : "")}
              onMouseEnter={() => setI(idx)}
              onClick={() => run(c)}
            >
              <span className="lbl">{c.label}</span>
              <span className="hint">{c.hint}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="cmdk-item">
              <span className="lbl" style={{ color: "var(--paper-dim)" }}>
                no results.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
