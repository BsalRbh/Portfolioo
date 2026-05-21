"use client";
import { useEffect, useState } from "react";
import { SectionIdx } from "@/components/chrome/SectionIdx";

export function Now() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clock = time
    ? time.toLocaleTimeString("en-US", { hour12: false, timeZone: "Asia/Kathmandu" })
    : "--:--:--";

  return (
    <section id="now" className="section">
      <div className="section-label">
        <SectionIdx value="07 / 08" />
        <span>Now — what I&apos;m doing this week</span>
      </div>
      <div className="now-board">
        <div className="now-grid">
          <div className="now-cell">
            <div className="label">building</div>
            <div className="val">
              product surfaces
              <br />@ one accord
            </div>
          </div>
          <div className="now-cell">
            <div className="label">studying</div>
            <div className="val">
              PG Diploma, CS
              <br />
              Purbanchal University
            </div>
          </div>
          <div className="now-cell">
            <div className="label">reading</div>
            <div className="val accent">
              A Philosophy of
              <br />
              Software Design
            </div>
          </div>
          <div className="now-cell">
            <div className="label">local time</div>
            <div className="val mono">
              {clock}
              <br />
              NPT · kathmandu
            </div>
          </div>
          <div className="now-cell">
            <div className="label">currently in</div>
            <div className="val">
              Kathmandu, NP
              <br />
              (home base)
            </div>
          </div>
          <div className="now-cell">
            <div className="label">next</div>
            <div className="val">
              wrap up diploma
              <br />— jan 2025
            </div>
          </div>
        </div>
        <div className="ticker">
          <div className="ticker-inner">
            <span>✦ SHIPPED A11Y PASS THIS SPRINT</span>
            <span className="accent">✦ NEW POST — &quot;useEffect IS A TAX, NOT A TOOL&quot;</span>
            <span>✦ 11 MONTHS @ ONE ACCORD</span>
            <span className="accent">✦ PG DIPLOMA IN CS · IN PROGRESS</span>
            <span>✦ OPEN TO INTERESTING CONVERSATIONS</span>
            <span>✦ SHIPPED A11Y PASS THIS SPRINT</span>
            <span className="accent">✦ NEW POST — &quot;useEffect IS A TAX, NOT A TOOL&quot;</span>
            <span>✦ 11 MONTHS @ ONE ACCORD</span>
            <span className="accent">✦ PG DIPLOMA IN CS · IN PROGRESS</span>
            <span>✦ OPEN TO INTERESTING CONVERSATIONS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
