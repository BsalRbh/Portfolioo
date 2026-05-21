"use client";
import { useEffect, useState } from "react";

type Props = {
  onCommand: () => void;
  onHelp: () => void;
  onAviary: () => void;
  onTheme: () => void;
  onScreensaver: () => void;
};

export function MobileFab({ onCommand, onHelp, onAviary, onTheme, onScreensaver }: Props) {
  const [open, setOpen] = useState(false);

  // Close when the user taps anywhere outside the FAB
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest(".mobile-fab")) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const wrap = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div className={"mobile-fab" + (open ? " open" : "")} aria-label="Quick actions">
      <button
        type="button"
        className="mobile-fab-action"
        onClick={wrap(onCommand)}
        aria-label="Command palette"
      >
        ⌘
        <span className="lbl">CMD</span>
      </button>
      <button
        type="button"
        className="mobile-fab-action"
        onClick={wrap(onAviary)}
        aria-label="Play shooting game"
      >
        ◎
        <span className="lbl">GAME</span>
      </button>
      <button
        type="button"
        className="mobile-fab-action"
        onClick={wrap(onTheme)}
        aria-label="Toggle theme"
      >
        ☼
        <span className="lbl">THEME</span>
      </button>
      <button
        type="button"
        className="mobile-fab-action"
        onClick={wrap(onScreensaver)}
        aria-label="Start screensaver"
      >
        ❍
        <span className="lbl">IDLE</span>
      </button>
      <button
        type="button"
        className="mobile-fab-action"
        onClick={wrap(onHelp)}
        aria-label="Keyboard shortcuts"
      >
        ?
        <span className="lbl">KEYS</span>
      </button>
      <button
        type="button"
        className="mobile-fab-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close quick actions" : "Open quick actions"}
      >
        {open ? "×" : "+"}
      </button>
    </div>
  );
}
