"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BirdSVG, BIRD_KINDS as KINDS, type BirdKind } from "@/lib/birds";

type Bird = {
  id: number;
  x: number;
  y: number;
  vx: number;
  kind: BirdKind;
  dead?: number;
};

type Projectile = {
  id: number;
  x: number;
  y: number;
  bornAt: number;
};

const BIRD_HITBOX = 36;
const MAX_MISSES = 10;

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
  const [misses, setMisses] = useState(0);
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
  const missesRef = useRef(misses);
  const overRef = useRef(over);
  scoreRef.current = score;
  missesRef.current = misses;
  overRef.current = over;

  const resetGame = useCallback(() => {
    setScore(0);
    setMisses(0);
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

  // Click: hit-test, count misses, end game when misses reach the cap
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (overRef.current) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest(".aviary-score, .aviary-over, .pill, .theme-toggle, .cmdk, .help-card, .post-reader"))
        return;

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

      if (killed > 0) {
        setScore((s) => s + killed);
      } else {
        const newMisses = missesRef.current + 1;
        setMisses(newMisses);
        if (newMisses >= MAX_MISSES) setOver(true);
      }
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
          const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
          // Hawks fly faster, ducks slower — gives each species a feel.
          const speedMul = kind === "hawk" ? 1.35 : kind === "duck" ? 0.7 : 1;
          const speed = (lo + Math.random() * (hi - lo)) * speedMul;
          const y = 80 + Math.random() * (window.innerHeight - 220);
          birdsRef.current.push({
            id: nextId.current++,
            x: fromLeft ? -60 : window.innerWidth + 60,
            y,
            vx: fromLeft ? speed : -speed,
            kind,
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

  const missesLeft = Math.max(0, MAX_MISSES - misses);
  const missBar = "█".repeat(missesLeft) + "░".repeat(MAX_MISSES - missesLeft);

  return (
    <>
      <div className="aviary-score" aria-live="polite">
        <span className="lbl">AVIARY</span>
        <span>SCORE · {String(score).padStart(3, "0")}</span>
        <span className="dim">BEST · {String(best).padStart(3, "0")}</span>
        <span className="ammo">
          LIVES · <span className="ammo-bar">{missBar}</span> {missesLeft}/{MAX_MISSES}
        </span>
        <span className="hint">[ B / ESC to close ]</span>
      </div>
      <div className="aviary-layer" aria-hidden>
        {birdsRef.current.map((b) => {
          const facingLeft = b.vx < 0;
          return (
            <span
              key={b.id}
              className={`aviary-bird aviary-bird-${b.kind}` + (b.dead ? " dead" : "")}
              style={{ transform: `translate(${b.x}px, ${b.y}px)` }}
            >
              {b.dead ? (
                <span className="aviary-x">×</span>
              ) : (
                <span
                  className="aviary-bird-svg"
                  style={facingLeft ? { transform: "scaleX(-1)" } : undefined}
                >
                  <BirdSVG kind={b.kind} />
                </span>
              )}
            </span>
          );
        })}
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
                <span className="v">
                  {score + misses > 0 ? Math.round((score / (score + misses)) * 100) : 0}%
                </span>
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
