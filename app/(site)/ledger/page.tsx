import type { CSSProperties } from "react";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans_Condensed, Reenie_Beanie } from "next/font/google";
import { EditionSwitcher } from "@/components/site/EditionSwitcher";
import { InboxNote } from "@/components/site/InboxNote";
import { EDUCATION, EXPERIENCE, PRINCIPLES, PROFILE, SERVICES, WORK } from "@/lib/content";
import { getAllPostsMeta } from "@/lib/posts";
import "./ledger.css";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--lg-mono",
  display: "swap",
});

const cond = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--lg-cond",
  display: "swap",
});

const hand = Reenie_Beanie({
  subsets: ["latin"],
  weight: "400",
  variable: "--lg-hand",
  display: "swap",
});

// Hero "statement of account" — posted line by line on load.
const STATEMENT = [
  { k: "Trade", v: "Full-stack developer · React, Next.js, Go" },
  { k: "Employer", v: "One Accord · remote, United States" },
  { k: "Branch", v: `${PROFILE.location} · ${PROFILE.timezone}` },
  { k: "Account opened", v: "2016, at a bank counter" },
];

// The career T-account: what each job took, and what it paid back.
const T_ACCOUNT = [
  {
    dr: "Bank intern",
    where: "Nepal SBI Bank · 2016–17",
    cr: "How systems fail people — and how to notice.",
  },
  {
    dr: "Junior accountant",
    where: "Sipradi Trading · 2017–18",
    cr: "Spreadsheets are just stubborn frontends.",
  },
  {
    dr: "Teacher",
    where: "Motherland Secondary School · 2018–23",
    cr: "Explaining things so they land the first time.",
  },
  {
    dr: "Software engineer",
    where: "Webpoint · One Accord · 2023–now",
    cr: "Somewhere to spend all of the above.",
  },
];

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#story", label: "Story" },
  { href: "#experience", label: "Experience" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function LedgerPage() {
  const posts = getAllPostsMeta().slice(0, 3);
  const year = new Date().getFullYear();
  const current = EXPERIENCE.find((e) => e.now);
  const stampDelay = 250 + STATEMENT.length * 160 + 450;

  return (
    <div
      className={`v-ledger ${mono.variable} ${cond.variable} ${hand.variable}`}
      data-edition="ledger"
    >
      <a href="#main" className="lg-skip">
        Skip to content
      </a>

      <div className="lg-book">
        <header className="lg-masthead">
          <a href="#main" className="lg-masthead__title">
            <span className="lg-mono">Ledger</span> Bishal Rajbahak
          </a>
          <nav aria-label="Primary">
            <ul>
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main id="main">
          {/* ── Statement of account (hero) ── */}
          <section className="lg-hero" aria-labelledby="lg-title">
            <div className="lg-hero__intro">
              <p className="lg-folio">Folio 01 · Statement of account</p>
              <h1 id="lg-title">
                <span className="lg-hero__pre">The working ledger of</span>
                Bishal Rajbahak
              </h1>
              <p className="lg-lede">
                Full-stack developer in Kathmandu, Nepal. I build web apps end to end: React and Next.js on the
                front, Go services and PostgreSQL behind them.
              </p>
              <div className="lg-actions">
                <a className="lg-btn" href={`mailto:${PROFILE.email}`}>
                  Email me
                </a>
                <a className="lg-textlink" href="#work">
                  See my work
                </a>
              </div>
            </div>

            <div className="lg-statement-card" style={{ "--stamp-delay": `${stampDelay}ms` } as CSSProperties}>
              <table className="lg-statement">
                <caption className="lg-sr">Account summary</caption>
                <tbody>
                  {STATEMENT.map((row, i) => (
                    <tr key={row.k} style={{ "--i": i } as CSSProperties}>
                      <th scope="row">{row.k}</th>
                      <td>{row.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="lg-stamp">
                <span className="lg-stamp__big">Open</span>
                <span className="lg-stamp__small">to interesting product work</span>
              </p>
            </div>
          </section>

          {/* ── Schedule A: services ── */}
          <section className="lg-section" aria-labelledby="services-title">
            <div className="lg-section__head">
              <p className="lg-folio">Schedule A</p>
              <h2 id="services-title">What I do</h2>
            </div>
            <ol className="lg-schedule">
              {SERVICES.map((s, i) => (
                <li key={s.title}>
                  <span className="lg-ref">A{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* ── Line items: work ── */}
          <section id="work" className="lg-section" aria-labelledby="work-title">
            <div className="lg-section__head">
              <p className="lg-folio">Line items</p>
              <h2 id="work-title">Work I&apos;ve shipped</h2>
            </div>
            <div className="lg-colheads" aria-hidden>
              <span>Item</span>
              <span>Particulars</span>
              <span>Year</span>
            </div>
            <ol className="lg-items">
              {WORK.map((w, i) => (
                <li key={w.title}>
                  <span className="lg-ref">{pad(i + 1)}</span>
                  <div className="lg-items__body">
                    <h3>{w.title}</h3>
                    <p className="lg-items__context">{w.context}</p>
                    <p>{w.summary}</p>
                    <p className="lg-tags">
                      <span className="lg-sr">Built with: </span>
                      {w.tags.join(" · ")}
                    </p>
                  </div>
                  <span className="lg-items__year">{w.year}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* ── Story: the career T-account ── */}
          <section id="story" className="lg-section" aria-labelledby="story-title">
            <div className="lg-section__head">
              <p className="lg-folio">Notes to the accounts</p>
              <h2 id="story-title">How the books balance</h2>
            </div>
            <div className="lg-story">
              <div className="lg-story__text">
                <p>
                  I came to software the long way round. Before I wrote code, I spent a year at a bank counter, a
                  year as a junior accountant and five years in a classroom.
                </p>
                <p>
                  Each job cost me some time. Each one paid something back that I still use every day — so here
                  it is, the way an accountant would write it down.
                </p>
              </div>

              <div className="lg-taccount-wrap">
                <table className="lg-taccount">
                  <caption>Career account</caption>
                  <thead>
                    <tr>
                      <th scope="col">
                        <abbr title="Debit">Dr</abbr> · what I put in
                      </th>
                      <th scope="col">
                        <abbr title="Credit">Cr</abbr> · what I took away
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {T_ACCOUNT.map((r) => (
                      <tr key={r.dr}>
                        <td>
                          <strong>{r.dr}</strong>
                          <span>{r.where}</span>
                        </td>
                        <td>{r.cr}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td>Balanced</td>
                    </tr>
                  </tfoot>
                </table>
                <span className="lg-margin-note" aria-hidden>
                  it balances!
                </span>
              </div>
            </div>

            <h3 className="lg-subhead">How I work</h3>
            <ol className="lg-policies">
              {PRINCIPLES.map((p, i) => (
                <li key={p.title}>
                  <span className="lg-ref">Policy {i + 1}</span>
                  <div>
                    <strong>{p.title}.</strong> {p.body}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ── General ledger: experience ── */}
          <section id="experience" className="lg-section" aria-labelledby="experience-title">
            <div className="lg-section__head">
              <p className="lg-folio">General ledger</p>
              <h2 id="experience-title">Experience</h2>
            </div>
            <table className="lg-journal">
              <caption className="lg-sr">Work history, most recent first</caption>
              <thead>
                <tr>
                  <th scope="col">Period</th>
                  <th scope="col">Particulars</th>
                  <th scope="col">Folio</th>
                </tr>
              </thead>
              <tbody>
                {EXPERIENCE.map((r) => (
                  <tr key={r.role + r.org} className={r.now ? "is-now" : undefined}>
                    <td className="lg-journal__date">{r.year}</td>
                    <td>
                      <strong>{r.role}</strong>
                      {r.now && <span className="lg-current">Current</span>}
                      <span className="lg-journal__org">{r.org}</span>
                      <span className="lg-journal__desc">{r.desc}</span>
                    </td>
                    <td className="lg-journal__folio">{r.stack.join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
              {current && (
                <tfoot>
                  <tr>
                    <td colSpan={2}>Balance carried forward</td>
                    <td>
                      {current.role.replace(/ \(.*\)$/, "")} · {current.org.split(" · ")[0]}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>

            <h3 className="lg-subhead">Education</h3>
            <table className="lg-journal lg-journal--compact">
              <caption className="lg-sr">Education</caption>
              <thead>
                <tr>
                  <th scope="col">Period</th>
                  <th scope="col">Particulars</th>
                  <th scope="col">Folio</th>
                </tr>
              </thead>
              <tbody>
                {EDUCATION.map((r) => (
                  <tr key={r.role}>
                    <td className="lg-journal__date">{r.year}</td>
                    <td>
                      <strong>{r.role}</strong>
                      <span className="lg-journal__org">{r.org}</span>
                    </td>
                    <td className="lg-journal__folio">{r.stack.join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── Correspondence: writing ── */}
          {posts.length > 0 && (
            <section id="writing" className="lg-section" aria-labelledby="writing-title">
              <div className="lg-section__head">
                <p className="lg-folio">Correspondence</p>
                <h2 id="writing-title">Writing</h2>
              </div>
              <ol className="lg-posts">
                {posts.map((p) => (
                  <li key={p.slug}>
                    <time dateTime={p.date}>{p.dateDisplay}</time>
                    <Link href={`/blogs/${p.slug}`}>
                      <strong>{p.title}</strong>
                      <span>{p.excerpt}</span>
                    </Link>
                    <span className="lg-posts__read">{p.reading}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ── Settle the account: contact ── */}
          <section id="contact" className="lg-section" aria-labelledby="contact-title">
            <div className="lg-invoice">
              <div className="lg-invoice__head">
                <p className="lg-folio">Open a new account</p>
                <h2 id="contact-title">Get in touch</h2>
                <p>
                  Hiring, or need something built? Send me a note and let&apos;s start a fresh page.
                </p>
              </div>

              <dl className="lg-invoice__terms">
                <div>
                  <dt>Payable to</dt>
                  <dd>{PROFILE.name}</dd>
                </div>
                <div>
                  <dt>Address</dt>
                  <dd>{PROFILE.location}</dd>
                </div>
                <div>
                  <dt>Terms</dt>
                  <dd>Remote, with teams worldwide</dd>
                </div>
              </dl>

              <a className="lg-invoice__email" href={`mailto:${PROFILE.email}`}>
                {PROFILE.email}
              </a>
              <InboxNote className="lg-inbox-note" />

              <ul className="lg-invoice__links">
                {PROFILE.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="lg-signature">
                <span className="lg-signature__ink" aria-hidden>
                  Bishal Rajbahak
                </span>
                <span className="lg-signature__line">Authorised signature</span>
              </div>
            </div>
          </section>
        </main>

        <footer className="lg-footer">
          <p>© {year} Bishal Rajbahak</p>
          <p>
            <Link href="/tools">Free tools</Link>
          </p>
          <p className="lg-mono">End of ledger</p>
        </footer>
      </div>

      <EditionSwitcher current="ledger" />
    </div>
  );
}
