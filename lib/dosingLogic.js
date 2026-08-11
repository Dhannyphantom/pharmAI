// Cockcroft-Gault creatinine clearance calculation and simplified
// educational dose-banding tables for common renally-cleared drugs.

export function calculateCrCl({ age, weightKg, scrMgDl, sex }) {
  if (!age || !weightKg || !scrMgDl) return null;
  const sexFactor = sex === "Female" ? 0.85 : 1;
  const crcl = ((140 - age) * weightKg * sexFactor) / (72 * scrMgDl);
  return Math.max(0, Math.round(crcl * 10) / 10);
}

export function getRenalBand(crcl) {
  if (crcl >= 50) return { band: "Normal / Mild Impairment", key: "normal", color: "mint" };
  if (crcl >= 30) return { band: "Moderate Impairment", key: "moderate", color: "warn" };
  if (crcl >= 10) return { band: "Severe Impairment", key: "severe", color: "danger" };
  return { band: "Kidney Failure / Dialysis Range", key: "failure", color: "danger" };
}

export const DOSE_TABLE = {
  Gentamicin: {
    normal: "5-7 mg/kg once daily (extended-interval dosing), monitor levels",
    moderate: "5-7 mg/kg, extend interval to every 24-36h based on levels",
    severe: "Reduce dose and extend interval to every 48h; levels essential",
    failure: "Avoid if possible; if essential, dose strictly by levels only",
  },
  Vancomycin: {
    normal: "15-20 mg/kg every 8-12h, guided by trough/AUC monitoring",
    moderate: "15-20 mg/kg, extend interval to every 12-24h",
    severe: "Loading dose then redose based on levels, interval often 24-48h",
    failure: "Single loading dose, redose guided entirely by levels/dialysis schedule",
  },
  Cefepime: {
    normal: "1-2 g every 8-12h",
    moderate: "1-2 g every 12-24h",
    severe: "1 g every 24h",
    failure: "500 mg every 24h, dose after dialysis on dialysis days",
  },
  Enoxaparin: {
    normal: "1 mg/kg every 12h (treatment) or 40 mg once daily (prophylaxis)",
    moderate: "Use with caution; consider 25% dose reduction, monitor anti-Xa if available",
    severe: "Reduce to 1 mg/kg once daily (treatment dosing) — CrCl < 30 requires adjustment",
    failure: "Consider unfractionated heparin instead — anti-Xa monitoring strongly advised",
  },
  Metformin: {
    normal: "Up to 2000 mg/day in divided doses",
    moderate: "Maximum 1000 mg/day; reassess risk/benefit at CrCl 30-45",
    severe: "Contraindicated below CrCl 30 — black box lactic acidosis risk",
    failure: "Contraindicated",
  },
};

export const RENAL_DRUGS = ["Gentamicin", "Vancomycin", "Cefepime", "Enoxaparin", "Metformin"];
