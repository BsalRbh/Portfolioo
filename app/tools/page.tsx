import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/lib/tools";

const SITE_URL = "https://bishalrajbahak.com.np";
const AUTHOR_NAME = "Bishal Rajbahak";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Small, free, browser-only utilities by Bishal Rajbahak. No uploads, no sign-up — everything runs locally in your browser.",
  alternates: { canonical: "/tools" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/tools`,
    title: "Tools",
    description: "Small, free, browser-only utilities. Nothing is uploaded.",
    siteName: `${AUTHOR_NAME} — Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tools",
    description: "Small, free, browser-only utilities. Nothing is uploaded.",
  },
  robots: { index: true, follow: true },
};

export default function ToolsPage() {
  return (
    <main className="ic-page">
      <header className="ic-head">
        <div className="ic-meta">TOOLS · BROWSER-ONLY · NOTHING UPLOADED</div>
        <Link href="/" className="ic-back">
          ← back
        </Link>
      </header>
      <h1 className="ic-title">Tools</h1>
      <p className="ic-lede">
        Small utilities I built for myself, free to use. Everything runs locally
        in your browser — no uploads, no sign-up.
      </p>

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

      <footer className="ic-foot">
        <span>bishal rajbahak · tools</span>
        <span>{TOOLS.length} tool{TOOLS.length === 1 ? "" : "s"}</span>
      </footer>
    </main>
  );
}
