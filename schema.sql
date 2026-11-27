-- Aviary leaderboard schema.
-- Run once against your Neon / Vercel Postgres database
-- (Neon SQL editor, or: psql "$DATABASE_URL" -f schema.sql).

CREATE TABLE IF NOT EXISTS aviary_scores (
  id          SERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  score       INTEGER     NOT NULL CHECK (score >= 0),
  accuracy    INTEGER     NOT NULL CHECK (accuracy BETWEEN 0 AND 100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS aviary_scores_rank_idx
  ON aviary_scores (score DESC, created_at ASC);

-- Tempo Dash leaderboard (the playable edition).

CREATE TABLE IF NOT EXISTS tempo_scores (
  id          SERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  score       INTEGER     NOT NULL CHECK (score >= 0),
  distance    INTEGER     NOT NULL CHECK (distance >= 0),   -- metres driven
  passengers  INTEGER     NOT NULL CHECK (passengers >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tempo_scores_rank_idx
  ON tempo_scores (score DESC, created_at ASC);
