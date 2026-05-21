import { STATIONS } from "@/lib/stations";
import { SectionIdx } from "@/components/chrome/SectionIdx";

export function Resume() {
  return (
    <section id="cv" className="section">
      <div className="section-label">
        <SectionIdx value="06 / 08" />
        <span>CV — a non-linear line</span>
      </div>
      <div className="resume">
        {STATIONS.map((r, i) => (
          <div className={"station" + (r.now ? " now" : "")} key={i}>
            <div className="year">{r.year}</div>
            <div className="role">
              {r.role}
              <span className="org">{r.org}</span>
              <p className="desc">{r.desc}</p>
            </div>
            <div className="stack">
              {r.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
