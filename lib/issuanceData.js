// Issuance & Receiving log — every stock movement into or out of a unit,
// separate from patient-facing dispensing but built on the same
// brand/MOU vocabulary so the two logs stay consistent and traceable
// against each other.

import { DRUG_BRANDS } from "./dispensingData";

export const MOVEMENT_TYPES = ["Issuance", "Receiving"];

export const DESTINATIONS = [
  "GOPD Pharmacy", "NHIS Pharmacy", "Theatre Pharmacy", "O&G Pharmacy",
  "Paediatric", "Renal", "A&E", "In-Patient", "Bulk Store",
];

export const SOURCES_FOR_RECEIVING = [...DRUG_BRANDS, "Central Store Transfer"];

export const MOVEMENT_STAFF_LIST = ["Pharm. O. Dada", "Pharm. C. Eze", "Pharm. N. Bello", "Store Officer A. Musa"];

export const SEED_MOVEMENTS = [
  {
    id: "MOV-3001", date: "2026-08-20", type: "Issuance", item: "Ceftriaxone 1g Vial", quantity: 40, unitOfMeasure: "vials",
    brand: "Grinvision", batch: "CFX-2301", expiry: "06/2026", unitCost: 900, source: "Bulk Store", destination: "Theatre Pharmacy",
    staff: "Store Officer A. Musa", authorization: "REQ-3302", notes: "Routine theatre restock.",
  },
  {
    id: "MOV-3002", date: "2026-08-19", type: "Receiving", item: "Amoxicillin 500mg", quantity: 2000, unitOfMeasure: "tablets",
    brand: "Emzor", batch: "AMX-2402", expiry: "08/2026", unitCost: 150, source: "Emzor", destination: "Bulk Store",
    staff: "Store Officer A. Musa", authorization: "GRN-771", notes: "Scheduled quarterly supply.",
  },
  {
    id: "MOV-3003", date: "2026-08-18", type: "Issuance", item: "Oxytocin 10 IU", quantity: 60, unitOfMeasure: "ampoules",
    brand: "Emzor", batch: "OXY-2312", expiry: "09/2026", unitCost: 160, source: "Bulk Store", destination: "O&G Pharmacy",
    staff: "Store Officer A. Musa", authorization: "REQ-3304", notes: "",
  },
  {
    id: "MOV-3004", date: "2026-08-17", type: "Receiving", item: "Warfarin 5mg", quantity: 300, unitOfMeasure: "tablets",
    brand: "DRF", batch: "WFR-2311", expiry: "03/2027", unitCost: 30, source: "DRF", destination: "Bulk Store",
    staff: "Store Officer A. Musa", authorization: "GRN-773", notes: "Invoice quantity mismatch — see Reconciliation.",
  },
  {
    id: "MOV-3005", date: "2026-08-16", type: "Issuance", item: "Salbutamol Inhaler", quantity: 5, unitOfMeasure: "inhalers",
    brand: "Kodesh", batch: "SLB-2401", expiry: "09/2026", unitCost: 1200, source: "Bulk Store", destination: "GOPD Pharmacy",
    staff: "Store Officer A. Musa", authorization: "REQ-3305", notes: "Unusually low quantity requested.",
  },
];

export function filterMovements(movements, filters) {
  return movements.filter((m) => {
    if (filters.dateFrom && m.date < filters.dateFrom) return false;
    if (filters.dateTo && m.date > filters.dateTo) return false;
    if (filters.type && filters.type !== "All" && m.type !== filters.type) return false;
    if (filters.brand && filters.brand !== "All" && m.brand !== filters.brand) return false;
    if (filters.destination && filters.destination !== "All" && m.destination !== filters.destination) return false;
    if (filters.item) {
      const q = filters.item.toLowerCase();
      if (!m.item.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function sortMovements(movements, sortBy) {
  const rows = [...movements];
  switch (sortBy) {
    case "date-asc": return rows.sort((a, b) => a.date.localeCompare(b.date));
    case "item": return rows.sort((a, b) => a.item.localeCompare(b.item));
    case "quantity-desc": return rows.sort((a, b) => b.quantity - a.quantity);
    case "value-desc": return rows.sort((a, b) => (b.quantity * b.unitCost) - (a.quantity * a.unitCost));
    case "date-desc":
    default: return rows.sort((a, b) => b.date.localeCompare(a.date));
  }
}

export function nextMovementId(existing) {
  const nums = existing.map((m) => parseInt(m.id.replace("MOV-", ""), 10)).filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 3005) + 1;
  return `MOV-${next}`;
}
