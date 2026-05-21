"use client";
import { useEffect, useState } from "react";

const ACTIVITIES = [
  "writing go ::: services + handlers",
  "shipping next.js ::: app router migration",
  "reading ::: 'a philosophy of software design'",
  "brewing ::: nepali milk tea",
  "refactoring ::: components into composable units",
];

function formatUptime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

export function Hero() {
  const [activity, setActivity] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [uptime, setUptime] = useState("00h 00m 00s");

  useEffect(() => {
    const id = setInterval(() => setActivity((a) => (a + 1) % ACTIVITIES.length), 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => setUptime(formatUptime(performance.now() - start)), 1000);
    return () => clearInterval(id);
  }, []);


  return (
    <section id="hero" className="section hero">
      <div className="hero-main">
        <div>
          <div className="eyebrow">
            <span className="live">●</span> &nbsp; portfolio
          </div>
          <h1>
            <span className="alt">bishal</span>
            <br />
            <span className="stroke">rajbahak</span>
            <span className="accent">.</span>
          </h1>
          <p className="hero-tag">
            Full-stack developer building{" "}
            <em className="em">interfaces — and the APIs behind them — that feel inevitable</em>. Currently at One
            Accord, shipping{" "}
            <span style={{ color: "var(--accent)", fontStyle: "italic" }}>React</span> &
            <span style={{ color: "var(--accent)", fontStyle: "italic" }}> Next.js</span> on the front,
            <span style={{ color: "var(--accent)", fontStyle: "italic" }}> Go</span> on the back, from Kathmandu. I care
            about the small details — the empty state, the loading skeleton, the error message no one will ever read.
          </p>
        </div>
        <div className="hero-meta">
          <div>
            <div className="k">based</div>
            Kathmandu, NP
          </div>
          <div>
            <div className="k">role</div>
            Full-stack Engineer
            <br />
            One Accord · remote
          </div>
          <div>
            <div className="k">stack</div>
            react · next · ts
            <br />
            go · node · postgres
          </div>
          <div>
            <div className="k">since</div>
            dec 2023
            <br />
            (eng track)
          </div>
        </div>
      </div>

      <aside className="telemetry">
        <div className="telem-title">// system telemetry</div>
        <div className="telem-row">
          <span className="k">uptime</span>
          <span className="v">{uptime}</span>
        </div>
        <div className="telem-row">
          <span className="k">load avg</span>
          <span className="v accent">0.62</span>
        </div>
        <div className="telem-row">
          <span className="k">scroll</span>
          <span className="v">{String(Math.min(99, Math.round(scrollY / 8))).padStart(2, "0")} px/s</span>
        </div>
        <div className="telem-row">
          <span className="k">tz</span>
          <span className="v">UTC+05:45</span>
        </div>
        <div className="telem-row">
          <span className="k">coord</span>
          <span className="v">27.71°N 85.32°E</span>
        </div>

        <div className="telem-title">// currently</div>
        <div className="terminal-line">
          <span className="prompt">$</span>
          {ACTIVITIES[activity]}
        </div>
        <div className="terminal-line">
          <span className="prompt">$</span>employed @ one accord · remote
        </div>
        <div className="terminal-line">
          <span className="prompt">$</span>open to interesting conversations
        </div>

        <div className="telem-title">// signal</div>
        <pre className="ascii">{`
   ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅
   ────────────────────────────
   "good code, like a
    good lesson, has to
    land the first time."
        `}</pre>
      </aside>
    </section>
  );
}
