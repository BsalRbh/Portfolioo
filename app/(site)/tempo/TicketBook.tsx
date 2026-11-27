"use client";
import { useEffect, useState } from "react";
import { STOPS, UNLOCK_EVENT, readUnlocked, unlock, type StopId } from "./stops";

/**
 * The route map: one card per stop holding a part of the portfolio. The
 * content is server-rendered (always in the HTML); cards just show as locked
 * until the visitor picks up passengers at that stop — or skips the ride.
 */
export function TicketBook({ sections }: { sections: Record<StopId, React.ReactNode> }) {
  const [unlocked, setUnlocked] = useState<StopId[] | null>(null);

  useEffect(() => {
    setUnlocked(readUnlocked());
    const on = () => setUnlocked(readUnlocked());
    window.addEventListener(UNLOCK_EVENT, on);
    return () => window.removeEventListener(UNLOCK_EVENT, on);
  }, []);

  // Before hydration (and without JS) everything is shown.
  const isOpen = (id: StopId) => unlocked === null || unlocked.includes(id);
  const count = unlocked === null ? STOPS.length : STOPS.filter((s) => unlocked.includes(s.id)).length;

  return (
    <section id="route" className="td-route" aria-labelledby="route-title">
      <div className="td-route__head">
        <div>
          <p className="td-route__kicker">Route map · {count}/{STOPS.length} stops unlocked</p>
          <h2 id="route-title">The portfolio, stop by stop</h2>
        </div>
        {count < STOPS.length && (
          <button type="button" className="td-btn td-btn--ghost" onClick={() => unlock(STOPS.map((s) => s.id))}>
            Skip the ride — unlock everything
          </button>
        )}
      </div>

      <ol className="td-stops">
        {STOPS.map((s, i) => {
          const open = isOpen(s.id);
          return (
            <li key={s.id} id={`stop-${s.id}`} className={`td-stop${open ? " is-open" : " is-locked"}`}>
              <header className="td-stop__sign">
                <span className="td-stop__n">{i + 1}</span>
                <span>
                  <span className="td-stop__ne" lang="ne">
                    {s.ne}
                  </span>
                  <span className="td-stop__place">{s.place}</span>
                </span>
                <h3 className="td-stop__title">{s.title}</h3>
              </header>
              <div className="td-stop__body" aria-hidden={!open}>
                {sections[s.id]}
              </div>
              {!open && (
                <div className="td-stop__lock">
                  <p>Pick up passengers at {s.place} to unlock this stop.</p>
                  <button type="button" className="td-chip" onClick={() => unlock([s.id])}>
                    Just peek
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
