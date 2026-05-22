"use client";
import { useCallback, useEffect, useState } from "react";
import { LeaderboardList, type LeaderEntry } from "./LeaderboardList";

const LEADERBOARD_SIZE = 50;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function LeaderboardOverlay({ open, onClose }: Props) {
  const [entries, setEntries] = useState<LeaderEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetch("/api/leaderboard", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: { entries: LeaderEntry[] }) => {
        setEntries(data.entries ?? []);
      })
      .catch(() => setError("offline"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="leaderboard-shroud"
      onClick={onClose}
      role="dialog"
      aria-label="Aviary leaderboard"
    >
      <div className="leaderboard-card" onClick={(e) => e.stopPropagation()}>
        <div className="leaderboard-head">
          <span className="title">AVIARY · TOP {LEADERBOARD_SIZE}</span>
          <div className="actions">
            <button
              type="button"
              className="pill"
              onClick={load}
              disabled={loading}
              aria-label="Refresh leaderboard"
            >
              {loading ? "…" : "↻ REFRESH"}
            </button>
            <button type="button" className="pill" onClick={onClose}>
              ESC · CLOSE
            </button>
          </div>
        </div>

        {error === "offline" && (
          <div className="leaderboard-error">
            <span className="hint err">couldn’t load — check connection</span>
          </div>
        )}

        <LeaderboardList entries={entries} loading={loading} />

        <div className="leaderboard-foot">
          <span className="hint">press B to play · L to toggle this board</span>
        </div>
      </div>
    </div>
  );
}
