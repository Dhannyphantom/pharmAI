// Seed data and helpers for the Clinical Note / Records Log side of
// Documentation & Records. Dispensing transactions, brand/MOU data, and
// stock movements have their own dedicated modules (lib/dispensingData.js,
// lib/issuanceData.js) since they carry a different shape and purpose.

export const RECORD_TYPES = [
  "Clinical Intervention",
  "Counselling Note",
  "Incident Report",
  "Stock Discrepancy Note",
];

export const RECORD_TYPE_STYLE = {
  "Clinical Intervention": "text-ai-cyan bg-ai-cyan/10 border-ai-cyan/30",
  "Counselling Note": "text-ai-violet bg-ai-violet/10 border-ai-violet/30",
  "Incident Report": "text-danger bg-danger/10 border-danger/30",
  "Stock Discrepancy Note": "text-warn bg-warn/10 border-warn/30",
};

// A few pre-existing records so the log isn't empty on first load —
// illustrative only.
export const SEED_RECORDS = [
  {
    id: "REC-1001",
    type: "Clinical Intervention",
    patient: "Mrs. A.B (PID-20140)",
    pharmacist: "Pharm. O. Dada",
    date: "2026-08-20",
    summary: "Flagged warfarin-ciprofloxacin interaction to prescriber; nitrofurantoin substituted.",
    body: "On review of Mrs. A.B's chart, a major interaction was identified between her existing warfarin therapy and a newly prescribed course of ciprofloxacin. The prescriber was contacted and agreed to switch to nitrofurantoin, avoiding the interaction. An INR recheck was scheduled for later in the week as a precaution.",
  },
  {
    id: "REC-1002",
    type: "Incident Report",
    patient: "Mr. T.A (PID-20141)",
    pharmacist: "Pharm. C. Eze",
    date: "2026-08-19",
    summary: "Metformin withheld pending renal-adjusted alternative given eGFR 28.",
    body: "Metformin 1000mg BD was not dispensed as prescribed due to an eGFR of 28 mL/min/1.73m2, which falls below the recommended threshold. The prescriber was contacted for a renally-appropriate alternative before any dispensing occurred.",
  },
];

// Very lightweight structure used to turn terse bullet input into a
// consistently-formatted note when Live AI Mode is off (no API call).
export function buildTemplatedNote({ type, patient, bullets }) {
  const lines = bullets.split("\n").map((l) => l.trim()).filter(Boolean);
  const body = lines.map((l) => `- ${l}`).join("\n");
  return `${type}${patient ? ` — ${patient}` : ""}\n\n${body || "(no details entered)"}\n\nDocumented via PhantomAI structured entry — reviewed and confirmed accurate by the recording pharmacist.`;
}
