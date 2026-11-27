import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { Clarity } from "@/components/analytics/Clarity";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { EditionChooser } from "@/components/site/EditionChooser";
import { AUTHOR, SITE_DESCRIPTION, SITE_TITLE, SITE_URL, homeJsonLd } from "@/lib/site";
import "./site.css";

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600"],
  variable: "--font-newsreader",
  display: "swap",
});

const TITLE = SITE_TITLE;
const DESCRIPTION = SITE_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — Bishal Rajbahak" },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${AUTHOR} — Writing` }] },
  },
  authors: [{ name: "Bishal Rajbahak", url: SITE_URL }],
  creator: "Bishal Rajbahak",
  keywords: [
    "Bishal Rajbahak",
    "full-stack developer",
    "web developer Nepal",
    "React developer",
    "Next.js developer",
    "Go developer",
    "Kathmandu",
  ],
  openGraph: {
    type: "profile",
    url: SITE_URL,
    siteName: "Bishal Rajbahak",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    firstName: "Bishal",
    lastName: "Rajbahak",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};



export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={serif.variable}>
      <body>
        {children}
        <EditionChooser />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
        />
        <Clarity />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
