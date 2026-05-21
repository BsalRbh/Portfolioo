"use client";
import { useEffect, useState } from "react";

export function KeysFooter() {
  const [pct, setPct] = useState("000%");

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      setPct(String(p).padStart(3, "0") + "%");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="keys">
      <div>
        <kbd>⌘K</kbd>command &nbsp;
        <kbd>?</kbd>help &nbsp;
        <kbd>J</kbd>/<kbd>K</kbd> navigate &nbsp;
        <kbd>G</kbd>+letter jump
      </div>
      <div style={{ fontVariantNumeric: "tabular-nums" }}>{pct}</div>
    </div>
  );
}
