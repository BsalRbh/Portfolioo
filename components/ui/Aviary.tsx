"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BirdSVG, BIRD_KINDS as KINDS, type BirdKind } from "@/lib/birds";
import { LeaderboardList, type LeaderEntry } from "./LeaderboardList";

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
const MAX_MISSES = 4;
const LEADERBOARD_SIZE = 50;
const NAME_KEY = "aviary-name";

type Props = {
  open: boolean;
  onOpenLeaderboard?: () => void;
};

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

export function Aviary({ open, onOpenLeaderboard }: Props) {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [misses, setMisses] = useState(0);
  const [over, setOver] = useState(false);
  const [missFlash, setMissFlash] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [, setRenderTick] = useState(0);

  const [board, setBoard] = useState<LeaderEntry[] | null>(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
  const countdownRef = useRef(countdown);
  scoreRef.current = score;
  missesRef.current = misses;
  overRef.current = over;
  countdownRef.current = countdown;

  const resetGame = useCallback(() => {
    setScore(0);
    setMisses(0);
    setOver(false);
    setBoard(null);
    setBoardError(null);
    setSubmittedId(null);
    setCountdown(3);
    birdsRef.current = [];
    projectilesRef.current = [];
    lastSpawn.current = performance.now();
    lastFrame.current = performance.now();
  }, []);

  useEffect(() => {
    try {
      const b = parseInt(localStorage.getItem("aviary-best") || "0", 10);
      if (!Number.isNaN(b)) setBest(b);
      const savedName = localStorage.getItem(NAME_KEY);
      if (savedName) setNameInput(savedName);
    } catch {}
  }, []);

  useEffect(() => {
    if (open) resetGame();
  }, [open, resetGame]);

  // Countdown tick: 3 → 2 → 1 → 0 (GO!) → null (live)
  useEffect(() => {
    if (!open || countdown === null) return;
    const ms = countdown === 0 ? 500 : 800;
    const id = window.setTimeout(() => {
      setCountdown((c) => (c === null ? null : c === 0 ? null : c - 1));
      if (countdown === null || countdown > 0) return;
    }, ms);
    return () => window.clearTimeout(id);
  }, [open, countdown]);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      try {
        localStorage.setItem("aviary-best", String(score));
      } catch {}
    }
  }, [score, best]);

  useEffect(() => {
    if (!over) return;
    let cancelled = false;
    setBoardLoading(true);
    setBoardError(null);
    fetch("/api/leaderboard", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: { entries: LeaderEntry[] }) => {
        if (cancelled) return;
        setBoard(data.entries ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setBoardError("offline");
      })
      .finally(() => {
        if (!cancelled) setBoardLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [over]);

  const accuracy =
    score + misses > 0 ? Math.round((score / (score + misses)) * 100) : 0;

  const qualifies =
    score > 0 &&
    (board === null
      ? false
      : board.length < LEADERBOARD_SIZE ||
        score > (board[board.length - 1]?.score ?? 0));

  const submitScore = useCallback(async () => {
    const name = nameInput.trim();
    if (!/^[A-Za-z0-9 _.\-ऀ-ॿ]{3,12}$/.test(name)) {
      setBoardError("bad_name");
      return;
    }
    setSubmitting(true);
    setBoardError(null);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score, accuracy }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setBoardError(data.error ?? "submit_failed");
        return;
      }
      const data = (await res.json()) as {
        entry: LeaderEntry;
        entries: LeaderEntry[];
      };
      setBoard(data.entries);
      setSubmittedId(data.entry.id);
      try {
        localStorage.setItem(NAME_KEY, name);
      } catch {}
    } catch {
      setBoardError("offline");
    } finally {
      setSubmitting(false);
    }
  }, [nameInput, score, accuracy]);

  // Click: hit-test, count misses, end game when misses reach the cap
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (overRef.current) return;
      if (countdownRef.current !== null) return;
      const t = e.target as HTMLElement | null;
      if (
        t?.closest(
          ".aviary-score, .aviary-over, .pill, .theme-toggle, .cmdk, .help-card, .post-reader, .leaderboard-shroud, .leaderboard-card, .aviary-link",
        )
      )
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
        setMissFlash((n) => n + 1);
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

  // L during gameplay opens the standalone leaderboard
  useEffect(() => {
    if (!open || !onOpenLeaderboard) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        onOpenLeaderboard();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenLeaderboard]);

  // Game loop
  useEffect(() => {
    if (!open) return;
    let raf = 0;
    lastFrame.current = performance.now();
    lastSpawn.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(64, now - lastFrame.current) / 1000;
      lastFrame.current = now;

      // Spawn only while game is live (and countdown finished)
      if (!overRef.current && countdownRef.current === null) {
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
          LIVES · <span className="ammo-bar">{missBar}</span> {missesLeft}/
          {MAX_MISSES}
        </span>
        {onOpenLeaderboard && (
          <button
            type="button"
            className="aviary-link"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLeaderboard();
            }}
          >
            L · BOARD
          </button>
        )}
        <span className="hint">[ B / ESC to close ]</span>
      </div>
      <div
        key={missFlash}
        className={missFlash > 0 ? "aviary-miss-fx" : "aviary-miss-fx hidden"}
        aria-hidden
      />
      <div className="aviary-layer" aria-hidden>
        {birdsRef.current.map((b) => {
          const facingLeft = b.vx < 0;
          return (
            <span
              key={b.id}
              className={
                `aviary-bird aviary-bird-${b.kind}` + (b.dead ? " dead" : "")
              }
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

      {countdown !== null && (
        <div className="aviary-countdown" aria-live="assertive">
          <div className="aviary-countdown-card">
            <div className="lbl">— AVIARY</div>
            <div
              key={countdown}
              className={
                "aviary-countdown-num" + (countdown === 0 ? " go" : "")
              }
            >
              {countdown === 0 ? "GO!" : countdown}
            </div>
            <div className="hint">
              click birds · {MAX_MISSES} lives · B / ESC to exit
            </div>
          </div>
        </div>
      )}

      {over && (
        <div className="aviary-over" role="dialog" aria-label="Game over">
          <div className="aviary-over-card">
            <div className="aviary-over-title">— GAME OVER</div>
            <div className="aviary-over-stats">
              <div className="row">
                <span className="k">final score</span>
                <span className="v accent">
                  {String(score).padStart(3, "0")}
                </span>
              </div>
              <div className="row">
                <span className="k">best</span>
                <span className="v">{String(best).padStart(3, "0")}</span>
              </div>
              <div className="row">
                <span className="k">accuracy</span>
                <span className="v">{accuracy}%</span>
              </div>
            </div>

            <div className="aviary-board">
              <div className="aviary-board-head">
                <span className="lbl">TOP {LEADERBOARD_SIZE}</span>
                {boardLoading && <span className="hint">loading…</span>}
                {boardError === "offline" && (
                  <span className="hint err">offline · score not recorded</span>
                )}
              </div>

              {qualifies && submittedId === null && (
                <form
                  className="aviary-board-submit"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!submitting) submitScore();
                  }}
                >
                  <span className="hint">
                    you made the board · enter a name
                  </span>
                  <div className="aviary-board-submit-row">
                    <input
                      type="text"
                      className="aviary-name-input"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={12}
                      minLength={3}
                      pattern="[A-Za-z0-9 _.\-ऀ-ॿ]{3,12}"
                      placeholder="3–12 chars"
                      autoFocus
                      disabled={submitting}
                    />
                    <button
                      type="submit"
                      className="pill"
                      disabled={submitting || nameInput.trim().length < 3}
                    >
                      {submitting ? "…" : "SUBMIT"}
                    </button>
                  </div>
                  {boardError && boardError !== "offline" && (
                    <span className="hint err">
                      {boardError === "bad_name"
                        ? "name must be 3–12 chars: letters (roman / देवनागरी), digits, space, _ . -"
                        : boardError === "rate_limited"
                          ? "slow down — try again in a minute"
                          : "couldn’t submit — try again"}
                    </span>
                  )}
                </form>
              )}

              <LeaderboardList
                entries={board}
                loading={boardLoading}
                highlightId={submittedId}
              />
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
