"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PostMeta } from "@/lib/posts.types";
import { SectionIdx } from "@/components/chrome/SectionIdx";

export function Writing({ posts: POSTS }: { posts: PostMeta[] }) {
  const [top, setTop] = useState(0);
  const router = useRouter();

  const cycle = () => setTop((t) => (t + 1) % POSTS.length);

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
                key={p.slug}
                className={"write-card" + (offset === 0 ? " top" : "")}
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
                  zIndex: POSTS.length - offset,
                  opacity: offset > 3 ? 0 : 1,
                }}
              >
                <div className="meta">
                  <time dateTime={p.date}>{p.dateDisplay}</time> · {p.reading}
                </div>
                <h4>{p.title}</h4>
                <p>{p.excerpt}</p>
                <Link
                  href={`/blogs/${p.slug}`}
                  className="read"
                  onClick={(e) => e.stopPropagation()}
                  aria-disabled={offset !== 0}
                  tabIndex={offset === 0 ? 0 : -1}
                  style={{
                    pointerEvents: offset === 0 ? "auto" : "none",
                    opacity: offset === 0 ? 1 : 0.35,
                  }}
                >
                  → READ POST
                </Link>
              </div>
            );
          })}
        </div>
        <div>
          <div className="about-side">
            {POSTS.map((p, i) => (
              <div
                className="row"
                key={p.slug}
                style={{ color: i === top ? "var(--accent)" : undefined, cursor: "none" }}
                onClick={() => router.push(`/blogs/${p.slug}`)}
              >
                <span className="k">
                  <time dateTime={p.date}>{p.dateDisplay}</time>
                </span>
                <span className="v" style={{ color: i === top ? "var(--accent)" : undefined }}>
                  {p.title}
                </span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24, fontSize: 12, color: "var(--paper-dim)", lineHeight: 1.6 }}>
            Short essays on building software, learning in public, and the lessons that take longer than they should.
          </p>
        </div>
      </div>
    </section>
  );
}
