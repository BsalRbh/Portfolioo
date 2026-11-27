"use client";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_STYLE,
  STYLES,
  STYLE_COOKIE,
  STYLE_COOKIE_MAX_AGE,
  isStyle,
  styleHref,
} from "@/lib/styles";

/**
 * First-visit overlay: "pick an edition". Rendered client-side on top of the
 * already server-rendered page, so search engines still see the real content.
 * Shown only when no edition cookie is set; skipping keeps the current one.
 */
export function EditionChooser() {
  const [open, setOpen] = useState(false);
  const firstRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    // A shared link ("/?edition=…") or a direct edition URL already says which
    // edition to show, so don't ask.
    const params = new URLSearchParams(window.location.search);
    if (params.has("edition") || window.location.pathname !== "/") return;
    // Never cover the page for crawlers, previews or audits (search engines
    // penalise interstitials, and link previews would capture the overlay).
    const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|preview|lighthouse|headless|google|chatgpt|claude|perplexity/i;
    if (navigator.webdriver || BOT.test(navigator.userAgent)) return;
    const hasPref = document.cookie.split("; ").some((c) => c.startsWith(`${STYLE_COOKIE}=`));
    if (!hasPref) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  function skip() {
    const current = document.querySelector<HTMLElement>("[data-edition]")?.dataset.edition;
    const keep = isStyle(current) ? current : DEFAULT_STYLE;
    document.cookie = `${STYLE_COOKIE}=${keep}; path=/; max-age=${STYLE_COOKIE_MAX_AGE}; samesite=lax`;
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="chooser" role="dialog" aria-modal="true" aria-labelledby="chooser-title">
      <div className="chooser__panel">
        <p className="chooser__kicker">Bishal Rajbahak · portfolio</p>
        <h2 id="chooser-title" className="chooser__title">
          Same story, four ways to read it.
        </h2>
        <p className="chooser__lede">
          I&apos;ve been a teacher, an accountant and a developer — so this site comes in editions. Pick one;
          you can switch any time from the corner of the page.
        </p>
        <ul className="chooser__grid">
          {STYLES.map((s, i) => (
            <li key={s.id}>
              <a
                ref={i === 0 ? firstRef : undefined}
                href={styleHref(s.id)}
                rel="nofollow"
                className="chooser__option"
              >
                <span className={`chooser__cover chooser__cover--${s.id}`} aria-hidden>
                  <span />
                </span>
                <strong>{s.name}</strong>
                <small>{s.blurb}</small>
              </a>
            </li>
          ))}
        </ul>
        <button type="button" className="chooser__skip" onClick={skip}>
          Skip — just show me the site
        </button>
      </div>
    </div>
  );
}
