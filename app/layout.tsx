import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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

const SITE_URL = "https://bishalrajbahak.com.np";
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
  alternates: { canonical: "/" },
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

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Bishal Rajbahak",
  url: SITE_URL,
  jobTitle: "Full-Stack Developer",
  worksFor: { "@type": "Organization", name: "One Accord" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kathmandu",
    addressCountry: "NP",
  },
  knowsAbout: [
    "React",
    "Next.js",
    "Go",
    "TypeScript",
    "Full-Stack Development",
  ],
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } catch (e) {}
})();
`;

const clarityEnabled = process.env.NODE_ENV === "production";

const clarityScript = `
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "wumsxgno1q");
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {clarityEnabled && (
          <Script
            id="ms-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: clarityScript }}
          />
        )}
      </body>
    </html>
  );
}
