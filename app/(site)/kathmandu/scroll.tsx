"use client";
// Scroll-driven motion for the Kathmandu edition.
//
// <ScrollFx/> — marks the page "fx-ready" (so hidden start states only apply
// when JS runs), reveals every [data-reveal] element once as it scrolls into
// view (adds .is-in), and feeds the hero parallax via the --sy variable.
// <FloorIndicator/> — the carved floor plate showing which storey you're on.
import { useEffect, useState } from "react";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ScrollFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".v-kathmandu");
    if (!root || reducedMotion()) return;
    root.classList.add("fx-ready");

    // reveal on scroll, once
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    // Once a reveal that competes with a hover animation finishes, mark it done
    // so hovering doesn't replay the entrance.
    const SETTLE = new Set(["k-sign-hang", "k-lamp-on"]);
    const onEnd = (e: AnimationEvent) => {
      if (!SETTLE.has(e.animationName)) return;
      (e.target as Element).closest("[data-reveal]")?.classList.add("is-done");
    };
    root.addEventListener("animationend", onEnd);

    // hero parallax: only while the hero is on screen
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        if (y < window.innerHeight * 1.3) root.style.setProperty("--sy", `${y}px`);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      root.removeEventListener("animationend", onEnd);
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

// Going down the house is going downstairs: top floor first, ground floor last.
const FLOORS = [
  { id: "services", n: "५", en: "What I do" },
  { id: "work", n: "४", en: "Work" },
  { id: "story", n: "३", en: "Story" },
  { id: "experience", n: "२", en: "Experience" },
  { id: "writing", n: "१", en: "Writing" },
  { id: "contact", n: "भुइँ", en: "Ground floor" },
];

export function FloorIndicator() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = FLOORS.map((f) => document.getElementById(f.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    // back up in the sky → hide the plate
    const sky = document.querySelector(".k-sky");
    const skyIo = new IntersectionObserver(([e]) => e.isIntersecting && e.intersectionRatio > 0.5 && setActive(null), {
      threshold: [0.5],
    });
    if (sky) skyIo.observe(sky);
    return () => {
      io.disconnect();
      skyIo.disconnect();
    };
  }, []);

  const floor = FLOORS.find((f) => f.id === active);

  return (
    <div className={`k-floorplate${floor ? " is-visible" : ""}`} aria-hidden>
      {floor && (
        <span key={floor.id} className="k-floorplate__inner">
          <span className="k-floorplate__n">{floor.n}</span>
          <span className="k-floorplate__label">तला</span>
          <span className="k-floorplate__en">{floor.en}</span>
        </span>
      )}
    </div>
  );
}
