"use client";
import { useEffect } from "react";

export function BootOverlay() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.documentElement.hasAttribute("data-boot-skip")) return;
    try {
      sessionStorage.setItem("boot-played", "1");
    } catch {}
  }, []);

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
