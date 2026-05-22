// Nepali profanity wordlists used by the leaderboard name filter.
// Lists are intentionally minimal — false positives matter on a short
// 3–12 char name field (e.g. "randhir" should not match "randi").
// Edit freely; the matcher rebuilds on next deploy.

// Roman-Nepali roots. The English transformer pipeline (leet, skip
// non-alphabetic, collapse duplicates, lowercase) is applied to these
// at match time, so "r4ndi", "r.a.n.d.i", "RANDII" all hit "randi".
export const ROMAN_NEPALI_ROOTS: string[] = [
  "randi",
  "randee",
  "muji",
  "mujee",
  "chikne",
  "chikney",
  "chikeko",
  "chikera",
  "puti",
  "putti",
  "lado",
  "laado",
  "lawda",
  "bhalu",
  "bhaalu",
  "kuiri",
  "gandu",
  "gaandu",
  "chutiya",
  "chutiyaa",
  "madarchod",
  "madharchod",
  "bhenchod",
  "behenchod",
  "bhosdike",
  "bhosadi",
  "harami",
  "haraami",
  "kanjar",
  "kameena",
  "kamina",
  "saala",
  "saale",
];

// Short Roman acronyms commonly used as slurs. Kept separate because
// they need a different match policy — exact-token only, no substring
// (otherwise "mc" inside a benign name like "mcray" would match).
export const ROMAN_NEPALI_ACRONYMS: string[] = [
  "mc",
  "bc",
  "mcbc",
  "bcmc",
  "bsdk",
  "mkc",
];

// Devanagari roots. Matched literally as substrings — the script has
// no useful leet equivalent and the dataset is small.
export const DEVANAGARI_ROOTS: string[] = [
  "रॉंडी",
  "रांडी",
  "रंडी",
  "मुजी",
  "चिक्ने",
  "चिकेको",
  "पुती",
  "लाडो",
  "भालु",
  "गाण्डु",
  "चुतिया",
  "चूतिया",
  "मादरचोद",
  "बहनचोद",
  "भोसडीके",
  "हरामी",
  "कमीना",
  "साला",
  "वेश्या",
];
