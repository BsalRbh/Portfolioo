"use client";
import Link from "next/link";
import { SectionIdx } from "@/components/chrome/SectionIdx";
import { TOOLS } from "@/lib/tools";

export function Tools() {
  return (
    <section id="tools" className="section">
      <div className="section-label">
        <SectionIdx value="06 / 09" />
        <span>Tools — small browser-only utilities</span>
      </div>
      <div className="tools-section">
        <ul className="tools-grid">
          {TOOLS.map((tool) => (
            <li key={tool.slug}>
              <Link href={tool.href} className="tool-card">
                <span className="tool-tag">{tool.tag}</span>
                <span className="tool-name">{tool.name}</span>
                <span className="tool-blurb">{tool.blurb}</span>
                <span className="tool-go">open →</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="tools-note">
          Free to use, nothing uploaded — everything runs locally in your
          browser. More on the way →{" "}
          <Link href="/tools" className="tools-all">
            see all tools
          </Link>
        </p>
      </div>
    </section>
  );
}
