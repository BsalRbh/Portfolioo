"use client";
import { useEffect, useRef, useState } from "react";
import { PROJECTS } from "@/lib/projects";
import { SectionIdx } from "@/components/chrome/SectionIdx";

type Pos = Record<string, { x: number; y: number }>;

const defaultPos = (): Pos =>
  Object.fromEntries(PROJECTS.map((p) => [p.num, { x: p.x, y: p.y }]));

export function WorkCanvas() {
  const [pos, setPos] = useState<Pos>(defaultPos);
  const [dragging, setDragging] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("proj-pos") || "null");
      if (saved && typeof saved === "object") setPos(saved);
    } catch {}
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem("proj-pos", JSON.stringify(pos));
    } catch {}
  }, [pos]);

  useEffect(() => {
    const h = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce.detail === "reset-canvas") setPos(defaultPos());
    };
    window.addEventListener("portfolio-action", h as EventListener);
    return () => window.removeEventListener("portfolio-action", h as EventListener);
  }, []);

  const startDrag = (e: React.MouseEvent, num: string) => {
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY };
    const orig = pos[num];
    setDragging(num);
    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      setPos((p) => ({ ...p, [num]: { x: orig.x + dx, y: orig.y + dy } }));
    };
    const up = () => {
      setDragging(null);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <section id="work" className="section projects">
      <div className="section-label">
        <SectionIdx value="02 / 08" />
        <span>Selected work — drag to rearrange</span>
      </div>
      <div className="canvas-frame">
        <div className="axis-x" />
        <div className="axis-y" />
        <div className="canvas-hint">
          [ <span className="accent">canvas</span> · {PROJECTS.length} entries · drag to rearrange · ⌘K to reset ]
        </div>
        {PROJECTS.map((p) => {
          const { x, y } = pos[p.num] || { x: p.x, y: p.y };
          const isDragging = dragging === p.num;
          return (
            <div
              key={p.num}
              className={"proj" + (isDragging ? " dragging" : "")}
              style={{ left: x, top: y }}
              data-whisper={p.whisper}
              onMouseDown={(e) => startDrag(e, p.num)}
            >
              <div className="pin" />
              <div className="num">
                {p.num} / {p.year}
              </div>
              <div className="title">{p.title}</div>
              <div style={{ color: "var(--paper-dim)", fontSize: 11, marginBottom: 10, lineHeight: 1.45 }}>
                {p.desc}
              </div>
              <div className="meta">
                <span>{p.tag}</span>
              </div>
              <div className="coord">
                [{String(Math.round(x)).padStart(4, "0")}, {String(Math.round(y)).padStart(4, "0")}]
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
