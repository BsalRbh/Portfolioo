"use client";
import { useEffect, useRef } from "react";

const CHARSET = "01-=+*<>{}[]/\\|abcdefghijklmnopqrstuvwxyz".split("");

type Props = { active: boolean };

export function Screensaver({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };
    resize();

    const fontSize = 14;
    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#c8ff00";
    const inkVar = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
    const ink = inkVar || "#0b0b0d";

    const cols = Math.ceil(window.innerWidth / fontSize);
    const drops: number[] = new Array(cols).fill(0).map(() => Math.random() * -50);

    let raf = 0;
    const draw = () => {
      // Fade prior frame
      ctx.fillStyle = `${ink}1a`; // ~10% alpha trail
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.font = `${fontSize}px var(--mono), monospace`;
      ctx.fillStyle = accent;
      for (let i = 0; i < cols; i++) {
        const ch = CHARSET[Math.floor(Math.random() * CHARSET.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(ch, x, y);
        if (y > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  if (!active) return null;
  return (
    <div className="screensaver" aria-hidden>
      <canvas ref={canvasRef} />
      <div className="screensaver-hint">
        <div className="line">[ SYSTEM IDLE — 20s ]</div>
        <div className="line dim">move mouse or press any key to wake.</div>
      </div>
    </div>
  );
}
