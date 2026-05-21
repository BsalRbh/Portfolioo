"use client";
import { useEffect, useRef, useState } from "react";
import { BirdSVG, BIRD_KINDS, type BirdKind } from "@/lib/birds";

const AWAY_DELAY_MS = 10000; // how long the user must be away before the overlay shows
const COOLDOWN_MS = 8000;    // after dismissal, ignore new triggers for this long
const POLL_MS = 500;         // how often we check the "away duration" against the threshold

const MESSAGES = [
  "hey... you still there?",
  "i can wait. you can't.",
  "thanks for ignoring me.",
  "i was building something for you.",
  "did you leave to check email?",
  "i'm still here, you know.",
  "no rush. take your time.",
  "i counted the seconds.",
];

/**
 * Full-screen "come back" overlay. Shows after the visitor has been away
 * (tab hidden OR cursor off the page) for at least AWAY_DELAY_MS, and fades
 * out the moment they return.
 *
 * Implementation note: instead of relying on setTimeout (which browsers
 * throttle when the tab is hidden), we record an "away-since" timestamp and
 * poll. The poll cost is negligible and the behavior is deterministic.
 */
export function AwayOverlay() {
  const [state, setState] = useState<"hidden" | "away" | "fading">("hidden");
  const [awayStartedAt, setAwayStartedAt] = useState<number | null>(null);
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    let awaySince: number | null = null;
    let lastDismissedAt = 0;
    let touchDetected = false;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let removeTimer: ReturnType<typeof setTimeout> | null = null;
    let currentState: "hidden" | "away" | "fading" = "hidden";

    const setS = (s: "hidden" | "away" | "fading") => {
      currentState = s;
      setState(s);
    };

    // Track whether the pointer is currently inside the document.
    let pointerInside = true;
    const onMouseLeave = () => { pointerInside = false; markAway(); };
    const onMouseEnter = () => { pointerInside = true;  markReturn(); };

    const markAway = () => {
      if (touchDetected) return;
      if (currentState !== "hidden") return;
      if (performance.now() - lastDismissedAt < COOLDOWN_MS) return;
      if (awaySince === null) awaySince = performance.now();
      ensurePolling();
    };

    const markReturn = () => {
      awaySince = null;
      if (currentState === "away") {
        // Fade out and unmount.
        setS("fading");
        if (removeTimer) clearTimeout(removeTimer);
        removeTimer = setTimeout(() => {
          setS("hidden");
          lastDismissedAt = performance.now();
        }, 300);
      }
      stopPollingIfIdle();
    };

    const ensurePolling = () => {
      if (pollId) return;
      pollId = setInterval(() => {
        if (awaySince === null || currentState !== "hidden") return;
        if (performance.now() - awaySince >= AWAY_DELAY_MS) {
          // Only actually show if the user is still away by both signals.
          if (document.hidden || !pointerInside) {
            setAwayStartedAt(Date.now());
            setMessageIdx(Math.floor(Math.random() * MESSAGES.length));
            setS("away");
          } else {
            // No longer away — clear and stop.
            awaySince = null;
            stopPollingIfIdle();
          }
        }
      }, POLL_MS);
    };

    const stopPollingIfIdle = () => {
      if (pollId && awaySince === null && currentState === "hidden") {
        clearInterval(pollId);
        pollId = null;
      }
    };

    const onVisibility = () => {
      if (document.hidden) markAway();
      else markReturn();
    };

    const onFirstTouch = () => { touchDetected = true; };

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });

    // If the page loads with the tab already hidden, start the clock.
    if (document.hidden) markAway();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("touchstart", onFirstTouch);
      if (pollId) clearInterval(pollId);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, []);

  if (state === "hidden") return null;

  return (
    <div className={"away-overlay" + (state === "fading" ? " fading" : "")} aria-hidden>
      <BirdsLayer />
      <div className="away-face">(◔_◔)</div>
      <div className="away-text">come back</div>
      <TypewriterText text={MESSAGES[messageIdx]} />
      {awayStartedAt !== null && <AwayClock since={awayStartedAt} />}
      <div className="away-sub">— bishal</div>
    </div>
  );
}

// --- subcomponents ---------------------------------------------------------

function AwayClock({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Math.max(0, Math.floor((now - since) / 1000));
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="away-clock">
      <span className="lbl">away</span>
      <span className="val">{pad(m)}:{pad(s)}</span>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [text]);
  return (
    <div className="away-msg">
      {shown}
      <span className="caret" />
    </div>
  );
}

function BirdsLayer() {
  type Bird = {
    id: number;
    kind: BirdKind;
    topPct: number;
    durationMs: number;
    delayMs: number;
    rtl: boolean;
    scale: number;
  };
  const birdsRef = useRef<Bird[] | null>(null);
  if (birdsRef.current === null) {
    // Generate once per mount — same SVG species the Aviary game uses.
    birdsRef.current = Array.from({ length: 7 }, (_, i) => ({
      id: i,
      kind: BIRD_KINDS[Math.floor(Math.random() * BIRD_KINDS.length)],
      topPct: 8 + Math.random() * 84,
      durationMs: 9000 + Math.random() * 9000,
      delayMs: Math.random() * 6000,
      rtl: Math.random() < 0.5,
      scale: 0.6 + Math.random() * 0.5,
    }));
  }
  return (
    <div className="away-birds" aria-hidden>
      {birdsRef.current.map((b) => (
        <span
          key={b.id}
          className={"away-bird away-bird-" + b.kind + (b.rtl ? " rtl" : "")}
          style={{
            top: `${b.topPct}%`,
            animationDuration: `${b.durationMs}ms`,
            animationDelay: `${b.delayMs}ms`,
            transform: `scale(${b.scale})`,
          }}
        >
          <span className="away-bird-inner">
            <BirdSVG kind={b.kind} />
          </span>
        </span>
      ))}
    </div>
  );
}
