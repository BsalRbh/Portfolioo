"use client";
import { useRef } from "react";

const STEPS = [
  {
    n: "01",
    title: "Listen, then sketch.",
    body:
      "Every project starts as a one-page memo. If I can't write it in plain English, the architecture isn't ready yet.",
    glyph: "  •\n /│\\\n• │ •\n  │\n  •",
  },
  {
    n: "02",
    title: "Build the smallest thing.",
    body:
      "I keep a 'walking skeleton' on day one — end-to-end, ugly, working. Everything after is replacing parts of it.",
    glyph: " ┌─┐\n │░│\n └┬┘\n  │\n  ▼",
  },
  {
    n: "03",
    title: "Watch it under load.",
    body: "Production tells you what staging never will. I instrument before I optimize, every time.",
    glyph: "▁▂▃▅▇█\n▔▔▔▔▔▔\n  ◢▆◣\n ◢███◣",
  },
  {
    n: "04",
    title: "Write it down.",
    body: "Every change ships with a note in the repo. Future me, or the next engineer, doesn't have to guess.",
    glyph: "┌────┐\n│ ✎  │\n└────┘\n  ──→",
  },
  {
    n: "05",
    title: "Hand it back, smaller.",
    body: "The best engagement ends with less surface area than it started with. Boring is the goal.",
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
        <span className="idx">04 / 08</span>
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
