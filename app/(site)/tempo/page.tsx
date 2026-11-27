import Link from "next/link";
import { Mukta, Yatra_One } from "next/font/google";
import { EditionSwitcher } from "@/components/site/EditionSwitcher";
import { InboxNote } from "@/components/site/InboxNote";
import { getAllPostsMeta } from "@/lib/posts";
import { EDUCATION, EXPERIENCE, PRINCIPLES, PROFILE, SERVICES, SKILLS, WORK } from "@/lib/content";
import { TempoGame } from "./TempoGame";
import { TicketBook } from "./TicketBook";
import type { StopId } from "./stops";
import "./tempo.css";

// Tempo Dash — the playable edition. A small driving game across Kathmandu;
// each bus stop unlocks part of the portfolio. Everything is also readable
// without playing (route map below, "skip the ride").

const sign = Yatra_One({ subsets: ["latin", "devanagari"], weight: "400", variable: "--td-sign", display: "swap" });
const body = Mukta({ subsets: ["latin", "devanagari"], weight: ["400", "600", "700"], variable: "--td-body", display: "swap" });

export default function TempoEdition() {
  const posts = getAllPostsMeta().slice(0, 3);

  const sections: Record<StopId, React.ReactNode> = {
    ratnapark: (
      <>
        <p className="td-lead">
          I&apos;m Bishal Rajbahak, a full-stack developer in {PROFILE.location}. I build fast, reliable web apps —
          React and Next.js on the front, Go and PostgreSQL behind them — for a US-based team at One Accord.
        </p>
        <p>
          Before software I worked at a bank counter, kept the books for a trading company, and spent five years
          teaching. That&apos;s why I care about clear explanations and the small details.
        </p>
        <p className="td-tags">{SKILLS.join(" · ")}</p>
      </>
    ),
    asan: (
      <ul className="td-list">
        {SERVICES.map((s) => (
          <li key={s.title}>
            <strong>{s.title}.</strong> {s.body}
          </li>
        ))}
      </ul>
    ),
    thamel: (
      <ul className="td-list">
        {WORK.map((w) => (
          <li key={w.title}>
            <strong>{w.title}</strong> <span className="td-muted">— {w.context}, {w.year}</span>
            <br />
            {w.summary} <span className="td-tags">{w.tags.join(" · ")}</span>
          </li>
        ))}
      </ul>
    ),
    patan: (
      <ol className="td-list td-list--num">
        {PRINCIPLES.map((p) => (
          <li key={p.title}>
            <strong>{p.title}.</strong> {p.body}
          </li>
        ))}
      </ol>
    ),
    baneshwor: (
      <>
        <ul className="td-list">
          {EXPERIENCE.map((r) => (
            <li key={r.role + r.org}>
              <span className="td-year">{r.year}</span> <strong>{r.role}</strong>{" "}
              <span className="td-muted">— {r.org}</span>
              <br />
              {r.desc}
            </li>
          ))}
        </ul>
        <p className="td-muted td-edu">
          Education: {EDUCATION.map((e) => `${e.role} (${e.org}, ${e.year})`).join(" · ")}
        </p>
      </>
    ),
    kalanki: (
      <ul className="td-list">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blogs/${p.slug}`} className="td-link">
              {p.title}
            </Link>{" "}
            <span className="td-muted">
              — {p.dateDisplay} · {p.reading}
            </span>
            <br />
            {p.excerpt}
          </li>
        ))}
      </ul>
    ),
    airport: (
      <div className="td-contact">
        <p>Last stop. Hiring, or need something built? Tell me about it.</p>
        <a className="td-email" href={`mailto:${PROFILE.email}`}>
          {PROFILE.email}
        </a>
        <InboxNote className="td-inbox" />
        <p className="td-social">
          {PROFILE.links.map((l, i) => (
            <span key={l.href}>
              {i > 0 && " · "}
              <a href={l.href} target="_blank" rel="noreferrer" className="td-link">
                {l.label}
              </a>
            </span>
          ))}
        </p>
      </div>
    ),
  };

  return (
    <div className={`v-tempo ${sign.variable} ${body.variable}`} data-edition="tempo">
      <header className="td-top">
        <p className="td-brand">
          Bishal Rajbahak <span>· full-stack developer</span>
        </p>
        <a className="td-skip" href="#route">
          Skip the ride ↓
        </a>
      </header>

      <main>
        <section className="td-hero" aria-labelledby="td-title">
          <h1 id="td-title" className="td-title">
            Bishal Rajbahak&apos;s portfolio, <span>by tempo</span>
          </h1>
          <p className="td-sub">
            A tiny driving game across Kathmandu. Each bus stop you reach unlocks part of my portfolio — or skip
            straight to the route map.
          </p>
        </section>

        <TempoGame />
        <TicketBook sections={sections} />
      </main>

      <footer className="td-foot">
        <p>
          © {new Date().getFullYear()} Bishal Rajbahak · {PROFILE.location} · <Link href="/tools">Free tools</Link>
        </p>
      </footer>

      <EditionSwitcher current="tempo" />
    </div>
  );
}
