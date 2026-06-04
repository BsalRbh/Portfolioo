import type { Metadata } from "next";
import Link from "next/link";
import { ImageConverter } from "@/components/tools/ImageConverter";

const SITE_URL = "https://bishalrajbahak.com.np";
const AUTHOR_NAME = "Bishal Rajbahak";

export const metadata: Metadata = {
  title: "Image Converter",
  description:
    "Convert images between JPEG, PNG and WebP right in your browser — set quality, batch convert. Nothing is uploaded; everything runs locally.",
  alternates: { canonical: "/tools/image-converter" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/tools/image-converter`,
    title: "Image Converter",
    description:
      "Private, browser-only image converter. JPEG / PNG / WebP, quality, batch.",
    siteName: `${AUTHOR_NAME} — Portfolio`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Converter",
    description: "Private, browser-only image converter. JPEG / PNG / WebP.",
  },
  robots: { index: true, follow: true },
};

export default function ImageConverterPage() {
  return (
    <main className="ic-page">
      <header className="ic-head">
        <div className="ic-meta">TOOL · BROWSER-ONLY · NOTHING UPLOADED</div>
        <Link href="/" className="ic-back">
          ← back
        </Link>
      </header>
      <h1 className="ic-title">Image Converter</h1>
      <p className="ic-lede">
        Convert between JPEG, PNG and WebP — tune quality, batch. Files
        never leave your browser.
      </p>
      <ImageConverter />
      <footer className="ic-foot">
        <span>bishal rajbahak · tools</span>
        <span>runs entirely client-side</span>
      </footer>
    </main>
  );
}
