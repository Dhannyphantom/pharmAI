import { INVENTORY_ITEMS } from "./miscData";

export const UNITS = [
  "GOPD Pharmacy", "NHIS Pharmacy", "Theatre Pharmacy", "O&G Pharmacy",
  "Paediatric", "Renal", "A&E", "In-Patient",
];

// Relative size/throughput of each unit vs GOPD (the largest, baseline = 1).
// Purely illustrative — scales the same base formulary up/down per unit
// rather than maintaining a fully separate catalog for each.
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

function scale(value, factor, min = 0) {
  return Math.max(min, Math.round(value * factor));
}

export function getUnitInventory(unit) {
  const factor = UNIT_FACTORS[unit] ?? 1;
  return INVENTORY_ITEMS.map((item) => ({
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
