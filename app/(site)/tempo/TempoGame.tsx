"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { TempoEngine, type GameOver, type Hud } from "./engine";
import { STOPS, unlock } from "./stops";

type Entry = { id: number; name: string; score: number; distance: number; passengers: number };

const BEST_KEY = "tempo.best";
const NAME_KEY = "tempo.name";
const MUTE_KEY = "tempo.muted";

const store = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, v: string) {
    try {
      localStorage.setItem(key, v);
    } catch {
      /* ignore */
    }
  },
};

/* ── sounds (synthesised, no files) ── */
let audio: AudioContext | null = null;
function beep(freqs: number[], dur: number, type: OscillatorType = "square", vol = 0.06) {
  try {
    audio ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = audio.currentTime;
    freqs.forEach((f, i) => {
      const o = audio!.createOscillator();
      const g = audio!.createGain();
      o.type = type;
      o.frequency.value = f;
      const t0 = now + i * dur * 0.9;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(audio!.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    });
  } catch {
    /* no audio */
  }
}
const SFX = {
  honk: () => beep([440, 554], 0.12),
  stop: () => beep([523, 659, 784], 0.1, "triangle", 0.08),
  crash: () => beep([180, 120, 80], 0.14, "sawtooth", 0.07),
};

const EMPTY_HUD: Hud = { score: 0, distance: 0, charge: 100, momos: 0, passengers: 0, nextStop: STOPS[0].place, speed: 0 };

export function TempoGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<TempoEngine | null>(null);
  const mutedRef = useRef(false);
  const [state, setState] = useState<"ready" | "running" | "paused" | "over">("ready");
  const [hud, setHud] = useState<Hud>(EMPTY_HUD);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [over, setOver] = useState<GameOver | null>(null);
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(false);
  const [name, setName] = useState("");
  const [board, setBoard] = useState<Entry[] | null>(null);
  const [boardError, setBoardError] = useState(false);
  const [submit, setSubmit] = useState<"idle" | "sending" | "done" | "error">("idle");
  const toastId = useRef(0);

  const showToast = useCallback((text: string) => {
    setToast({ id: ++toastId.current, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // boot the engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBest(Number(store.get(BEST_KEY) ?? 0));
    setName(store.get(NAME_KEY) ?? "");
    const m = store.get(MUTE_KEY) === "1";
    setMuted(m);
    mutedRef.current = m;

    const engine = new TempoEngine(
      canvas,
      {
        onHud: setHud,
        onToast: showToast,
        onHonk: () => !mutedRef.current && SFX.honk(),
        onStop: (i) => {
          const s = STOPS[i];
          unlock([s.id]);
          if (!mutedRef.current) SFX.stop();
          showToast(`${s.place}: passengers on board! Unlocked “${s.title}”`);
        },
        onGameOver: (g) => {
          if (!mutedRef.current) SFX.crash();
          setOver(g);
          setState("over");
          setSubmit("idle");
          setBest((b) => {
            const nb = Math.max(b, g.score);
            store.set(BEST_KEY, String(nb));
            return nb;
          });
        },
      },
      getComputedStyle(canvas).fontFamily,
    );
    engineRef.current = engine;

    const ro = new ResizeObserver(() => engine.resize());
    ro.observe(canvas);
    const onHidden = () => {
      if (document.hidden && engine.state === "running") {
        engine.pause();
        setState("paused");
      }
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      ro.disconnect();
      document.removeEventListener("visibilitychange", onHidden);
      engine.destroy();
    };
  }, [showToast]);

  const start = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    setOver(null);
    e.start();
    setState("running");
    canvasRef.current?.focus();
  }, []);

  const togglePause = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    if (e.state === "running") {
      e.pause();
      setState("paused");
    } else if (e.state === "paused") {
      e.start();
      setState("running");
    }
  }, []);

  // keyboard (only while the game area has focus, so the page still scrolls normally)
  const onKey = (ev: React.KeyboardEvent) => {
    const e = engineRef.current;
    if (!e) return;
    const k = ev.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") e.left();
    else if (k === "ArrowRight" || k === "d" || k === "D") e.right();
    else if (k === "ArrowDown" || k === "s" || k === "S") e.brake();
    else if (k === " " || k === "ArrowUp" || k === "w" || k === "W") {
      if (e.state === "running") e.honk();
      else if (e.state !== "over") start();
    } else if (k === "Enter" && e.state !== "running" && !(ev.target instanceof HTMLInputElement)) start();
    else if (k === "p" || k === "P" || k === "Escape") togglePause();
    else return;
    ev.preventDefault();
  };

  // touch: swipe to change lanes, tap to honk
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);
  const onTouchStart = (ev: React.TouchEvent) => {
    const t = ev.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchEnd = (ev: React.TouchEvent) => {
    const e = engineRef.current;
    const s = touch.current;
    touch.current = null;
    if (!e || !s) return;
    const t = ev.changedTouches[0];
    const dx = t.clientX - s.x;
    if (Math.abs(dx) > 30) {
      if (dx < 0) e.left();
      else e.right();
    } else if (e.state === "running") e.honk();
    else if (e.state === "ready" || e.state === "paused") start();
  };

  const toggleMute = () => {
    setMuted((m) => {
      mutedRef.current = !m;
      store.set(MUTE_KEY, !m ? "1" : "0");
      return !m;
    });
  };

  // leaderboard
  const loadBoard = useCallback(() => {
    fetch("/api/tempo-leaderboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { entries: Entry[] }) => {
        setBoard(d.entries.slice(0, 10));
        setBoardError(false);
      })
      .catch(() => setBoardError(true));
  }, []);
  useEffect(loadBoard, [loadBoard]);

  const sendScore = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!over || submit === "sending" || submit === "done") return;
    setSubmit("sending");
    store.set(NAME_KEY, name.trim());
    try {
      const res = await fetch("/api/tempo-leaderboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), score: over.score, distance: over.distance, passengers: over.passengers }),
      });
      if (!res.ok) throw new Error();
      const d = (await res.json()) as { entries: Entry[] };
      setBoard(d.entries.slice(0, 10));
      setSubmit("done");
    } catch {
      setSubmit("error");
    }
  };

  const nameOk = /^[A-Za-z0-9 _.\-ऀ-ॿ]{3,12}$/.test(name.trim());

  return (
    <div className="td-game">
      <div className="td-stage">
        <div className="td-hud" aria-live="off">
          <span className="td-hud__score">{hud.score.toLocaleString()}</span>
          <span>{(hud.distance / 1000).toFixed(2)} km</span>
          <span>🥟 {hud.momos}</span>
          <span className="td-hud__battery" aria-label={`Battery ${hud.charge}%`}>
            <span style={{ width: `${hud.charge}%` }} className={hud.charge < 25 ? "is-low" : ""} />
          </span>
        </div>

        <canvas
          ref={canvasRef}
          className="td-canvas"
          tabIndex={0}
          aria-label="Tempo Dash game. Arrow keys to change lanes, space to honk, P to pause."
          onKeyDown={onKey}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => state === "ready" && start()}
        />

        <p className="td-next">
          Next stop: <strong>{hud.nextStop}</strong>
        </p>

        {toast && (
          <p key={toast.id} className="td-toast" role="status">
            {toast.text}
          </p>
        )}

        {state === "ready" && (
          <div className="td-overlay">
            <p className="td-overlay__kicker">सफा टेम्पो · Safa tempo</p>
            <h2 className="td-overlay__title">Tempo Dash</h2>
            <p>Drive across Kathmandu. Pick up passengers at each stop to unlock my portfolio, one stop at a time.</p>
            <ul className="td-keys">
              <li>
                <kbd>←</kbd> <kbd>→</kbd> change lanes · <kbd>↓</kbd> brake
              </li>
              <li>
                <kbd>Space</kbd> honk (pedestrians & dogs move — cows don&apos;t)
              </li>
              <li>Grab ⚡ to recharge · 🥟 for points · avoid potholes</li>
            </ul>
            <button type="button" className="td-btn" onClick={start}>
              Start the engine
            </button>
            {best > 0 && <p className="td-best">Your best: {best.toLocaleString()}</p>}
          </div>
        )}

        {state === "paused" && (
          <div className="td-overlay">
            <h2 className="td-overlay__title">Chiya break ☕</h2>
            <button type="button" className="td-btn" onClick={togglePause}>
              Back on the road
            </button>
          </div>
        )}

        {state === "over" && over && (
          <div className="td-overlay td-overlay--over">
            <p className="td-overlay__kicker">Trip over</p>
            <h2 className="td-overlay__title">{over.reason}</h2>
            <dl className="td-stats">
              <div>
                <dt>Score</dt>
                <dd>{over.score.toLocaleString()}</dd>
              </div>
              <div>
                <dt>Distance</dt>
                <dd>{(over.distance / 1000).toFixed(2)} km</dd>
              </div>
              <div>
                <dt>Passengers</dt>
                <dd>{over.passengers}</dd>
              </div>
              <div>
                <dt>Best</dt>
                <dd>{best.toLocaleString()}</dd>
              </div>
            </dl>
            {submit === "done" ? (
              <p className="td-sent">On the board. Can anyone beat that?</p>
            ) : (
              <form className="td-submit" onSubmit={sendScore}>
                <label htmlFor="td-name">Put your name on the leaderboard</label>
                <div>
                  <input
                    id="td-name"
                    value={name}
                    maxLength={12}
                    placeholder="3–12 letters"
                    autoComplete="off"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <button type="submit" className="td-btn td-btn--small" disabled={!nameOk || submit === "sending"}>
                    {submit === "sending" ? "Sending…" : "Submit"}
                  </button>
                </div>
                {submit === "error" && <p className="td-error">Couldn&apos;t reach the leaderboard. Try again later.</p>}
              </form>
            )}
            <button type="button" className="td-btn" onClick={start}>
              Drive again
            </button>
          </div>
        )}
      </div>

      {/* touch controls */}
      <div className="td-pad" aria-hidden>
        <button type="button" tabIndex={-1} onClick={() => engineRef.current?.left()}>
          ◀
        </button>
        <button type="button" tabIndex={-1} className="td-pad__honk" onClick={() => (state === "running" ? engineRef.current?.honk() : start())}>
          {state === "running" ? "HONK" : "GO"}
        </button>
        <button type="button" tabIndex={-1} onClick={() => engineRef.current?.right()}>
          ▶
        </button>
      </div>

      <aside className="td-side">
        <div className="td-side__row">
          <button type="button" className="td-chip" onClick={togglePause} disabled={state !== "running" && state !== "paused"}>
            {state === "paused" ? "Resume" : "Pause"}
          </button>
          <button type="button" className="td-chip" onClick={toggleMute} aria-pressed={muted}>
            {muted ? "Sound off" : "Sound on"}
          </button>
        </div>
        <h3>Leaderboard</h3>
        {boardError ? (
          <p className="td-muted">The leaderboard is taking a chiya break. Your best is saved on this device.</p>
        ) : !board ? (
          <p className="td-muted">Loading…</p>
        ) : board.length === 0 ? (
          <p className="td-muted">No scores yet — be the first.</p>
        ) : (
          <ol className="td-board">
            {board.map((e, i) => (
              <li key={e.id}>
                <span className="td-board__rank">{i + 1}</span>
                <span className="td-board__name">{e.name}</span>
                <span className="td-board__score">{e.score.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
