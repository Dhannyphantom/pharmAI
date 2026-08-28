// Illustrative per-unit prices (₦) for the Dispensing Log's value
// calculations. A handful of figures are derived from the existing billing
// seed data in lib/patients.js so totals stay roughly consistent with what
// the rest of the app already shows; anything not explicitly listed gets a
// stable, deterministic placeholder so totals are still sensible without
// needing a full price list.

const KNOWN_UNIT_PRICES = {
  "amoxicillin 500mg": 150,
  "warfarin 5mg": 30,
  "ciprofloxacin 500mg": 150,
  "nifedipine 10mg": 30,
  "metformin 1000mg": 20,
  "ceftriaxone 1g": 900,
  "citalopram 40mg": 30,
  "ferrous sulfate 200mg": 15,
  "antenatal multivitamin": 12,
  "prenatal multivitamin": 12,
  "ondansetron 8mg": 533,
  "ondansetron 4mg": 267,
  "gliclazide 80mg": 20,
  "atorvastatin 20mg": 25,
  "bisoprolol 5mg": 18,
  "amlodipine 5mg": 22,
  "lisinopril 10mg": 20,
  "furosemide 20mg": 16,
  "salbutamol inhaler": 1200,
  "insulin glargine": 3500,
  "cefuroxime 1.5g": 1800,
  "oxytocin 10 iu": 160,
};

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function estimateUnitPrice(drugName) {
  const key = (drugName || "").trim().toLowerCase();
  if (KNOWN_UNIT_PRICES[key]) return KNOWN_UNIT_PRICES[key];
  const partial = Object.keys(KNOWN_UNIT_PRICES).find((k) => key.includes(k) || k.includes(key));
  if (partial) return KNOWN_UNIT_PRICES[partial];
  // Stable placeholder so repeated lookups for the same unseeded drug name
  // return a consistent (not random-each-render) illustrative price.
  return 20 + (hashString(key) % 480);
}
