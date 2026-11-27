"use client";
// Interactive pieces of the Kathmandu edition. Everything here responds to
// the visitor (click, hover, scroll) — nothing loops on its own.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pigeon } from "./art";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────────────── Pigeons on the wires ───────────────── */

// Positions sit on the first wire's curve: x%, y in viewBox units, and t = the
// point's parameter along that quadratic (used to ride the wire as it bends).
const PIGEONS = [
  { x: 24.7, y: 47.5, t: 0.25, dx: -140, flip: false },
  { x: 44.9, y: 57.4, t: 0.45, dx: 60, flip: true },
  { x: 85.5, y: 40.8, t: 0.85, dx: 160, flip: false },
];

// The wire bundle, in the 1440×120 viewBox: start y, control (x, y), end y, width.
const WIRES: [number, number, number, number, number][] = [
  [18, 720, 96, 22, 2.2],
  [24, 700, 104, 30, 1.6],
  [30, 760, 88, 40, 2.6],
  [34, 680, 118, 26, 1.4],
  [42, 740, 100, 46, 1.8],
];
// how strongly each wire follows the pull, so they don't move as one rope
const GIVE = [1, 0.92, 1.08, 0.85, 0.97];
const PULL_TO_SCARE = 10; // viewBox units

/**
 * The overhead wires and their pigeons. Grab the wires and pull — they bend
 * toward the cursor, and once pulled far enough every pigeon takes off. Let go
 * and they twang back. Clicking one pigeon sends just that one off.
 */
export function Overhead() {
  const [flying, setFlying] = useState<boolean[]>(() => PIGEONS.map(() => false));
  const flyingRef = useRef(flying);
  flyingRef.current = flying;
  const [pull, setPull] = useState({ x: 720, dy: 0 });
  const [grabbing, setGrabbing] = useState(false);
  const drag = useRef<{ id: number; startY: number; scared: boolean } | null>(null);
  const raf = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const svgBox = useRef<HTMLDivElement | null>(null);
  // what scared pigeons leave behind on the ground below
  const [drops, setDrops] = useState<{ id: number; x: number; y: number; r: number }[]>([]);
  const dropId = useRef(0);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const fly = (indexes: number[]) => {
    if (!indexes.length) return;
    setFlying((f) => f.map((v, j) => (indexes.includes(j) ? true : v)));
    setDrops((d) =>
      [
        ...d,
        ...indexes.map((i) => ({
          id: dropId.current++,
          x: PIGEONS[i].x + (Math.random() - 0.5) * 0.8,
          y: PIGEONS[i].y,
          r: Math.round(Math.random() * 360),
        })),
      ].slice(-12),
    );
    for (const i of indexes) {
      clearTimeout(timers.current[i]);
      timers.current[i] = setTimeout(
        () => setFlying((f) => f.map((v, j) => (j === i ? false : v))),
        5200 + i * 250,
      );
    }
  };
  const scareAll = () => fly(PIGEONS.map((_, i) => i).filter((i) => !flyingRef.current[i]));

  const toViewBox = (clientX: number, clientY: number) => {
    const r = svgBox.current!.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * 1440, y: ((clientY - r.top) / r.height) * 120 };
  };

  /** Let go: the wires twang back with a damped wobble. */
  const release = (fromDy: number, x: number) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (prefersReducedMotion() || Math.abs(fromDy) < 0.5) return setPull({ x, dy: 0 });
    const start = performance.now();
    const step = (now: number) => {
      const t = (now - start) / 1000;
      const dy = fromDy * Math.exp(-3.6 * t) * Math.cos(15 * t);
      if (t < 1.6) {
        setPull({ x, dy });
        raf.current = requestAnimationFrame(step);
      } else setPull({ x, dy: 0 });
    };
    raf.current = requestAnimationFrame(step);
  };

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (raf.current) cancelAnimationFrame(raf.current);
    const p = toViewBox(e.clientX, e.clientY);
    drag.current = { id: e.pointerId, startY: p.y, scared: false };
    setGrabbing(true);
    setPull({ x: p.x, dy: 0 });
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const p = toViewBox(e.clientX, e.clientY);
    const dy = Math.max(-36, Math.min(54, p.y - d.startY));
    setPull({ x: Math.max(80, Math.min(1360, p.x)), dy });
    if (!d.scared && Math.abs(dy) > PULL_TO_SCARE) {
      d.scared = true;
      scareAll();
    }
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setGrabbing(false);
    release(pull.dy, pull.x);
  };


  return (
    // Decorative toy: mouse/touch only, kept out of the Tab order and screen readers.
    <div className="k-wires-wrap" aria-hidden>
      <div ref={svgBox} className="k-wires-anim">
        <svg className="k-wires" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden focusable="false">
          <g fill="none" stroke="#1b1210" strokeLinecap="round">
            {WIRES.map(([y0, cx, cy, y1, w], i) => (
              <path
                key={i}
                d={`M-10 ${y0} Q${cx + (pull.x - cx) * Math.min(1, Math.abs(pull.dy) / 20)} ${cy + 2 * pull.dy * GIVE[i]} 1450 ${y1}`}
                strokeWidth={w}
              />
            ))}
            <path d="M300 63 q8 18 -2 34 q-6 10 4 20" strokeWidth="1.4" />
          </g>
        </svg>
      </div>
      <button
        type="button"
        className={`k-wires-hit${grabbing ? " is-grabbing" : ""}`}
        tabIndex={-1}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
      <div className="k-drops" aria-hidden>
        {drops.map((d) => (
          <span
            key={d.id}
            className="k-drop"
            style={{ left: `${d.x}%`, "--from": `${(d.y / 120) * 100}%`, "--r": `${d.r}deg` } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="k-pigeons">
        {PIGEONS.map((p, i) => (
          <button
            key={i}
            type="button"
            className={`k-pigeon${p.flip ? " is-flipped" : ""}${flying[i] ? " is-flying" : ""}`}
            style={
              {
                left: `${p.x}%`,
                // ride the first wire: a control-point shift of 2·dy moves the curve by 2t(1−t)·2·dy
                top: `${((p.y + (flying[i] ? 0 : 4 * p.t * (1 - p.t) * pull.dy * GIVE[0])) / 120) * 100}%`,
                "--dx": `${p.dx}px`,
                "--delay": `${i * 80}ms`,
              } as React.CSSProperties
            }
            onClick={() => !flying[i] && fly([i])}
            tabIndex={-1}
          >
            <Pigeon />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────── Prayer wheels ───────────────── */

const WHEELS = 9;

export function PrayerWheels() {
  const offsets = useRef<number[]>(Array(WHEELS).fill(0));
  const [spins, setSpins] = useState(0);

  const spin = useCallback((el: HTMLElement, i: number, strength = 1) => {
    const from = offsets.current[i];
    const to = from - 240 * strength; // clockwise, as you walk past
    offsets.current[i] = to;
    setSpins((n) => n + 1);
    const drum = el.querySelector<HTMLElement>(".k-wheel__drum");
    if (!drum) return;
    if (prefersReducedMotion()) {
      drum.style.backgroundPositionX = `${to}px`;
      return;
    }
    drum
      .animate([{ backgroundPositionX: `${from}px` }, { backgroundPositionX: `${to}px` }], {
        duration: 1800 * strength,
        easing: "cubic-bezier(0.15, 0.7, 0.25, 1)",
        fill: "forwards",
      })
      .finished.then(() => {
        drum.style.backgroundPositionX = `${to}px`;
      })
      .catch(() => {});
  }, []);

  return (
    <div className="k-wheels">
      <p className="k-wheels__mantra" lang="ne" aria-hidden>
        ॐ मणि पद्मे हुँ
      </p>
      <div className="k-wheels__rack">
        {Array.from({ length: WHEELS }, (_, i) => (
          <button
            key={i}
            type="button"
            className="k-wheel"
            aria-label={`Spin prayer wheel ${i + 1}`}
            onClick={(e) => spin(e.currentTarget, i, 1.6)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") spin(e.currentTarget, i, 1);
            }}
          >
            <span className="k-wheel__cap" aria-hidden />
            <span className="k-wheel__drum" aria-hidden />
            <span className="k-wheel__cap k-wheel__cap--bottom" aria-hidden />
          </button>
        ))}
      </div>
      <p className="k-wheels__count" aria-live="polite">
        {spins === 0
          ? "Run your cursor along the wheels — clockwise, like everyone at Swayambhu."
          : `${spins} ${spins === 1 ? "turn" : "turns"} of the prayer wheels. Good karma logged.`}
      </p>
    </div>
  );
}

/* ───────────────── The front door ───────────────── */

/**
 * The door is open in the server HTML (so content is never hidden without JS).
 * On mount it closes, then swings open when scrolled into view — or on click.
 */
export function FrontDoor({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"static" | "closed" | "open">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.6) return; // already in view — leave it open
    setState("closed");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("open");
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`k-door is-${state}`}
      onClick={() => state === "closed" && setState("open")}
    >
      {children}
    </div>
  );
}

/* ───────────────── Kathmandu local time (text only) ───────────────── */

/** "5:42 pm" in Kathmandu, rendered client-side only (no hydration mismatch). */
export function KathmanduTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kathmandu" });
    const tick = () => setTime(fmt.format(new Date()).toLowerCase());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  if (!time) return null;
  return (
    <span className="k-plate__time">
      {" · "}
      <time aria-label={`${time} in Kathmandu`}>{time}</time>
    </span>
  );
}

/* ───────────────── Honking email button ───────────────── */

/** "Email me" that wobbles like a tempo horn and says "peep peep!" on hover. */
export function HonkLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [honks, setHonks] = useState(0);
  return (
    <a
      className={`k-btn k-honk${honks ? " is-honking" : ""}`}
      href={href}
      onPointerEnter={() => setHonks((n) => n + 1)}
      onFocus={() => setHonks((n) => n + 1)}
      onAnimationEnd={(e) => e.animationName === "k-bubble" && setHonks(0)}
    >
      {children}
      <span key={honks} className="k-honk__bubble" aria-hidden>
        peep peep!
      </span>
    </a>
  );
}

/* ───────────────── Kite in the sky (Dashain) ───────────────── */

/**
 * A changa on a string. Drag it anywhere in the sky; let go and the wind
 * carries it back to where it was flying.
 */
export function Kite() {
  const layer = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const offRef = useRef(off);
  offRef.current = off;
  const raf = useRef<number | null>(null);

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  useEffect(() => {
    const el = layer.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // home position (fraction of the sky)
  const home = { x: 0.53, y: 0.15 };

  // on first measure, launch from below the rooftops and climb into place
  const launched = useRef(false);
  useLayoutEffect(() => {
    if (launched.current || size.w === 0) return;
    launched.current = true;
    if (prefersReducedMotion()) return;
    const fromY = size.h * (1 - home.y) + 60;
    const fromX = -size.w * 0.12;
    setOff({ x: fromX, y: fromY });
    const start = performance.now();
    const dur = 3800;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3); // ease-out
      const left = 1 - e;
      // tug side to side on the way up, settling as it reaches the wind
      const sway = Math.sin(t * Math.PI * 3) * 28 * left;
      setOff({ x: fromX * left + sway, y: fromY * left });
      if (t < 1) raf.current = requestAnimationFrame(step);
      else setOff({ x: 0, y: 0 });
    };
    raf.current = requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h]);
  const kx = size.w * home.x + off.x;
  const ky = size.h * home.y + off.y;
  // string runs down to a rooftop just off the bottom of the sky
  const ax = size.w * 0.4;
  const ay = size.h + 10;
  const cx = (kx + ax) / 2 + 30;
  const cy = (ky + ay) / 2 + 60;

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (raf.current) cancelAnimationFrame(raf.current);
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: off.x, oy: off.y };
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const nx = d.ox + e.clientX - d.sx;
    const ny = d.oy + e.clientY - d.sy;
    // keep the kite inside the sky
    setOff({
      x: Math.max(-size.w * home.x + 20, Math.min(size.w * (1 - home.x) - 20, nx)),
      y: Math.max(-size.h * home.y + 10, Math.min(size.h * 0.55, ny)),
    });
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    // the wind carries it home: ease back with a small overshoot
    const from = offRef.current;
    if (prefersReducedMotion()) return setOff({ x: 0, y: 0 });
    const start = performance.now();
    const dur = 1600;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const k = 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI) * 0.08; // ease-out + drift
      const left = 1 - Math.min(k, 1.08);
      setOff({ x: from.x * left, y: from.y * left });
      if (t < 1) raf.current = requestAnimationFrame(step);
      else setOff({ x: 0, y: 0 });
    };
    raf.current = requestAnimationFrame(step);
  };

  return (
    <div ref={layer} className="k-kite-layer" aria-hidden>
      {size.w > 0 && (
        <svg className="k-kite-string" width={size.w} height={size.h}>
          <path d={`M${kx} ${ky + 22} Q${cx} ${cy} ${ax} ${ay}`} />
        </svg>
      )}
      <button
        type="button"
        tabIndex={-1}
        className={`k-kite${dragging ? " is-dragging" : ""}`}
        style={{ visibility: size.w > 0 ? "visible" : "hidden", left: `${home.x * 100}%`, top: `${home.y * 100}%`, transform: `translate(calc(-50% + ${off.x}px), calc(-50% + ${off.y}px))` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <svg viewBox="0 0 60 60" className="k-kite__art">
          <path d="M30 2 L58 30 L30 58 L2 30 Z" fill="#c0392b" />
          <path d="M30 2 L58 30 L30 30 Z" fill="#f3ecda" />
          <path d="M2 30 L30 58 L30 30 Z" fill="#1d3c72" />
          <path d="M30 2 V58 M2 30 Q30 22 58 30" fill="none" stroke="#3a2418" strokeWidth="1.2" />
        </svg>
      </button>
    </div>
  );
}
