// The portfolio ships in several "editions" — same content, different designs.
// "/" shows the visitor's chosen edition (remembered in a cookie, applied by
// middleware.ts); without a cookie, "/" shows the default (Kathmandu).

export const STYLE_COOKIE = "pf_style";
export const STYLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const STYLES = [
  {
    id: "kathmandu",
    name: "Kathmandu",
    blurb: "Red brick, carved wood and temple roofs — the hometown edition.",
  },
  {
    id: "tempo",
    name: "Tempo Dash",
    blurb: "Drive a safa tempo through Kathmandu traffic — the playable edition.",
  },
  {
    id: "ledger",
    name: "Ledger",
    blurb: "Columns, totals and rubber stamps — the accountant's edition.",
  },
  {
    id: "terminal",
    name: "Terminal",
    blurb: "Keyboard-driven, CRT modes and easter eggs — the developer's edition.",
  },
] as const;

export type StyleId = (typeof STYLES)[number]["id"];

export const DEFAULT_STYLE: StyleId = "kathmandu";

export function isStyle(v: unknown): v is StyleId {
  return STYLES.some((s) => s.id === v);
}

/** Link that switches edition: middleware stores the choice and redirects. */
export function styleHref(id: StyleId): string {
  return `/?style=${id}`;
}
