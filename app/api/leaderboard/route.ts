import { NextResponse } from "next/server";
import { NAME_RE, cleanName, rateLimited } from "@/lib/leaderboard";
import { sql } from "@/lib/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const TOP_N = 50;

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

  const inserted = (await sql`
    INSERT INTO aviary_scores (name, score, accuracy)
    VALUES (${cleanName(name)}, ${score}, ${accuracy})
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
