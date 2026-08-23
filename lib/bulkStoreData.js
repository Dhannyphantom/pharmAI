export const EXPIRY_ITEMS = [
  { name: "Ceftriaxone 1g Vial", batch: "CFX-2301", qty: 60, expiry: "06/2026", daysToExpiry: 34 },
  { name: "Insulin Glargine", batch: "INS-2405", qty: 145, expiry: "01/2026", daysToExpiry: -9 },
  { name: "Oxytocin 10 IU", batch: "OXY-2312", qty: 210, expiry: "09/2026", daysToExpiry: 126 },
  { name: "Amoxicillin 500mg", batch: "AMX-2402", qty: 1240, expiry: "08/2026", daysToExpiry: 95 },
  { name: "Warfarin 5mg", batch: "WFR-2311", qty: 310, expiry: "03/2027", daysToExpiry: 233 },
  { name: "Ondansetron 4mg", batch: "OND-2401", qty: 90, expiry: "02/2026", daysToExpiry: 22 },
];

export function expiryRisk(days) {
  if (days < 0) return "Expired";
  if (days <= 30) return "Critical";
  if (days <= 90) return "Warning";
  return "OK";
}

export const REQUISITIONS = [
  { id: "REQ-3301", department: "GOPD Pharmacy", item: "Amoxicillin 500mg", qtyRequested: 500, typicalQty: 450 },
  { id: "REQ-3302", department: "Theatre Pharmacy", item: "Ceftriaxone 1g Vial", qtyRequested: 40, typicalQty: 40 },
  { id: "REQ-3303", department: "NHIS Pharmacy", item: "Warfarin 5mg", qtyRequested: 900, typicalQty: 200 },
  { id: "REQ-3304", department: "O&G Pharmacy", item: "Oxytocin 10 IU", qtyRequested: 60, typicalQty: 55 },
  { id: "REQ-3305", department: "GOPD Pharmacy", item: "Salbutamol Inhaler", qtyRequested: 5, typicalQty: 60 },
];

export function requisitionFlag(qty, typical) {
  const ratio = qty / typical;
  if (ratio >= 2 || ratio <= 0.25) return "Unusual";
  return "Normal";
}

export const STOCK_VARIANCE = [
  { item: "Amoxicillin 500mg", physical: 1240, emr: 1240, expected: 1240 },
  { item: "Warfarin 5mg", physical: 292, emr: 310, expected: 305 },
  { item: "Ceftriaxone 1g Vial", physical: 54, emr: 60, expected: 58 },
  { item: "Insulin Glargine", physical: 145, emr: 145, expected: 148 },
  { item: "Salbutamol Inhaler", physical: 380, emr: 410, expected: 405 },
];

export function varianceOf(row) {
  return row.physical - row.emr;
}

export const RECEIVING_RECORDS = [
  { id: "GRN-771", item: "Amoxicillin 500mg", ordered: 600, invoiced: 600, delivered: 600 },
  { id: "GRN-772", item: "Ceftriaxone 1g Vial", ordered: 100, invoiced: 100, delivered: 88 },
  { id: "GRN-773", item: "Warfarin 5mg", ordered: 300, invoiced: 280, delivered: 300 },
  { id: "GRN-774", item: "Insulin Glargine", ordered: 150, invoiced: 150, delivered: 150 },
];

// Central Bulk Store stock levels, used to compare against unit-level stock
// (see lib/miscData.js INVENTORY_ITEMS) — powers the inventory nudge shown
// in the patient workflow and the requisition tools. Includes LMIS fields
// (amc, reorderPoint/ROL, min/max stock, lead time) alongside unit stock.
export const CENTRAL_STOCK = [
  { name: "Amoxicillin 500mg", qty: 8200, reorderPoint: 3000, amc: 6000, minStock: 1500, maxStock: 12000, leadTimeDays: 21 },
  { name: "Warfarin 5mg", qty: 640, reorderPoint: 600, amc: 1100, minStock: 400, maxStock: 2200, leadTimeDays: 18 },
  { name: "Metformin 1000mg", qty: 5100, reorderPoint: 2500, amc: 4200, minStock: 1200, maxStock: 8000, leadTimeDays: 21 },
  { name: "Insulin Glargine", qty: 90, reorderPoint: 400, amc: 520, minStock: 250, maxStock: 1200, leadTimeDays: 30 },
  { name: "Ceftriaxone 1g Vial", qty: 210, reorderPoint: 500, amc: 480, minStock: 250, maxStock: 1200, leadTimeDays: 21 },
  { name: "Salbutamol Inhaler", qty: 1800, reorderPoint: 800, amc: 1500, minStock: 500, maxStock: 3500, leadTimeDays: 21 },
  { name: "Oxytocin 10 IU", qty: 1200, reorderPoint: 500, amc: 900, minStock: 300, maxStock: 2500, leadTimeDays: 18 },
  { name: "Ondansetron 4mg", qty: 60, reorderPoint: 300, amc: 340, minStock: 150, maxStock: 900, leadTimeDays: 21 },
  { name: "Bisoprolol 5mg", qty: 2400, reorderPoint: 1200, amc: 1900, minStock: 600, maxStock: 4500, leadTimeDays: 18 },
  { name: "Amlodipine 5mg", qty: 3100, reorderPoint: 1400, amc: 2200, minStock: 700, maxStock: 5000, leadTimeDays: 18 },
  { name: "Nifedipine 10mg", qty: 380, reorderPoint: 450, amc: 650, minStock: 300, maxStock: 1600, leadTimeDays: 21 },
  { name: "Atorvastatin 20mg", qty: 3800, reorderPoint: 1600, amc: 2400, minStock: 800, maxStock: 5500, leadTimeDays: 18 },
  { name: "Gliclazide 80mg", qty: 1500, reorderPoint: 1000, amc: 1450, minStock: 500, maxStock: 3500, leadTimeDays: 18 },
  { name: "Citalopram 40mg", qty: 1050, reorderPoint: 800, amc: 1100, minStock: 400, maxStock: 2800, leadTimeDays: 21 },
  { name: "Lisinopril 10mg", qty: 1900, reorderPoint: 1200, amc: 1750, minStock: 600, maxStock: 4200, leadTimeDays: 18 },
  { name: "Furosemide 20mg", qty: 880, reorderPoint: 900, amc: 1250, minStock: 450, maxStock: 3000, leadTimeDays: 18 },
  { name: "Ciprofloxacin 500mg", qty: 420, reorderPoint: 600, amc: 890, minStock: 300, maxStock: 2400, leadTimeDays: 14 },
  { name: "Prenatal Multivitamin", qty: 1400, reorderPoint: 800, amc: 1180, minStock: 400, maxStock: 3000, leadTimeDays: 21 },
  { name: "Antenatal Multivitamin", qty: 1350, reorderPoint: 800, amc: 1180, minStock: 400, maxStock: 3000, leadTimeDays: 21 },
  { name: "Ferrous Sulfate 200mg", qty: 2600, reorderPoint: 1200, amc: 1900, minStock: 600, maxStock: 4500, leadTimeDays: 18 },
  { name: "Cefuroxime 1.5g", qty: 340, reorderPoint: 200, amc: 260, minStock: 120, maxStock: 900, leadTimeDays: 14 },
];

export function centralStockFor(name) {
  return CENTRAL_STOCK.find((c) => name.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(name.toLowerCase()));
}

function genericRisk(stock, reorderPoint) {
  if (stock <= 0) return "High";
  if (stock < reorderPoint * 0.6) return "High";
  if (stock < reorderPoint) return "Medium";
  return "Low";
}

// Central Bulk Store, reshaped into the same item shape the unit-level
// inventory views use (stock/expiry/forecast), so "Central Store" can be
// selected as just another location in the Unit Forecast dropdown. There's
// no real per-batch expiry or consumption history at this aggregate level,
// so expiry is shown as "—" and a mild synthetic variation around AMC
// stands in for a forecast history (flagged nowhere as real batch data).
export function getCentralStoreAsUnitItems() {
  return CENTRAL_STOCK.map((c) => {
    const amc = c.amc || 0;
    const forecast = [0.88, 0.94, 1, 1.04, 0.98, 1.02].map((f) => Math.round(amc * f));
    return {
      name: c.name,
      stock: c.qty,
      reorderPoint: c.reorderPoint,
      expiry: "—",
      forecast,
      risk: genericRisk(c.qty, c.reorderPoint),
      amc: c.amc,
      minStock: c.minStock,
      maxStock: c.maxStock,
      leadTimeDays: c.leadTimeDays,
    };
  });
}
