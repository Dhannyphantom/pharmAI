// Seed data and helpers for the Documentation & Records module — tackles
// the cumbersome manual paperwork side of pharmacy practice by giving
// pharmacists a fast structured entry form plus (in Live AI Mode) an
// AI-assisted expansion from short bullet notes into a properly worded
// record. Entries are session-only (no backend) — this demonstrates the
// workflow rather than persisting real records.

export const RECORD_TYPES = [
  "Clinical Intervention",
  "Dispensing Note",
  "Counselling Note",
  "Incident Report",
  "Stock Discrepancy Note",
];

export const RECORD_TYPE_STYLE = {
  "Clinical Intervention": "text-ai-cyan bg-ai-cyan/10 border-ai-cyan/30",
  "Dispensing Note": "text-mint bg-mint/10 border-mint/30",
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
    type: "Dispensing Note",
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

// Brand/manufacturer (marketing authorization holder) options for the
// Dispensing Log — the same generic medicine is often stocked under
// several different brands, and tracking which one was actually handed
// to a patient matters for substitution tracking, ADR-by-brand signals,
// and stock reconciliation.
export const DRUG_BRANDS = ["Emzor", "Grinvision", "Bakangizo", "DBase", "Kodesh", "DRF", "Generic / Unbranded"];

export const BRAND_STYLE = {
  Emzor: "text-ai-cyan bg-ai-cyan/10 border-ai-cyan/30",
  Grinvision: "text-ai-violet bg-ai-violet/10 border-ai-violet/30",
  Bakangizo: "text-mint bg-mint/10 border-mint/30",
  DBase: "text-warn bg-warn/10 border-warn/30",
  Kodesh: "text-hospital-blue bg-hospital-blue/10 border-hospital-blue/30",
  DRF: "text-danger bg-danger/10 border-danger/30",
  "Generic / Unbranded": "text-slate-300 bg-white/10 border-white/20",
};

// A few pre-existing dispensing records so the log isn't empty on first
// load — illustrative only.
export const SEED_DISPENSING = [
  { id: "DSP-501", date: "2026-08-20", patient: "Mrs. A.B (PID-20140)", drug: "Warfarin 5mg", quantity: 28, brand: "DRF", batch: "WFR-2311", pharmacist: "Pharm. O. Dada" },
  { id: "DSP-502", date: "2026-08-20", patient: "Mr. T.A (PID-20141)", drug: "Atorvastatin 20mg", quantity: 30, brand: "Emzor", batch: "ATV-2402", pharmacist: "Pharm. C. Eze" },
  { id: "DSP-503", date: "2026-08-19", patient: "Mrs. C.O (PID-20142)", drug: "Ferrous Sulfate 200mg", quantity: 30, brand: "Bakangizo", batch: "FES-2405", pharmacist: "Pharm. O. Dada" },
  { id: "DSP-504", date: "2026-08-19", patient: "Mrs. G.E (PID-20143)", drug: "Ondansetron 4mg", quantity: 6, brand: "Kodesh", batch: "OND-2401", pharmacist: "Pharm. N. Bello" },
  { id: "DSP-505", date: "2026-08-18", patient: "Mrs. N.C (PID-20144)", drug: "Ceftriaxone 1g", quantity: 1, brand: "Grinvision", batch: "CFX-2301", pharmacist: "Pharm. C. Eze" },
  { id: "DSP-506", date: "2026-08-18", patient: "Mr. T.A (PID-20141)", drug: "Gliclazide 80mg", quantity: 30, brand: "DBase", batch: "GLZ-2403", pharmacist: "Pharm. N. Bello" },
];

// Tallies units dispensed per brand, for a quick "which MOU are we
// actually dispensing" view — useful for substitution tracking and
// brand-level ADR signal review.
export function computeBrandDistribution(dispensingLog) {
  const counts = {};
  dispensingLog.forEach((d) => {
    counts[d.brand] = (counts[d.brand] || 0) + d.quantity;
  });
  return DRUG_BRANDS
    .map((brand) => ({ brand, quantity: counts[brand] || 0 }))
    .filter((b) => b.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity);
}
