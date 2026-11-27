// The tempo's route. Each stop you pick passengers up at unlocks one part of
// the portfolio, in route order.
export const STOPS = [
  { id: "ratnapark", place: "Ratnapark", ne: "रत्नपार्क", title: "About me" },
  { id: "asan", place: "Asan", ne: "असन", title: "What I do" },
  { id: "thamel", place: "Thamel", ne: "ठमेल", title: "Work I've shipped" },
  { id: "patan", place: "Patan Dhoka", ne: "पाटन ढोका", title: "How I work" },
  { id: "baneshwor", place: "Baneshwor", ne: "बानेश्वर", title: "Experience" },
  { id: "kalanki", place: "Kalanki", ne: "कलंकी", title: "Writing" },
  { id: "airport", place: "Airport", ne: "विमानस्थल", title: "Get in touch" },
] as const;

export type StopId = (typeof STOPS)[number]["id"];

export const UNLOCK_EVENT = "tempo-unlock";
export const UNLOCK_KEY = "tempo.unlocked";

export function readUnlocked(): StopId[] {
  try {
    const raw = localStorage.getItem(UNLOCK_KEY);
    return raw ? (JSON.parse(raw) as StopId[]) : [];
  } catch {
    return [];
  }
}

export function unlock(ids: StopId[]) {
  const next = Array.from(new Set([...readUnlocked(), ...ids]));
  try {
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — still unlock for this visit */
  }
  window.dispatchEvent(new CustomEvent(UNLOCK_EVENT, { detail: ids }));
}
