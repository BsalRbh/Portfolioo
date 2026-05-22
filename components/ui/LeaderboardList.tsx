"use client";

export type LeaderEntry = {
  id: number;
  name: string;
  score: number;
  accuracy: number;
  created_at: string;
};

type Props = {
  entries: LeaderEntry[] | null;
  loading: boolean;
  highlightId?: number | null;
};

export function LeaderboardList({ entries, loading, highlightId }: Props) {
  if (loading && !entries) {
    return (
      <div className="aviary-board-empty">
        <span className="hint">loading…</span>
      </div>
    );
  }
  if (entries && entries.length === 0) {
    return (
      <div className="aviary-board-empty">
        <span className="hint">no entries yet — be the first</span>
      </div>
    );
  }
  if (!entries) return null;

  return (
    <ol className="aviary-board-list">
      {entries.map((row, i) => (
        <li
          key={row.id}
          className={"aviary-board-row" + (row.id === highlightId ? " me" : "")}
        >
          <span className="rank">{String(i + 1).padStart(2, "0")}</span>
          <span className="who">{row.name}</span>
          <span className="sc">{String(row.score).padStart(3, "0")}</span>
          <span className="ac">{row.accuracy}%</span>
        </li>
      ))}
    </ol>
  );
}
