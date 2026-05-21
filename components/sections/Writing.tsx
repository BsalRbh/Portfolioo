"use client";
import { useEffect, useState } from "react";
import { POSTS } from "@/lib/posts";
import { SectionIdx } from "@/components/chrome/SectionIdx";

export function Writing() {
  const [top, setTop] = useState(0);
  const [openPost, setOpenPost] = useState<number | null>(null);

  const cycle = () => setTop((t) => (t + 1) % POSTS.length);

  useEffect(() => {
    if (openPost == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPost(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPost]);

  return (
    <section id="writing" className="section">
      <div className="section-label">
        <SectionIdx value="05 / 08" />
        <span>Writing — click to cycle the stack</span>
      </div>
      <div className="two-col">
        <div className="writing-stack" onClick={cycle}>
          {POSTS.map((p, i) => {
            const offset = (i - top + POSTS.length) % POSTS.length;
            const x = offset * 18;
            const y = offset * 14;
            const rot = offset === 0 ? 0 : (offset % 2 === 0 ? 1.2 : -1.4) * offset;
            return (
              <div
                key={p.title}
                className={"write-card" + (offset === 0 ? " top" : "")}
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
                  zIndex: POSTS.length - offset,
                  opacity: offset > 3 ? 0 : 1,
                }}
              >
                <div className="meta">
                  {p.date} · {p.reading}
                </div>
                <h4>{p.title}</h4>
                <p>{p.excerpt}</p>
                <button
                  className="read"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenPost(i);
                  }}
                  disabled={offset !== 0}
                  style={{ pointerEvents: offset === 0 ? "auto" : "none" }}
                >
                  → READ POST
                </button>
              </div>
            );
          })}
        </div>
        <div>
          <div className="about-side">
            {POSTS.map((p, i) => (
              <div
                className="row"
                key={p.title}
                style={{ color: i === top ? "var(--accent)" : undefined, cursor: "none" }}
                onClick={() => setOpenPost(i)}
              >
                <span className="k">{p.date}</span>
                <span className="v" style={{ color: i === top ? "var(--accent)" : undefined }}>
                  {p.title}
                </span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24, fontSize: 12, color: "var(--paper-dim)", lineHeight: 1.6 }}>
            Short essays, mostly about React, the unglamorous middle of a career change, and the small UX details that
            take longer than they should. Roughly monthly.
          </p>
        </div>
      </div>
      {openPost != null && (
        <div className="post-shroud" onClick={() => setOpenPost(null)}>
          <article className="post-reader" onClick={(e) => e.stopPropagation()}>
            <header className="post-head">
              <div className="post-meta">
                {POSTS[openPost].date} · {POSTS[openPost].reading} · ESSAY
              </div>
              <button className="post-close" onClick={() => setOpenPost(null)} aria-label="Close">
                ✕ ESC
              </button>
            </header>
            <h2 className="post-title">{POSTS[openPost].title}</h2>
            <div className="post-body">
              {POSTS[openPost].body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <footer className="post-foot">
              <span>bishal rajbahak · {POSTS[openPost].date.toLowerCase()}</span>
              <span>
                {openPost + 1} / {POSTS.length}
              </span>
            </footer>
          </article>
        </div>
      )}
    </section>
  );
}
