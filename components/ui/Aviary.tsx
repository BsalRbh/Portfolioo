"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Bird = {
  id: number;
  x: number;
  y: number;
  vx: number;
  glyph: string;
  dead?: number;
};

type Projectile = {
  id: number;
  x: number;
  y: number;
  bornAt: number;
};

const GLYPHS_R = [">v<", ">^<", "~>~", "=<", "-<<"];
const GLYPHS_L = ["<v>", "<^>", "~<~", ">=", ">>-"];
const BIRD_HITBOX = 36;
const STARTING_AMMO = 10;

type Props = { open: boolean };

// Difficulty curves
function spawnIntervalForScore(s: number): number {
  // 1300ms at score 0 → 350ms at score 30+
  return Math.max(350, 1300 - s * 32);
}
function birdSpeedRangeForScore(s: number): [number, number] {
  // base 80–220 at score 0; +6/score up to ~score 40
  const cap = Math.min(40, s);
  return [80 + cap * 4, 220 + cap * 10];
}

export function Aviary({ open }: Props) {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [ammo, setAmmo] = useState(STARTING_AMMO);
  const [over, setOver] = useState(false);
  const [, setRenderTick] = useState(0);

  const birdsRef = useRef<Bird[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const projectileLayerRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef(1);
  const lastSpawn = useRef(0);
  const lastFrame = useRef(0);

  // Mirror state into refs so the rAF loop reads fresh values without re-subscribing
  const scoreRef = useRef(score);
  const ammoRef = useRef(ammo);
  const overRef = useRef(over);
  scoreRef.current = score;
  ammoRef.current = ammo;
  overRef.current = over;

  const resetGame = useCallback(() => {
    setScore(0);
    setAmmo(STARTING_AMMO);
    setOver(false);
    birdsRef.current = [];
    projectilesRef.current = [];
    lastSpawn.current = performance.now();
    lastFrame.current = performance.now();
  }, []);

  useEffect(() => {
    try {
      const b = parseInt(localStorage.getItem("aviary-best") || "0", 10);
      if (!Number.isNaN(b)) setBest(b);
    } catch {}
  }, []);

  useEffect(() => {
    if (open) resetGame();
  }, [open, resetGame]);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      try {
        localStorage.setItem("aviary-best", String(score));
      } catch {}
    }
  }, [score, best]);

  // Click: spend a shot, hit-test, end game when ammo runs out (after the shot is resolved)
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (overRef.current) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest(".aviary-score, .aviary-over, .pill, .theme-toggle, .cmdk, .help-card, .post-reader"))
        return;
      if (ammoRef.current <= 0) return;

      const cx = e.clientX;
      const cy = e.clientY;

      // Hit test
      let killed = 0;
      for (const b of birdsRef.current) {
        if (b.dead) continue;
        const dx = b.x - cx;
        const dy = b.y - cy;
        if (dx * dx + dy * dy < BIRD_HITBOX * BIRD_HITBOX) {
          b.dead = performance.now();
          killed++;
        }
      }

      // Visual flash
      projectilesRef.current.push({
        id: nextId.current++,
        x: cx,
        y: cy,
        bornAt: performance.now(),
      });

      // Spend ammo + score
      const newAmmo = ammoRef.current - 1;
      setAmmo(newAmmo);
      if (killed > 0) setScore((s) => s + killed);
      if (newAmmo <= 0) setOver(true);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [open]);

  // Restart on R during game-over
  useEffect(() => {
    if (!open || !over) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        resetGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, over, resetGame]);

  // Game loop
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    lastFrame.current = performance.now();
    lastSpawn.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(64, now - lastFrame.current) / 1000;
      lastFrame.current = now;

      // Spawn only while game is live
      if (!overRef.current) {
        const interval = spawnIntervalForScore(scoreRef.current);
        if (now - lastSpawn.current > interval) {
          lastSpawn.current = now;
          const fromLeft = Math.random() < 0.5;
          const [lo, hi] = birdSpeedRangeForScore(scoreRef.current);
          const speed = lo + Math.random() * (hi - lo);
          const y = 80 + Math.random() * (window.innerHeight - 220);
          const glyph = fromLeft
            ? GLYPHS_R[Math.floor(Math.random() * GLYPHS_R.length)]
            : GLYPHS_L[Math.floor(Math.random() * GLYPHS_L.length)];
          birdsRef.current.push({
            id: nextId.current++,
            x: fromLeft ? -60 : window.innerWidth + 60,
            y,
            vx: fromLeft ? speed : -speed,
            glyph,
          });
        }
      }

      // Move + cull birds
      const liveBirds: Bird[] = [];
      for (const b of birdsRef.current) {
        if (b.dead && now - b.dead > 500) continue;
        b.x += b.vx * dt;
        if (b.vx > 0 && b.x > window.innerWidth + 80) continue;
        if (b.vx < 0 && b.x < -80) continue;
        liveBirds.push(b);
      }
      birdsRef.current = liveBirds;

      // Move + cull projectile flashes
      const liveShots: Projectile[] = [];
      for (const p of projectilesRef.current) {
        if (now - p.bornAt > 220) continue;
        liveShots.push(p);
      }
      projectilesRef.current = liveShots;

      // Render birds via React (transforms only — cheap)
      setRenderTick((t) => (t + 1) % 1000000);

      // Render projectile flashes imperatively
      const layer = projectileLayerRef.current;
      if (layer) {
        layer.innerHTML = "";
        for (const p of liveShots) {
          const dot = document.createElement("div");
          dot.className = "aviary-shot";
          dot.style.left = `${p.x}px`;
          dot.style.top = `${p.y}px`;
          dot.style.opacity = String(1 - (now - p.bornAt) / 220);
          layer.appendChild(dot);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open) return null;

  const ammoBar = "█".repeat(ammo) + "░".repeat(STARTING_AMMO - ammo);

  return (
    <>
      <div className="aviary-score" aria-live="polite">
        <span className="lbl">AVIARY</span>
        <span>SCORE · {String(score).padStart(3, "0")}</span>
        <span className="dim">BEST · {String(best).padStart(3, "0")}</span>
        <span className="ammo">
          AMMO · <span className="ammo-bar">{ammoBar}</span> {ammo}/{STARTING_AMMO}
        </span>
        <span className="hint">[ B / ESC to close ]</span>
      </div>
      <div className="aviary-layer" aria-hidden>
        {birdsRef.current.map((b) => (
          <span
            key={b.id}
            className={"aviary-bird" + (b.dead ? " dead" : "")}
            style={{ transform: `translate(${b.x}px, ${b.y}px)` }}
          >
            {b.dead ? "  ×" : b.glyph}
          </span>
        ))}
      </div>
      <div className="aviary-shots" ref={projectileLayerRef} aria-hidden />

      {over && (
        <div className="aviary-over" role="dialog" aria-label="Game over">
          <div className="aviary-over-card">
            <div className="aviary-over-title">— GAME OVER</div>
            <div className="aviary-over-stats">
              <div className="row">
                <span className="k">final score</span>
                <span className="v accent">{String(score).padStart(3, "0")}</span>
              </div>
              <div className="row">
                <span className="k">best</span>
                <span className="v">{String(best).padStart(3, "0")}</span>
              </div>
              <div className="row">
                <span className="k">accuracy</span>
                <span className="v">{Math.round((score / STARTING_AMMO) * 100)}%</span>
              </div>
            </div>
            <div className="aviary-over-actions">
              <button type="button" className="pill" onClick={resetGame}>
                R · RESTART
              </button>
              <span className="hint">ESC to exit</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
