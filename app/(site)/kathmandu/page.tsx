import Link from "next/link";
import { Mukta, Yatra_One } from "next/font/google";
import { EditionSwitcher } from "@/components/site/EditionSwitcher";
import { InboxNote } from "@/components/site/InboxNote";
import { getAllPostsMeta } from "@/lib/posts";
import { EDUCATION, EXPERIENCE, PRINCIPLES, PROFILE, SERVICES, WORK } from "@/lib/content";
import { Himalaya, Pagoda, Pigeon } from "./art";
import { FrontDoor, HonkLink, KathmanduTime, Kite, Overhead, PrayerWheels } from "./interactive";
import { ButterLamps, Monkey, Stupa } from "./swayambhu";
import { FloorIndicator, ScrollFx } from "./scroll";
import "./kathmandu.css";

// Kathmandu edition — the default at "/".
// The page is a Newar house seen from the street: morning sky and a pagoda at
// the top, overhead wires, then floor after floor of bare brick and carved sal
// wood, each labelled with a painted street sign. Contact is the front door.

const sign = Yatra_One({
  subsets: ["latin", "devanagari"],
  weight: "400",
  variable: "--k-sign",
  display: "swap",
});

const body = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "600", "700"],
  variable: "--k-body",
  display: "swap",
});

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#story", label: "Story" },
  { href: "#experience", label: "Experience" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
];

/** A painted street-sign plate: Nepali on top, English below (the h2). */
function StreetSign({ id, ne, en }: { id: string; ne: string; en: string }) {
  return (
    <div className="k-sign" data-reveal>
      <p className="k-sign__ne" lang="ne" aria-hidden>
        {ne}
      </p>
      <h2 id={`${id}-title`} className="k-sign__en">
        {en}
      </h2>
    </div>
  );
}

/** One storey of the house: a carved beam, its sign, then its contents. */
function Floor({
  id,
  ne,
  en,
  className = "",
  beam,
  children,
}: {
  id: string;
  ne: string;
  en: string;
  className?: string;
  /** something living on this floor's beam (e.g. the monkey) */
  beam?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`k-floor ${className}`} aria-labelledby={`${id}-title`}>
      <div className="k-beam" aria-hidden />
      {beam}
      <div className="k-wrap">
        <StreetSign id={id} ne={ne} en={en} />
        {children}
      </div>
    </section>
  );
}

export default function KathmanduEdition() {
  const posts = getAllPostsMeta().slice(0, 3);
  const year = new Date().getFullYear();

  return (
    <div className={`v-kathmandu ${sign.variable} ${body.variable}`} data-edition="kathmandu">
      <a href="#k-main" className="k-skip">
        Skip to content
      </a>

      {/* ── Sky: header + hero ───────────────────────────── */}
      <div className="k-sky">
        <Himalaya />
        <Stupa />
        <Kite />

        <header className="k-top k-wrap">
          <Link href="/" className="k-mark">
            Bishal Rajbahak
          </Link>
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

        <section className="k-hero k-wrap" aria-labelledby="k-hero-title">
          <div className="k-hero__text">
            <p className="k-plate">
              <span lang="ne">काठमाडौं</span>
              <span>
                Kathmandu, Nepal
                <KathmanduTime />
              </span>
            </p>
            <h1 id="k-hero-title" className="k-hero__title">
              Bishal Rajbahak
            </h1>
            <p className="k-hero__ne" lang="ne" aria-hidden>
              बिशाल राजबाहक
            </p>
            <p className="k-hero__lede">
              Full-stack developer. I build fast, reliable web apps — React and Next.js on the front, Go and
              PostgreSQL behind them — for a US-based team at One Accord, from a desk in Kathmandu.
            </p>
            <div className="k-actions">
              <HonkLink href={`mailto:${PROFILE.email}`}>Email me</HonkLink>
              <a className="k-link" href="#work">
                See my work
              </a>
            </div>
            <p className="k-status">{PROFILE.availability}</p>
          </div>
          <div className="k-hero__temple">
            <Pagoda />
          </div>
        </section>

        <Overhead />
      </div>

      {/* ── The house: floor by floor ───────────────────── */}
      <main id="k-main" className="k-house">
        <Floor id="services" ne="म के गर्छु" en="What I do" beam={<Monkey spot="services" />}>
          {/* sanjhyal: one wide carved window, three bays */}
          <ul className="k-sanjhyal">
            {SERVICES.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ul>
        </Floor>

        <Floor id="work" ne="काम" en="Selected work">
          {/* ankhijhyal: lattice windows, one per project */}
          <ul className="k-windows">
            {WORK.map((w, i) => (
              <li key={w.title} className="k-window" data-reveal style={{ "--i": i } as React.CSSProperties}>
                <div className="k-window__lattice" aria-hidden />
                <article className="k-window__body">
                  <p className="k-meta">
                    {w.context} · {w.year}
                  </p>
                  <h3>{w.title}</h3>
                  <p>{w.summary}</p>
                  <p className="k-tags">{w.tags.join(" · ")}</p>
                </article>
              </li>
            ))}
          </ul>
        </Floor>

        <Floor
          id="story"
          ne="कथा"
          en="The long way in"
          beam={
            <div className="k-flyby" data-reveal aria-hidden>
              <Pigeon />
            </div>
          }
        >
          <div className="k-story">
            <div className="k-plaster">
              <p className="k-story__lead">
                Before I wrote code, I worked at a bank counter, kept the books for a trading company, and spent
                five years teaching in a Kathmandu school.
              </p>
              <p>
                Each job left something behind. Teaching made me explain things clearly. Accounting made me
                check the details twice. The bank showed me how quickly a system can let people down. I bring
                all three to the software I build today.
              </p>
            </div>
            <div className="k-panel">
              <h3>How I work</h3>
              <ol className="k-principles">
                {PRINCIPLES.map((p) => (
                  <li key={p.title}>
                    <strong>{p.title}.</strong> {p.body}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Floor>

        <Floor id="experience" ne="अनुभव" en="Experience" beam={<Monkey spot="experience" />}>
          <ol className="k-record">
            {EXPERIENCE.map((r) => (
              <li key={r.role + r.org} data-reveal>
                <p className="k-record__year">{r.year}</p>
                <div>
                  <h3>
                    {r.role}
                    {r.now && <span className="k-now">Now</span>}
                  </h3>
                  <p className="k-meta">{r.org}</p>
                  <p>{r.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="k-panel k-education">
            <h3>Education</h3>
            <ul>
              {EDUCATION.map((e) => (
                <li key={e.role}>
                  <span className="k-record__year">{e.year}</span>
                  <span>
                    <strong>{e.role}</strong> — {e.org}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Floor>

        {posts.length > 0 && (
          <Floor id="writing" ne="लेख" en="Writing">
            <ul className="k-posts">
              {posts.map((p, i) => (
                <li key={p.slug} data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <Link href={`/blogs/${p.slug}`} className="k-post">
                    <span className="k-meta">
                      <time dateTime={p.date}>{p.dateDisplay}</time> · {p.reading}
                    </span>
                    <span className="k-post__title">{p.title}</span>
                    <span className="k-post__excerpt">{p.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Floor>
        )}

        {/* Ground floor — the front door */}
        <Floor id="contact" ne="सम्पर्क" en="The door's open" className="k-ground">
          <FrontDoor>
            <div className="k-door__toran" aria-hidden />
            <div className="k-door__frame">
              <span className="k-door__leaf k-door__leaf--l" aria-hidden />
              <div className="k-door__inside">
                <p>Hiring, or need something built? Come in and tell me about it.</p>
                <a className="k-door__email" href={`mailto:${PROFILE.email}`}>
                  {PROFILE.email}
                </a>
                <InboxNote className="k-door__note" />
                <ul className="k-door__links">
                  {PROFILE.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} target="_blank" rel="noreferrer">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <span className="k-door__leaf k-door__leaf--r" aria-hidden />
            </div>
            <div className="k-door__step" aria-hidden />
          </FrontDoor>
        </Floor>
      </main>

      <section className="k-street-life" aria-label="Prayer wheels and butter lamps">
        <div className="k-wrap">
          <PrayerWheels />
          <ButterLamps />
        </div>
      </section>

      <footer className="k-street">
        <div className="k-wrap">
          <p>
            © {year} Bishal Rajbahak · {PROFILE.location} · {PROFILE.timezone}
          </p>
          <p>
            <Link href="/tools">Free tools</Link>
          </p>
        </div>
      </footer>

      <FloorIndicator />
      <ScrollFx />
      <EditionSwitcher current="kathmandu" />
    </div>
  );
}
