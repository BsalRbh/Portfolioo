"use client";
import { useEffect, useState } from "react";

const BOOT_KEY = "boot-played";

export function BootOverlay() {
  const [gone, setGone] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(BOOT_KEY)) return;
    } catch {}
    setGone(false);
    const t = setTimeout(() => {
      setGone(true);
      try {
        sessionStorage.setItem(BOOT_KEY, "1");
      } catch {}
    }, 3400);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <div className="boot" aria-hidden>
      <div className="line">[<span className="ok">  OK  </span>] mounting filesystem ............................... /</div>
      <div className="line">[<span className="ok">  OK  </span>] loading kernel modules ............... portfolio.ko</div>
      <div className="line">[<span className="ok">  OK  </span>] initializing graphics ........................ 60fps</div>
      <div className="line">[<span className="ok">  OK  </span>] checking pointer device ....................... ok</div>
      <div className="line">[<span className="ok">  OK  </span>] hydrating projects ................... 05 entries</div>
      <div className="line">[<span className="ok">  OK  </span>] starting input.daemon ................... ⌘K, ?</div>
      <div className="line">[<span className="ok">  OK  </span>] welcome, visitor — press ? for keys</div>
      <div className="center">bishal rajbahak.</div>
    </div>
  );
}
