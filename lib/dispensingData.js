// Dispensing Log v2 — the digital replacement for the manual dispensing
// register. One transaction can carry several line items for the same
// patient (each with its own quantity/brand/batch/price), every
// transaction is recorded regardless of payment status, and the MOU/Brand
// Distribution analytics are computed live from whatever transaction set
// is passed in — so they always reflect the caller's current filters.

import { estimateUnitPrice } from "./pricing";

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

export const PAYMENT_STATUSES = ["Paid", "Unpaid", "Partial"];

export const PAYMENT_STATUS_STYLE = {
  Paid: "text-mint bg-mint/10 border-mint/30",
  Unpaid: "text-danger bg-danger/10 border-danger/30",
  Partial: "text-warn bg-warn/10 border-warn/30",
};

export const DISPENSING_UNITS = [
  "GOPD Pharmacy", "NHIS Pharmacy", "Theatre Pharmacy", "O&G Pharmacy",
  "Paediatric", "Renal", "A&E", "In-Patient",
];

export const STAFF_LIST = ["Pharm. O. Dada", "Pharm. C. Eze", "Pharm. N. Bello"];

// A small fixed "which brand is normally preferred/in stock" table, standing
// in for an AI reading current unit/central stock levels and lead times to
// recommend the most sensible brand to dispense right now. It is only ever
// a *suggestion* — the field next to it is a plain dropdown the pharmacist
// can switch at any time, for any item.
const PREFERRED_BRAND_BY_DRUG = {
  amoxicillin: "Emzor",
  ceftriaxone: "Grinvision",
  warfarin: "DRF",
  metformin: "DBase",
  ciprofloxacin: "Kodesh",
  "ferrous sulfate": "Bakangizo",
  paracetamol: "Emzor",
  ondansetron: "Kodesh",
  gliclazide: "DBase",
  atorvastatin: "Emzor",
};

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// "AI Suggested" brand for a given drug name. Always overridable via the
// normal brand dropdown right beside it.
export function suggestBrand(drugName) {
  const key = (drugName || "").trim().toLowerCase();
  const match = Object.keys(PREFERRED_BRAND_BY_DRUG).find((k) => key.includes(k));
  if (match) return PREFERRED_BRAND_BY_DRUG[match];
  if (!key) return DRUG_BRANDS[0];
  const branded = DRUG_BRANDS.slice(0, -1);
  return branded[hashString(key) % branded.length];
}

export function computeTransactionTotal(txn) {
  return txn.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
}

export function flattenToItemRows(transactions) {
  const rows = [];
  transactions.forEach((txn) => {
    txn.items.forEach((it, idx) => {
      rows.push({
        rowId: `${txn.id}-${idx}`,
        txnId: txn.id,
        date: txn.date,
        time: txn.time,
        patient: txn.patient,
        pid: txn.pid,
        unit: txn.unit,
        staff: txn.staff,
        paymentStatus: txn.paymentStatus,
        billingRef: txn.billingRef,
        ...it,
        lineTotal: it.quantity * it.unitPrice,
      });
    });
  });
  return rows;
}

export function filterTransactions(transactions, filters) {
  return transactions.filter((txn) => {
    if (filters.dateFrom && txn.date < filters.dateFrom) return false;
    if (filters.dateTo && txn.date > filters.dateTo) return false;
    if (filters.patient) {
      const q = filters.patient.toLowerCase();
      if (!txn.patient.toLowerCase().includes(q) && !txn.pid.toLowerCase().includes(q)) return false;
    }
    if (filters.unit && filters.unit !== "All" && txn.unit !== filters.unit) return false;
    if (filters.staff && filters.staff !== "All" && txn.staff !== filters.staff) return false;
    if (filters.paymentStatus && filters.paymentStatus !== "All" && txn.paymentStatus !== filters.paymentStatus) return false;
    if (filters.drug) {
      const q = filters.drug.toLowerCase();
      if (!txn.items.some((it) => it.drug.toLowerCase().includes(q))) return false;
    }
    if (filters.brand && filters.brand !== "All") {
      if (!txn.items.some((it) => it.brand === filters.brand)) return false;
    }
    if (filters.batch) {
      const q = filters.batch.toLowerCase();
      if (!txn.items.some((it) => (it.batch || "").toLowerCase().includes(q))) return false;
    }
    return true;
  });
}

export function sortTransactions(transactions, sortBy) {
  const rows = [...transactions];
  switch (sortBy) {
    case "date-asc": return rows.sort((a, b) => a.date.localeCompare(b.date));
    case "patient": return rows.sort((a, b) => a.patient.localeCompare(b.patient));
    case "amount-desc": return rows.sort((a, b) => computeTransactionTotal(b) - computeTransactionTotal(a));
    case "amount-asc": return rows.sort((a, b) => computeTransactionTotal(a) - computeTransactionTotal(b));
    case "unit": return rows.sort((a, b) => a.unit.localeCompare(b.unit));
    case "payment": return rows.sort((a, b) => a.paymentStatus.localeCompare(b.paymentStatus));
    case "date-desc":
    default: return rows.sort((a, b) => b.date.localeCompare(a.date));
  }
}

export function sortItemRows(rows, sortBy) {
  const list = [...rows];
  switch (sortBy) {
    case "date-asc": return list.sort((a, b) => a.date.localeCompare(b.date));
    case "patient": return list.sort((a, b) => a.patient.localeCompare(b.patient));
    case "drug": return list.sort((a, b) => a.drug.localeCompare(b.drug));
    case "mou": return list.sort((a, b) => a.brand.localeCompare(b.brand));
    case "quantity-desc": return list.sort((a, b) => b.quantity - a.quantity);
    case "amount-desc": return list.sort((a, b) => b.lineTotal - a.lineTotal);
    case "payment": return list.sort((a, b) => a.paymentStatus.localeCompare(b.paymentStatus));
    case "unit": return list.sort((a, b) => a.unit.localeCompare(b.unit));
    case "date-desc":
    default: return list.sort((a, b) => b.date.localeCompare(a.date));
  }
}

// MOU/Brand distribution — always computed from whatever transaction set is
// passed in, so it reacts live to the caller's active filters (per the
// "GOPD + August + Ceftriaxone" example: pass in the already-filtered
// transactions and this reflects exactly that slice).
export function computeBrandDistribution(transactions) {
  const byBrand = {};
  transactions.forEach((txn) => {
    txn.items.forEach((it) => {
      const value = it.quantity * it.unitPrice;
      const paidShare = txn.paymentStatus === "Paid" ? value : txn.paymentStatus === "Partial" ? value * 0.5 : 0;
      if (!byBrand[it.brand]) {
        byBrand[it.brand] = { brand: it.brand, transactions: new Set(), items: 0, quantity: 0, value: 0, paid: 0, unpaidTxns: new Set() };
      }
      const b = byBrand[it.brand];
      b.transactions.add(txn.id);
      b.items += 1;
      b.quantity += it.quantity;
      b.value += value;
      b.paid += paidShare;
      if (txn.paymentStatus !== "Paid") b.unpaidTxns.add(txn.id);
    });
  });

  const totalValue = Object.values(byBrand).reduce((s, b) => s + b.value, 0);

  return Object.values(byBrand)
    .map((b) => ({
      brand: b.brand,
      transactions: b.transactions.size,
      items: b.items,
      quantity: b.quantity,
      value: Math.round(b.value),
      paid: Math.round(b.paid),
      unpaid: Math.round(b.value - b.paid),
      unpaidTransactions: b.unpaidTxns.size,
      percentOfTotal: totalValue > 0 ? Math.round((b.value / totalValue) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

function makeItem({ drug, quantity, brand, batch, unitPrice }) {
  return {
    drug,
    quantity,
    unit: "units",
    brand: brand || suggestBrand(drug),
    batch: batch || "—",
    unitPrice: unitPrice ?? estimateUnitPrice(drug),
  };
}

// Seed transactions — illustrative only, multi-item, mixed payment status,
// spanning several units and brands so the filters/analytics have
// something real to demonstrate against.
export const SEED_TRANSACTIONS = [
  {
    id: "DISP-00120", date: "2026-08-20", time: "09:14", patient: "Mrs. A.B", pid: "PID-20140",
    unit: "GOPD Pharmacy", staff: "Pharm. O. Dada", paymentStatus: "Unpaid", billingRef: "RCT-2214",
    items: [
      makeItem({ drug: "Ciprofloxacin 500mg", quantity: 14, brand: "Kodesh" }),
      makeItem({ drug: "Nifedipine 10mg", quantity: 30, brand: "DBase" }),
    ],
  },
  {
    id: "DISP-00121", date: "2026-08-20", time: "10:02", patient: "Mr. T.A", pid: "PID-20141",
    unit: "NHIS Pharmacy", staff: "Pharm. C. Eze", paymentStatus: "Partial", billingRef: "RCT-2219",
    items: [
      makeItem({ drug: "Metformin 1000mg", quantity: 60, brand: "DBase" }),
      makeItem({ drug: "Gliclazide 80mg", quantity: 30, brand: "DBase" }),
    ],
  },
  {
    id: "DISP-00122", date: "2026-08-19", time: "14:41", patient: "Mrs. C.O", pid: "PID-20142",
    unit: "GOPD Pharmacy", staff: "Pharm. O. Dada", paymentStatus: "Unpaid", billingRef: "RCT-2225",
    items: [
      makeItem({ drug: "Ciprofloxacin 500mg", quantity: 14, brand: "Kodesh" }),
      makeItem({ drug: "Ferrous Sulfate 200mg", quantity: 30, brand: "Bakangizo" }),
    ],
  },
  {
    id: "DISP-00123", date: "2026-08-19", time: "16:08", patient: "Mrs. G.E", pid: "PID-20143",
    unit: "Theatre Pharmacy", staff: "Pharm. N. Bello", paymentStatus: "Paid", billingRef: "RCT-2230",
    items: [
      makeItem({ drug: "Ondansetron 8mg", quantity: 6, brand: "Kodesh" }),
    ],
  },
  {
    id: "DISP-00124", date: "2026-08-18", time: "11:23", patient: "Mrs. N.C", pid: "PID-20144",
    unit: "O&G Pharmacy", staff: "Pharm. C. Eze", paymentStatus: "Unpaid", billingRef: "RCT-2233",
    items: [
      makeItem({ drug: "Ceftriaxone 1g", quantity: 1, brand: "Grinvision" }),
    ],
  },
  {
    id: "DISP-00125", date: "2026-08-18", time: "08:55", patient: "Mrs. A.B", pid: "PID-20140",
    unit: "GOPD Pharmacy", staff: "Pharm. O. Dada", paymentStatus: "Paid", billingRef: "RCT-2201",
    items: [
      makeItem({ drug: "Warfarin 5mg", quantity: 28, brand: "DRF" }),
    ],
  },
];

export function nextTransactionId(existing) {
  const nums = existing.map((t) => parseInt(t.id.replace("DISP-", ""), 10)).filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 20125) + 1;
  return `DISP-${next}`;
}
