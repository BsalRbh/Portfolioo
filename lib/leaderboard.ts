// Shared by the game leaderboards (aviary in the terminal, Tempo Dash):
// name validation, profanity filter and a tiny per-instance rate limiter.
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
  parseRawPattern,
} from "obscenity";
import { ROMAN_NEPALI_ROOTS, ROMAN_NEPALI_ACRONYMS, DEVANAGARI_ROOTS } from "@/lib/profanity-ne";

// ASCII alphanumerics + a few separators, OR Devanagari script (U+0900–U+097F).
export const NAME_RE = /^[A-Za-z0-9 _.\-ऀ-ॿ]{3,12}$/;

// English + Roman-Nepali roots share the same transformer pipeline
// (leet/skip-non-alphabetic/collapse-duplicates/lowercase), so a name
// like "r4ndi" or "r.a.n.d.i" is normalized before matching.
const nepaliExtended = ROMAN_NEPALI_ROOTS.reduce(
  (ds, root) => ds.addPhrase((p) => p.addPattern(parseRawPattern(root))),
  englishDataset,
);

const profanity = new RegExpMatcher({
  ...nepaliExtended.build(),
  ...englishRecommendedTransformers,
});

// Word-boundary check for short Roman acronyms ("mc", "bc"), so we
// don't false-positive on names like "mcray" or "bcube".
const ACRONYM_RE = new RegExp(
  `(?:^|[^a-z])(${ROMAN_NEPALI_ACRONYMS.map((a) => a.toLowerCase()).join("|")})(?:$|[^a-z])`,
  "i",
);

export function isProfane(input: string): boolean {
  if (profanity.hasMatch(input)) return true;
  if (ACRONYM_RE.test(input.toLowerCase())) return true;
  for (const root of DEVANAGARI_ROOTS) {
    if (input.includes(root)) return true;
  }
  return false;
}

/** Silent substitution: flagged names save as "Anonymous" without telling the player. */
export function cleanName(name: string): string {
  const trimmed = name.trim();
  return isProfane(trimmed) ? "Anonymous" : trimmed;
}

// Tiny per-instance rate limiter. Edge instances are ephemeral, so this only
// blunts naive abuse — a determined attacker can still spam. Good enough for
// a personal portfolio.
const HITS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

export function rateLimited(req: Request): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const slot = HITS.get(ip);
  if (!slot || slot.resetAt < now) {
    HITS.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  slot.count++;
  return slot.count > MAX_PER_WINDOW;
}
