import { NextResponse } from "next/server";
import { NAME_RE, cleanName, rateLimited } from "@/lib/leaderboard";
import { sql } from "@/lib/db";

// Tempo Dash high scores. Needs the tempo_scores table from schema.sql.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const TOP_N = 20;

type Row = {
  id: number;
  name: string;
  score: number;
  distance: number;
  passengers: number;
  created_at: string;
};

async function top() {
  return (await sql`
    SELECT id, name, score, distance, passengers, created_at
    FROM tempo_scores
    ORDER BY score DESC, created_at ASC
    LIMIT ${TOP_N}
  `) as Row[];
}

export async function GET() {
  try {
    return NextResponse.json({ entries: await top(), limit: TOP_N });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

const isInt = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

export async function POST(req: Request) {
  if (rateLimited(req)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { name, score, distance, passengers } = (body ?? {}) as Record<string, unknown>;
  if (typeof name !== "string" || !NAME_RE.test(name.trim())) {
    return NextResponse.json({ error: "bad_name" }, { status: 400 });
  }
  if (!isInt(score, 0, 2_000_000) || !isInt(distance, 0, 5_000_000) || !isInt(passengers, 0, 10_000)) {
    return NextResponse.json({ error: "bad_score" }, { status: 400 });
  }

  try {
    const inserted = (await sql`
      INSERT INTO tempo_scores (name, score, distance, passengers)
      VALUES (${cleanName(name)}, ${score}, ${distance}, ${passengers})
      RETURNING id, name, score, distance, passengers, created_at
    `) as Row[];
    return NextResponse.json({ entry: inserted[0], entries: await top(), limit: TOP_N });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
