"use client";
import { useEffect, useState } from "react";

export function BootOverlay() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    const t = setTimeout(() => setGone(true), 3400);
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
