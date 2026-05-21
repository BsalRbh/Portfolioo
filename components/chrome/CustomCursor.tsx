"use client";
import { useEffect, useRef } from "react";

const HOT_SELECTOR = "a,button,.proj,.write-card,.cmdk-item,.pill,.process-card,.station,.theme-toggle,.row";

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mx = 0,
      my = 0,
      tx = 0,
      ty = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const tick = () => {
      tx += (mx - tx) * 0.35;
      ty += (my - ty) * 0.35;
      const wrap = wrapRef.current;
      if (wrap) wrap.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
      const label = labelRef.current;
      if (label) {
        label.textContent = `${String(Math.round(mx)).padStart(4, "0")}, ${String(Math.round(my)).padStart(4, "0")}`;
      }
      raf = requestAnimationFrame(tick);
    };
    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest(HOT_SELECTOR);
      const wrap = wrapRef.current;
      if (wrap) wrap.classList.toggle("hot", !!target);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div id="cursor" ref={wrapRef} aria-hidden>
      <div className="ring" ref={ringRef}>
        <div className="h" />
        <div className="v" />
      </div>
      <div className="label" ref={labelRef}>
        0000, 0000
      </div>
    </div>
  );
}
