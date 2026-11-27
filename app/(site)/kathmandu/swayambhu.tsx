"use client";
// Swayambhunath pieces for the Kathmandu edition: the stupa with its watching
// eyes and prayer flags, the temple's famous monkey, and butter lamps.
import { useEffect, useRef, useState } from "react";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────────────── Stupa + prayer flags ───────────────── */

const FLAG_COLOURS = ["#2f6fb5", "#f4f1ea", "#c8372d", "#3e8f4e", "#e8b931"]; // sky, cloud, fire, water, earth
const SPIRE = { x: 180, y: 26 };
// two strings from the spire down to the hill on either side (quadratic curves)
const STRINGS = [
  { cx: 112, cy: 62, ex: 22, ey: 150 },
  { cx: 248, cy: 62, ex: 338, ey: 150 },
];
const FLAGS_PER_STRING = 13;

function quad(t: number, p0: number, p1: number, p2: number) {
  return (1 - t) ** 2 * p0 + 2 * t * (1 - t) * p1 + t ** 2 * p2;
}

const EYES = [
  { x: 172.5, y: 79 },
  { x: 187.5, y: 79 },
];

/**
 * Swayambhu on its hill, seen from across the valley. The Buddha eyes on the
 * harmika follow the cursor; the prayer flags ripple when the cursor passes
 * close by. Decorative only.
 */
export function Stupa() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [gust, setGust] = useState(0);
  const lastGust = useRef(0);

  useEffect(() => {
    if (reducedMotion()) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const svg = svgRef.current;
        if (!svg) return;
        const r = svg.getBoundingClientRect();
        if (r.width === 0) return;
        // eyes: point the pupils toward the cursor (max 1.3 units)
        const ex = r.left + (180 / 360) * r.width;
        const ey = r.top + (79 / 180) * r.height;
        const dx = e.clientX - ex;
        const dy = e.clientY - ey;
        const dist = Math.hypot(dx, dy) || 1;
        const m = Math.min(1.3, dist / 120);
        setLook({ x: (dx / dist) * m, y: (dy / dist) * m * 0.6 });
        // flags: a gust when the cursor comes near (throttled)
        const near =
          e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 40 && e.clientY < r.bottom + 20;
        const now = performance.now();
        if (near && now - lastGust.current > 900) {
          lastGust.current = now;
          setGust((g) => g + 1);
        }
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg ref={svgRef} className="k-stupa" viewBox="0 0 360 180" aria-hidden focusable="false">
      {/* the hill (Semgu) */}
      <path d="M0 180 C60 152 118 128 180 124 C242 128 300 152 360 180 Z" fill="#7d9483" />
      <path d="M40 180 C90 160 140 142 180 140 C220 142 270 160 320 180 Z" fill="#6f8775" />

      {/* prayer flag strings + flags (behind the stupa) */}
      <g key={gust} className={`k-flags${gust ? " is-gusting" : ""}`}>
        {STRINGS.map((s, si) => (
          <g key={si}>
            <path
              d={`M${SPIRE.x} ${SPIRE.y} Q${s.cx} ${s.cy} ${s.ex} ${s.ey}`}
              fill="none"
              stroke="#5a4a3c"
              strokeWidth="0.6"
            />
            {Array.from({ length: FLAGS_PER_STRING }, (_, i) => {
              const t = 0.12 + (i / FLAGS_PER_STRING) * 0.84;
              const x = quad(t, SPIRE.x, s.cx, s.ex);
              const y = quad(t, SPIRE.y, s.cy, s.ey);
              return (
                <rect
                  key={i}
                  className="k-flag"
                  x={x - 3}
                  y={y}
                  width="6"
                  height="7.5"
                  fill={FLAG_COLOURS[i % FLAG_COLOURS.length]}
                  style={{ "--i": i } as React.CSSProperties}
                />
              );
            })}
          </g>
        ))}
      </g>

      {/* stupa: terrace, dome, harmika with eyes, 13-ring spire, canopy */}
      <rect x="136" y="114" width="88" height="10" fill="#e6e0d2" />
      <path d="M134 116 A46 34 0 0 1 226 116 Z" fill="#f5f2ea" />
      <path d="M134 116 A46 34 0 0 1 162 86 Q150 100 152 116 Z" fill="#e3ddcf" />
      <rect x="162" y="70" width="36" height="18" fill="#d6a441" />
      <rect x="162" y="70" width="36" height="3" fill="#b8862c" />
      {/* the eyes of the Buddha */}
      {EYES.map((e, i) => (
        <g key={i}>
          <path d={`M${e.x - 5} ${e.y - 3.2} Q${e.x} ${e.y - 6} ${e.x + 5} ${e.y - 3.2}`} fill="none" stroke="#1d1410" strokeWidth="0.9" />
          <path d={`M${e.x - 4.5} ${e.y} Q${e.x} ${e.y - 3} ${e.x + 4.5} ${e.y} Q${e.x} ${e.y + 2.2} ${e.x - 4.5} ${e.y} Z`} fill="#f5f2ea" stroke="#1d1410" strokeWidth="0.6" />
          <circle cx={e.x + look.x} cy={e.y - 0.4 + look.y} r="1.35" fill="#1d1410" />
        </g>
      ))}
      {/* the "nose" — the Nepali numeral one (१) */}
      <path d="M178.6 81.5 q2.6 -0.6 2.4 1.4 q-0.2 1.6 -2 1.6 q2.4 0.6 2.6 3" fill="none" stroke="#1d1410" strokeWidth="0.8" strokeLinecap="round" />
      {/* spire: thirteen rings */}
      <path d="M166 70 L194 70 L186 34 L174 34 Z" fill="#d6a441" />
      <g stroke="#9c7224" strokeWidth="0.6">
        {Array.from({ length: 13 }, (_, i) => {
          const y = 67 - i * 2.6;
          const half = 14 - (i * 6) / 13;
          return <path key={i} d={`M${180 - half} ${y} H${180 + half}`} />;
        })}
      </g>
      <path d="M168 34 Q180 22 192 34 Z" fill="#d6a441" />
      <path d="M180 24 V12" stroke="#d6a441" strokeWidth="2" strokeLinecap="round" />
      <circle cx="180" cy="11" r="2.4" fill="#f0c862" />
    </svg>
  );
}

/* ───────────────── The monkey ───────────────── */

// Swayambhu is "the monkey temple". One monkey, two hiding spots: it peeks
// over a carved beam; click it and it runs off along the beam, then turns up
// at the next spot.
const SPOTS = ["services", "experience"] as const;
type Spot = (typeof SPOTS)[number];
let monkeyAt: Spot | null = "services";
const MOVED = "k-monkey-moved";

function MonkeyFace() {
  return (
    <svg viewBox="0 0 60 46" className="k-monkey__peek" aria-hidden focusable="false">
      <circle cx="13" cy="17" r="6.5" fill="#8a6a52" />
      <circle cx="13" cy="17" r="3.5" fill="#d9a48c" />
      <circle cx="47" cy="17" r="6.5" fill="#8a6a52" />
      <circle cx="47" cy="17" r="3.5" fill="#d9a48c" />
      <ellipse cx="30" cy="20" rx="16" ry="15" fill="#9b7a5e" />
      <path d="M17 14 Q30 4 43 14" fill="none" stroke="#7d5f48" strokeWidth="2" />
      <ellipse cx="30" cy="24" rx="10.5" ry="9" fill="#e3b29a" />
      <circle className="k-monkey__eye" cx="25.5" cy="21" r="1.9" fill="#2a1a12" />
      <circle className="k-monkey__eye" cx="34.5" cy="21" r="1.9" fill="#2a1a12" />
      <path d="M28 26 h1 M31 26 h1" stroke="#7a4a3a" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M26 29.5 Q30 31.5 34 29.5" fill="none" stroke="#7a4a3a" strokeWidth="1.1" strokeLinecap="round" />
      {/* hands gripping the beam */}
      <ellipse cx="12" cy="41" rx="6.5" ry="4.5" fill="#9b7a5e" />
      <ellipse cx="48" cy="41" rx="6.5" ry="4.5" fill="#9b7a5e" />
      <path d="M8 42 v2 M11 42.5 v2 M14 42.5 v2 M44 42.5 v2 M47 42.5 v2 M50 42 v2" stroke="#6d5240" strokeWidth="0.9" />
    </svg>
  );
}

function MonkeyRunning() {
  return (
    <svg viewBox="0 0 76 44" className="k-monkey__run" aria-hidden focusable="false">
      <path d="M14 22 C4 22 2 10 8 6 C12 4 14 8 11 10" fill="none" stroke="#8a6a52" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="32" cy="24" rx="18" ry="10" fill="#9b7a5e" />
      <path className="k-monkey__legs" d="M20 30 L14 42 M26 32 L30 42 M40 31 L36 42 M46 29 L52 41" stroke="#8a6a52" strokeWidth="4" strokeLinecap="round" />
      <circle cx="56" cy="16" r="9.5" fill="#9b7a5e" />
      <circle cx="52" cy="10" r="3.5" fill="#8a6a52" />
      <ellipse cx="60" cy="18" rx="5.5" ry="5" fill="#e3b29a" />
      <circle cx="59" cy="15.5" r="1.3" fill="#2a1a12" />
    </svg>
  );
}

export function Monkey({ spot }: { spot: Spot }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"hidden" | "peeking" | "running" | "gone">("hidden");
  const [home, setHome] = useState(monkeyAt === spot);

  // listen for the monkey moving to this spot
  useEffect(() => {
    const onMoved = () => {
      const here = monkeyAt === spot;
      setHome(here);
      if (here) setState("hidden"); // back again: ready to peek
    };
    window.addEventListener(MOVED, onMoved);
    return () => window.removeEventListener(MOVED, onMoved);
  }, [spot]);

  // peek when this beam scrolls into view (if the monkey lives here now)
  useEffect(() => {
    const el = ref.current;
    if (!el || !home || state !== "hidden") return;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setState("peeking"), 900);
          io.disconnect();
        }
      },
      { threshold: 1, rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [home, state]);

  const runAway = () => {
    if (state !== "peeking") return;
    setState("running");
    setTimeout(
      () => {
        setState("gone");
        monkeyAt = SPOTS[(SPOTS.indexOf(spot) + 1) % SPOTS.length];
        window.dispatchEvent(new Event(MOVED));
      },
      reducedMotion() ? 0 : 1700,
    );
  };

  return (
    <div ref={ref} className={`k-monkey is-${state}`} aria-hidden>
      <div className="k-monkey__slot">
        <button type="button" tabIndex={-1} className="k-monkey__btn" onClick={runAway}>
          <MonkeyFace />
        </button>
      </div>
      <div className="k-monkey__runner">
        <MonkeyRunning />
      </div>
    </div>
  );
}

/* ───────────────── Butter lamps ───────────────── */

const LAMPS = 12;

export function ButterLamps() {
  const [lit, setLit] = useState<boolean[]>(() => Array(LAMPS).fill(false));
  const count = lit.filter(Boolean).length;

  return (
    <div className="k-lamps">
      <div className="k-lamps__row">
        {lit.map((on, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            aria-hidden
            className={`k-lamp${on ? " is-lit" : ""}`}
            style={{ "--i": i } as React.CSSProperties}
            onClick={() => setLit((l) => l.map((v, j) => (j === i ? !v : v)))}
          >
            <span className="k-lamp__flame" />
            <span className="k-lamp__bowl" />
          </button>
        ))}
      </div>
      <p className="k-lamps__count" aria-live="polite">
        {count === 0
          ? "Tap a butter lamp to light it."
          : count === LAMPS
            ? "All twelve lamps lit. The whole courtyard glows."
            : `${count} of ${LAMPS} butter lamps lit.`}
      </p>
    </div>
  );
}
