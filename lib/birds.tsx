// Shared bird SVGs used by both the Aviary game and the AwayOverlay.
// All birds face right; callers flip with scaleX(-1) for left-facing flight.
export type BirdKind = "sparrow" | "hawk" | "duck" | "swallow" | "crow";

export const BIRD_KINDS: BirdKind[] = ["sparrow", "hawk", "duck", "swallow", "crow"];

export function BirdSVG({ kind }: { kind: BirdKind }) {
  switch (kind) {
    case "sparrow":
      return (
        <svg viewBox="0 0 64 32" aria-hidden>
          <ellipse cx="30" cy="20" rx="14" ry="7" fill="currentColor" />
          <path d="M16 20 L8 16 L8 24 Z" fill="currentColor" />
          <circle cx="42" cy="17" r="6" fill="currentColor" />
          <path d="M48 17 L54 18 L48 19 Z" fill="#f59e0b" />
          <circle cx="44" cy="16" r="1.1" fill="#0b0b0b" />
          <path className="wing" d="M22 14 Q30 6 38 14 Q30 18 22 14 Z" fill="rgba(0,0,0,0.35)" />
        </svg>
      );
    case "hawk":
      return (
        <svg viewBox="0 0 64 32" aria-hidden>
          <ellipse cx="30" cy="19" rx="16" ry="6" fill="currentColor" />
          <path d="M12 19 L2 14 L4 19 L2 24 Z" fill="currentColor" />
          <circle cx="44" cy="16" r="6" fill="currentColor" />
          <path d="M50 16 L58 15 L54 19 Z" fill="#fbbf24" />
          <circle cx="46" cy="15" r="1.2" fill="#0b0b0b" />
          <path
            className="wing"
            d="M16 14 L28 4 L40 8 L48 14 L40 16 L28 14 Z"
            fill="rgba(0,0,0,0.45)"
          />
        </svg>
      );
    case "duck":
      return (
        <svg viewBox="0 0 64 32" aria-hidden>
          <ellipse cx="28" cy="21" rx="14" ry="7" fill="currentColor" />
          <path d="M14 21 L10 18 L10 24 Z" fill="currentColor" />
          <circle cx="44" cy="16" r="7" fill="currentColor" />
          <rect x="49" y="16" width="9" height="3.5" rx="1.5" fill="#f59e0b" />
          <rect x="50" y="18" width="7" height="1.5" rx="0.6" fill="#b45309" />
          <circle cx="45" cy="14" r="1.2" fill="#0b0b0b" />
          <path
            className="wing"
            d="M20 16 Q28 8 36 14 Q30 20 20 16 Z"
            fill="rgba(255,255,255,0.55)"
          />
        </svg>
      );
    case "swallow":
      return (
        <svg viewBox="0 0 64 32" aria-hidden>
          <ellipse cx="32" cy="18" rx="14" ry="4" fill="currentColor" />
          <path d="M18 18 L4 12 L10 18 L4 24 Z" fill="currentColor" />
          <circle cx="44" cy="16" r="4.5" fill="currentColor" />
          <path d="M48 16 L54 16.5 L48 17.5 Z" fill="#fde68a" />
          <circle cx="45" cy="15" r="1" fill="#0b0b0b" />
          <path
            className="wing"
            d="M20 14 L34 2 L42 10 L34 16 L24 16 Z"
            fill="rgba(0,0,0,0.4)"
          />
        </svg>
      );
    case "crow":
      return (
        <svg viewBox="0 0 64 32" aria-hidden>
          <ellipse cx="30" cy="19" rx="16" ry="7" fill="currentColor" />
          <path d="M14 19 L4 15 L6 19 L4 23 Z" fill="currentColor" />
          <circle cx="44" cy="16" r="6.5" fill="currentColor" />
          <path d="M50 16 L60 15 L60 17 L50 18 Z" fill="#0b0b0b" />
          <circle cx="46" cy="14.5" r="1.4" fill="#fbbf24" />
          <circle cx="46.2" cy="14.7" r="0.5" fill="#0b0b0b" />
          <path
            className="wing"
            d="M18 14 L30 4 L44 10 L46 14 L34 16 L22 16 Z"
            fill="rgba(0,0,0,0.55)"
          />
        </svg>
      );
  }
}
