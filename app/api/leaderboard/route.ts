import { NextResponse } from "next/server";
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
  parseRawPattern,
} from "obscenity";
import {
  ROMAN_NEPALI_ROOTS,
  ROMAN_NEPALI_ACRONYMS,
  DEVANAGARI_ROOTS,
} from "@/lib/profanity-ne";
import { sql } from "@/lib/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const TOP_N = 50;
// ASCII alphanumerics + a few separators, OR Devanagari script (U+0900–U+097F).
const NAME_RE = /^[A-Za-z0-9 _.\-ऀ-ॿ]{3,12}$/;

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

function isProfane(input: string): boolean {
  if (profanity.hasMatch(input)) return true;
  if (ACRONYM_RE.test(input.toLowerCase())) return true;
  for (const root of DEVANAGARI_ROOTS) {
    if (input.includes(root)) return true;
  }
  return false;
}

type Row = {
  id: number;
  name: string;
  score: number;
  accuracy: number;
  created_at: string;
};

export async function GET() {
  const rows = (await sql`
    SELECT id, name, score, accuracy, created_at
    FROM aviary_scores
    ORDER BY score DESC, created_at ASC
    LIMIT ${TOP_N}
  `) as Row[];
  return NextResponse.json({ entries: rows, limit: TOP_N });
}

// Tiny per-instance rate limiter. Edge instances are ephemeral, so this only
// blunts naive abuse — a determined attacker can still spam. Good enough for
// a personal portfolio.
const HITS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const slot = HITS.get(ip);
  if (!slot || slot.resetAt < now) {
    HITS.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  slot.count++;
  return slot.count > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { name, score, accuracy } = (body ?? {}) as {
    name?: unknown;
    score?: unknown;
    accuracy?: unknown;
  };

  if (typeof name !== "string" || !NAME_RE.test(name.trim())) {
    return NextResponse.json({ error: "bad_name" }, { status: 400 });
  }
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100_000) {
    return NextResponse.json({ error: "bad_score" }, { status: 400 });
  }
  if (
    typeof accuracy !== "number" ||
    !Number.isInteger(accuracy) ||
    accuracy < 0 ||
    accuracy > 100
  ) {
    return NextResponse.json({ error: "bad_accuracy" }, { status: 400 });
  }

  const trimmed = name.trim();
  // Silent substitution: flagged names save as "Anonymous" without telling the player.
  const cleanName = isProfane(trimmed) ? "Anonymous" : trimmed;

  const inserted = (await sql`
    INSERT INTO aviary_scores (name, score, accuracy)
    VALUES (${cleanName}, ${score}, ${accuracy})
    RETURNING id, name, score, accuracy, created_at
  `) as Row[];

  const top = (await sql`
    SELECT id, name, score, accuracy, created_at
    FROM aviary_scores
    ORDER BY score DESC, created_at ASC
    LIMIT ${TOP_N}
  `) as Row[];

  return NextResponse.json({ entry: inserted[0], entries: top, limit: TOP_N });
}
