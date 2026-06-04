"use client";
import { useRef } from "react";
import { SectionIdx } from "@/components/chrome/SectionIdx";

const STEPS = [
  {
    n: "01",
    title: "Write the problem down first.",
    body:
      "I start every feature as a short note in plain English — what's broken, what should happen, what's unclear. Half the time it surfaces a question I haven't answered yet.",
    glyph: "  •\n /│\\\n• │ •\n  │\n  •",
  },
  {
    n: "02",
    title: "Get the thinnest version working.",
    body:
      "I'd rather have an ugly end-to-end path on day one than a polished half. The rough version tells me which pieces I actually understand.",
    glyph: " ┌─┐\n │░│\n └┬┘\n  │\n  ▼",
  },
  {
    n: "03",
    title: "Watch what it actually does.",
    body: "Before I tune anything, I add logs and click through it like a user. Most of my early bugs came from optimizing the wrong thing.",
    glyph: "▁▂▃▅▇█\n▔▔▔▔▔▔\n  ◢▆◣\n ◢███◣",
  },
  {
    n: "04",
    title: "Leave a trail.",
    body: "Commit messages, a short note in the PR, sometimes a comment on the weird line. Mostly so the next-week version of me doesn't have to relearn it.",
    glyph: "┌────┐\n│ ✎  │\n└────┘\n  ──→",
  },
  {
    n: "05",
    title: "Cut what I don't use.",
    body: "At the end of a feature I look for code I added 'just in case' and delete it. Less surface area, fewer places to be wrong.",
    glyph: " ███\n  █\n  •\n     ",
  },
];

export function Process() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ startX: number; startScroll: number; moved: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    const rail = railRef.current;
    if (!rail) return;
    drag.current = { startX: e.clientX, startScroll: rail.scrollLeft, moved: 0 };
    rail.classList.add("dragging");

    const onMove = (ev: MouseEvent) => {
      if (!drag.current || !rail) return;
      const dx = ev.clientX - drag.current.startX;
      drag.current.moved = Math.abs(dx);
      rail.scrollLeft = drag.current.startScroll - dx;
    };
    const onUp = () => {
      rail.classList.remove("dragging");
      drag.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <section id="process" className="section">
      <div className="section-label">
        <SectionIdx value="04 / 09" />
        <span>Process — five steps, repeated forever →</span>
      </div>
      <div className="process-rail" ref={railRef} onMouseDown={onMouseDown}>
        {STEPS.map((s) => (
          <div className="process-card" key={s.n}>
            <div className="step">— STEP {s.n}</div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <pre className="glyph">{s.glyph}</pre>
          </div>
        ))}
      </div>
    </section>
  );
}
