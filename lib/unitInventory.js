import { INVENTORY_ITEMS } from "./miscData";

export const UNITS = [
  "GOPD Pharmacy", "NHIS Pharmacy", "Theatre Pharmacy", "O&G Pharmacy",
  "Paediatric", "Renal", "A&E", "In-Patient",
];

// Relative size/throughput of each unit vs GOPD (the largest, baseline = 1).
// Purely illustrative — scales each unit's own formulary up/down rather
// than maintaining a fully separate stock-figure dataset for each.
const UNIT_FACTORS = {
  "GOPD Pharmacy": 1,
  "NHIS Pharmacy": 0.85,
  "Theatre Pharmacy": 0.45,
  "O&G Pharmacy": 0.5,
  "Paediatric": 0.35,
  "Renal": 0.3,
  "A&E": 0.6,
  "In-Patient": 0.75,
};

// Which medicines each unit actually stocks — a hospital pharmacy doesn't
// carry the full house formulary everywhere; each unit's list reflects what
// its patients and procedures realistically need.
const UNIT_FORMULARY = {
  "GOPD Pharmacy": [
    "Amoxicillin 500mg", "Ciprofloxacin 500mg", "Metformin 1000mg", "Gliclazide 80mg",
    "Amlodipine 5mg", "Nifedipine 10mg", "Bisoprolol 5mg", "Atorvastatin 20mg",
    "Lisinopril 10mg", "Salbutamol Inhaler", "Ferrous Sulfate 200mg",
  ],
  "NHIS Pharmacy": [
    "Metformin 1000mg", "Gliclazide 80mg", "Atorvastatin 20mg", "Amlodipine 5mg",
    "Bisoprolol 5mg", "Lisinopril 10mg", "Furosemide 20mg", "Citalopram 40mg", "Warfarin 5mg",
  ],
  "Theatre Pharmacy": [
    "Ceftriaxone 1g Vial", "Cefuroxime 1.5g", "Ondansetron 4mg", "Oxytocin 10 IU",
  ],
  "O&G Pharmacy": [
    "Oxytocin 10 IU", "Ferrous Sulfate 200mg", "Prenatal Multivitamin",
    "Antenatal Multivitamin", "Ceftriaxone 1g Vial",
  ],
  "Paediatric": [
    "Amoxicillin 500mg", "Salbutamol Inhaler", "Ondansetron 4mg", "Ceftriaxone 1g Vial",
  ],
  "Renal": [
    "Furosemide 20mg", "Amlodipine 5mg", "Bisoprolol 5mg", "Insulin Glargine", "Warfarin 5mg",
  ],
  "A&E": [
    "Ceftriaxone 1g Vial", "Ondansetron 4mg", "Furosemide 20mg", "Salbutamol Inhaler",
    "Warfarin 5mg", "Ciprofloxacin 500mg",
  ],
  "In-Patient": [
    "Ceftriaxone 1g Vial", "Warfarin 5mg", "Insulin Glargine", "Furosemide 20mg",
    "Amoxicillin 500mg", "Metformin 1000mg", "Citalopram 40mg", "Lisinopril 10mg",
  ],
};

function scale(value, factor, min = 0) {
  return Math.max(min, Math.round(value * factor));
}

export function getUnitInventory(unit) {
  const factor = UNIT_FACTORS[unit] ?? 1;
  const allowedNames = UNIT_FORMULARY[unit];
  const items = allowedNames
    ? INVENTORY_ITEMS.filter((item) => allowedNames.includes(item.name))
    : INVENTORY_ITEMS;

  return items.map((item) => ({
    ...item,
    stock: scale(item.stock, factor),
    reorderPoint: scale(item.reorderPoint, factor, 1),
    amc: scale(item.amc, factor, 1),
    minStock: scale(item.minStock, factor, 1),
    maxStock: scale(item.maxStock, factor, 1),
    forecast: item.forecast.map((v) => scale(v, factor)),
  }));
}

// Dynamic risk, derived from stock vs reorder level rather than a static
// label — stays correct no matter which unit's scaled stock is being shown.
export function computeRisk(item) {
  if (item.stock <= 0) return "High";
  if (item.stock < item.reorderPoint * 0.6) return "High";
  if (item.stock < item.reorderPoint) return "Medium";
  return "Low";
}
