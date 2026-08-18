import { CASES } from "./cases";
import { getInteraction } from "./interactionData";
import { calculateCrCl, getRenalBand, DOSE_TABLE, RENAL_DRUGS } from "./dosingLogic";
import { detectDuplicates } from "./duplicateData";
import { checkDose } from "./doseCheck";
import { PHARMACOVIGILANCE_REPORTS, SIGNAL_CLUSTER, INVENTORY_ITEMS } from "./miscData";
import { CENTRAL_STOCK } from "./bulkStoreData";
import { computeLmis } from "./lmis";
import { findDrugByName } from "./counselingData";
import { THEATRE_REQUESTS } from "./theatreData";

function num(str) {
  if (str == null) return null;
  const m = String(str).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

// First word of a medication string ("Warfarin 5 mg once daily" -> "Warfarin").
function drugName(medString) {
  return medString.trim().split(/\s+/)[0].replace(/,$/, "");
}

// Extra new prescriptions layered on top of each case's single documented
// `newPrescription` — realistic multi-item requests including consumables,
// and (for Mrs. A.B) a deliberate therapeutic duplication against her
// existing Amlodipine, to demonstrate the duplicate-detection check.
const EXTRA_NEW_RX = {
  bello: [
    { drug: "Nifedipine", dose: "200mg", route: "Oral", frequency: "Once daily", dispensed: false },
    { drug: "IV Cannula", dose: "20G", route: "N/A", frequency: "For antibiotic administration", dispensed: false, consumable: true },
    { drug: "Normal Saline", dose: "1L", route: "IV", frequency: "As required", dispensed: false, consumable: true },
  ],
  adekunle: [
    { drug: "Glucometer Test Strips", dose: "Box of 50", route: "N/A", frequency: "For home monitoring", dispensed: false, consumable: true },
  ],
  okoye: [
    { drug: "Urine Dipstick Strips", dose: "Box of 25", route: "N/A", frequency: "For follow-up urinalysis", dispensed: false, consumable: true },
  ],
  eze: [
    { drug: "IV Cannula", dose: "22G", route: "N/A", frequency: "For antiemetic administration", dispensed: false, consumable: true },
    { drug: "Normal Saline", dose: "500mL", route: "IV", frequency: "As required", dispensed: false, consumable: true },
  ],
};

// Billing history — illustrative/simulated per patient. `unit` uses the
// hospital's standard department names so it can be filtered consistently.
const BILLING_BY_ID = {
  bello: [
    { date: "2026-08-01", unit: "A&E", item: "Initial assessment & triage fee", amount: 500, status: "Paid" },
    { date: "2026-08-03", unit: "In-Patient", item: "Ward admission fee (2 days)", amount: 4000, status: "Paid" },
    { date: "2026-08-12", unit: "GOPD Pharmacy", item: "Warfarin 5mg ×28", amount: 840, status: "Paid" },
    { date: "2026-08-14", unit: "GOPD Pharmacy", item: "Ciprofloxacin 500mg ×14", amount: 2100, status: "Pending" },
    { date: "2026-08-14", unit: "GOPD Pharmacy", item: "Nifedipine 10mg ×30", amount: 900, status: "Pending" },
    { date: "2026-08-14", unit: "In-Patient", item: "IV Cannula & consumables", amount: 1200, status: "Overdue" },
  ],
  adekunle: [
    { date: "2026-07-20", unit: "NHIS Pharmacy", item: "Atorvastatin 20mg ×30", amount: 750, status: "Paid" },
    { date: "2026-08-03", unit: "NHIS Pharmacy", item: "Gliclazide 80mg ×30", amount: 600, status: "Paid" },
    { date: "2026-08-10", unit: "Renal", item: "Renal function panel", amount: 3500, status: "Paid" },
    { date: "2026-08-14", unit: "NHIS Pharmacy", item: "Metformin 1000mg ×60", amount: 1200, status: "Pending" },
    { date: "2026-08-14", unit: "NHIS Pharmacy", item: "Glucometer test strips", amount: 2500, status: "Pending" },
  ],
  okoye: [
    { date: "2026-07-15", unit: "GOPD Pharmacy", item: "Ferrous Sulfate 200mg ×30", amount: 450, status: "Paid" },
    { date: "2026-08-01", unit: "GOPD Pharmacy", item: "Antenatal multivitamin ×30", amount: 350, status: "Paid" },
    { date: "2026-08-14", unit: "GOPD Pharmacy", item: "Ciprofloxacin 500mg ×14", amount: 2100, status: "Pending" },
    { date: "2026-08-14", unit: "GOPD Pharmacy", item: "Urine dipstick strips ×25", amount: 800, status: "Pending" },
  ],
  eze: [
    { date: "2026-08-08", unit: "Theatre", item: "Laparoscopic cholecystectomy — theatre fee", amount: 45000, status: "Paid" },
    { date: "2026-08-09", unit: "In-Patient", item: "Post-op ward stay (2 days)", amount: 8000, status: "Paid" },
    { date: "2026-08-10", unit: "Theatre Pharmacy", item: "Ondansetron 8mg ×6", amount: 3200, status: "Pending" },
    { date: "2026-08-11", unit: "NHIS Pharmacy", item: "Citalopram 40mg ×30", amount: 900, status: "Paid" },
    { date: "2026-08-11", unit: "In-Patient", item: "IV cannula & fluids", amount: 1500, status: "Overdue" },
  ],
  chukwu: [
    { date: "2026-07-10", unit: "O&G", item: "Antenatal booking & scan", amount: 6000, status: "Paid" },
    { date: "2026-08-05", unit: "O&G", item: "36-week antenatal review", amount: 3000, status: "Paid" },
    { date: "2026-08-13", unit: "O&G Pharmacy", item: "Ceftriaxone 1g (prophylaxis)", amount: 5400, status: "Pending" },
    { date: "2026-08-13", unit: "NHIS Pharmacy", item: "Antenatal multivitamin ×30", amount: 350, status: "Paid" },
    { date: "2026-08-13", unit: "Theatre", item: "Elective CS — theatre booking fee", amount: 60000, status: "Pending" },
  ],
};

const BASE_PATIENTS = CASES.map((c, i) => ({
  ...c,
  pid: `PID-${20140 + i}`,
  ward: i === 0 ? "Medical Ward B" : i === 1 ? "Medical Ward A" : i === 2 ? "Antenatal Ward" : "Surgical Ward",
  newPrescriptions: [
    { ...c.newPrescription, dispensed: false },
    ...(EXTRA_NEW_RX[c.id] || []),
  ],
  billingHistory: BILLING_BY_ID[c.id] || [],
  theatreRequestId: null,
}));

// A fifth, synthetic patient to demonstrate the Theatre linkage — tied to
// TR-503 (Elective Caesarean Section) already present in the theatre board.
const CHUKWU = {
  id: "chukwu",
  pid: "PID-20144",
  name: "Mrs. N.C",
  age: 31,
  sex: "Female",
  weight: "74 kg",
  height: "162 cm",
  ward: "Antenatal Ward",
  diagnosis: "Term pregnancy (39 weeks), elective repeat Caesarean section",
  pastMedicalHistory: ["Previous Caesarean section (2021)", "No other significant history"],
  currentMedications: ["Ferrous Sulfate 200mg once daily", "Antenatal multivitamin once daily"],
  newPrescriptions: [
    { drug: "Ceftriaxone", dose: "1g", route: "IV", frequency: "Single pre-operative dose", dispensed: false },
    { drug: "Spinal Anaesthesia Set", dose: "1 set", route: "N/A", frequency: "For theatre", dispensed: false, consumable: true },
    { drug: "Sterile Gauze Packs", dose: "6 packs", route: "N/A", frequency: "For theatre", dispensed: false, consumable: true },
  ],
  allergies: "No known drug allergies (NKDA)",
  pregnancyStatus: "Pregnant — 39 weeks gestation",
  vitals: { bp: "122/78 mmHg", hr: "84 bpm", rr: "16/min", temp: "36.9°C", spo2: "98%" },
  labs: {
    "Serum Creatinine": "0.7 mg/dL",
    "Creatinine Clearance": "98 mL/min",
    eGFR: ">90 mL/min/1.73m²",
    "Liver Function": "Within normal limits",
    "Blood Glucose": "5.4 mmol/L",
  },
  clinicalNotes: "Booked for elective repeat Caesarean section given previous CS. Pre-operative prophylactic antibiotic prescribed, pending theatre.",
  billingHistory: BILLING_BY_ID.chukwu,
  theatreRequestId: "TR-503",
};

export const PATIENTS = [...BASE_PATIENTS, CHUKWU];

export function getPatientByPid(pid) {
  return PATIENTS.find((p) => p.pid.toLowerCase() === pid.toLowerCase());
}

export function searchPatients(query) {
  const q = query.trim().toLowerCase();
  if (!q) return PATIENTS;
  return PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.pid.toLowerCase().includes(q) ||
      p.diagnosis.toLowerCase().includes(q)
  );
}

export function allMedications(patient) {
  return [...patient.currentMedications, ...patient.newPrescriptions.map((p) => `${p.drug} ${p.dose}`.trim())];
}

// Runs the same interaction/duplicate/renal/pharmacovigilance/inventory
// checks used by the standalone tools, scoped to this one patient.
export function getPatientAnalysis(patient) {
  const currentNames = patient.currentMedications.map(drugName);
  const newRxItems = patient.newPrescriptions.filter((p) => !p.consumable);
  const newDrugs = newRxItems.map((p) => p.drug);

  // 1. Interaction check — EVERY unique pair across the full medication
  // list (current-vs-current, current-vs-new, and new-vs-new), not just
  // new-vs-current. This is a supplementary, general-purpose check —
  // patients with a curated clinical case (patient.aiReport) also show
  // that more detailed, case-specific analysis alongside it.
  const allDrugs = [...new Set([...currentNames, ...newDrugs])];
  const interactions = [];
  for (let i = 0; i < allDrugs.length; i++) {
    for (let j = i + 1; j < allDrugs.length; j++) {
      const result = getInteraction(allDrugs[i], allDrugs[j]);
      if (result) {
        const involvesNew = newDrugs.includes(allDrugs[i]) || newDrugs.includes(allDrugs[j]);
        interactions.push({ pair: `${allDrugs[i]} + ${allDrugs[j]}`, involvesNew, ...result });
      }
    }
  }
  // Surface the clinically significant ones first.
  const severityRank = { Major: 0, Moderate: 1, Low: 2 };
  interactions.sort((a, b) => (severityRank[a.severity] ?? 3) - (severityRank[b.severity] ?? 3));

  // 2. Duplicate / same-class detection — each new prescription against the
  // full current medication list.
  const duplicateResults = newRxItems.map((p) =>
    detectDuplicates(patient.currentMedications.join("\n"), `${p.drug} ${p.dose}`)
  ).filter((r) => r.duplicates.length > 0);

  // 2b. Dose accuracy check — flags single/daily doses outside the typical
  // adult range for anything in the local dosing reference.
  const doseChecks = newRxItems
    .map((p) => {
      const result = checkDose(p.drug, p.dose, p.frequency);
      return result ? { drug: p.drug, dose: p.dose, frequency: p.frequency, ...result } : null;
    })
    .filter(Boolean);

  // 3. Renal function + dose banding. The chart's own recorded creatinine
  // clearance is treated as authoritative (it's what the rest of the chart's
  // narrative — e.g. "Do Not Dispense" calls — was based on); the
  // Cockcroft-Gault calculator is also run and shown alongside it as the
  // "live recalculation" a pharmacist would sanity-check it against.
  let renal = null;
  const scr = num(patient.labs?.["Serum Creatinine"]);
  const weightKg = num(patient.weight);
  const chartCrcl = num(patient.labs?.["Creatinine Clearance"]);
  if (chartCrcl !== null) {
    const calculatedCrcl = scr && weightKg && patient.age ? calculateCrCl({ age: patient.age, weightKg, scrMgDl: scr, sex: patient.sex }) : null;
    const band = getRenalBand(chartCrcl);
    const relevantDrugs = [...currentNames, ...newDrugs].filter((d) =>
      RENAL_DRUGS.some((rd) => rd.toLowerCase() === d.toLowerCase())
    );
    renal = {
      chartCrcl,
      calculatedCrcl,
      band,
      recommendations: [...new Set(relevantDrugs)].map((d) => ({
        drug: d,
        advice: DOSE_TABLE[RENAL_DRUGS.find((rd) => rd.toLowerCase() === d.toLowerCase())]?.[band.key],
      })),
    };
  }

  // 4. Pharmacovigilance signals relevant to this patient's own medications.
  const patientDrugs = [...currentNames, ...newDrugs].map((d) => d.toLowerCase());
  const relevantReports = PHARMACOVIGILANCE_REPORTS.filter((r) => patientDrugs.includes(r.drug.toLowerCase()));
  const relevantSignal = patientDrugs.includes(SIGNAL_CLUSTER.drug.toLowerCase()) ? SIGNAL_CLUSTER : null;

  // 5. Inventory — unit stock vs central store, with full LMIS analysis,
  // for every medication (excluding pure consumables without a stock record).
  const inventoryFlags = [...currentNames, ...newDrugs].map((d) => {
    const unit = INVENTORY_ITEMS.find((i) => i.name.toLowerCase().includes(d.toLowerCase()));
    const central = CENTRAL_STOCK.find((c) => c.name.toLowerCase().includes(d.toLowerCase()));
    const unitLmis = unit ? computeLmis({ ...unit, reorderPoint: unit.reorderPoint }) : null;
    const centralLmis = central ? computeLmis({ ...central, stock: central.qty }) : null;
    return { drug: d, unit, central, unitLmis, centralLmis };
  }).filter((f) => f.unit || f.central);

  // 6. Quick counselling reference for each medication, where available.
  const counsellingTips = [...currentNames, ...newDrugs]
    .map((d) => findDrugByName(d))
    .filter(Boolean)
    .filter((d, i, arr) => arr.findIndex((x) => x.id === d.id) === i);

  const theatreRequest = patient.theatreRequestId
    ? THEATRE_REQUESTS.find((r) => r.id === patient.theatreRequestId)
    : null;

  return { interactions, duplicateResults, doseChecks, renal, relevantReports, relevantSignal, inventoryFlags, counsellingTips, theatreRequest };
}
