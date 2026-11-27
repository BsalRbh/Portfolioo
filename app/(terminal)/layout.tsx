import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import { Clarity } from "@/components/analytics/Clarity";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AUTHOR, SITE_URL, siteJsonLd } from "@/lib/site";
import "../globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600"],
  variable: "--font-newsreader",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_NAME = "Bishal Rajbahak — Portfolio";
const SITE_DESCRIPTION =
  "Bishal Rajbahak — full-stack developer (React/Next · Go), based in Kathmandu,Nepal.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BISHAL RAJBAHAK — Portfolio",
    template: "%s — Bishal Rajbahak",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${AUTHOR} — Writing` }] },
  },
  authors: [{ name: "Bishal Rajbahak", url: SITE_URL }],
  creator: "Bishal Rajbahak",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "BISHAL RAJBAHAK — Portfolio",
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BISHAL RAJBAHAK — Portfolio",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};


const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
    if (sessionStorage.getItem('boot-played') || location.hash === '#writing') {
      document.documentElement.setAttribute('data-boot-skip', '1');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <Clarity />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
