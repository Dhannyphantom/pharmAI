// Miscellaneous scripted data for the remaining demo modules.
// All figures are illustrative/simulated for an educational presentation.

export const SCANNER_CASE = {
  steps: [
    "Scanning handwriting...",
    "Recognising medicines...",
    "Checking doses...",
    "Checking allergies...",
    "Checking interactions...",
  ],
  recognisedText: "Rx: Amoxicillin 500mg TDS x7/7 + Warfarin 5mg OD (continue)",
  findings: [
    { label: "Medicines Recognised", value: "Amoxicillin 500 mg, Warfarin 5 mg", status: "ok" },
    { label: "Dose Check", value: "Both doses within standard adult range", status: "ok" },
    { label: "Allergy Check", value: "No known allergies on file", status: "ok" },
    {
      label: "Interaction Check",
      value: "Amoxicillin may modestly potentiate warfarin — INR recheck advised within one week",
      status: "warn",
    },
  ],
  riskScore: 38,
  priority: "Medium",
  confidence: 90,
};

// LMIS fields per item:
//  amc          — average monthly consumption
//  reorderPoint — reorder level (ROL)
//  minStock     — safety stock / minimum stock level
//  maxStock     — maximum stock level
//  leadTimeDays — typical supplier/bulk-store lead time
//  forecast     — last 6 months of actual consumption (used to project the next 6 months)
export const INVENTORY_ITEMS = [
  { name: "Amoxicillin 500mg", stock: 3200, reorderPoint: 1500, expiry: "08/2026", forecast: [820, 900, 1050, 1180, 1240, 1300], risk: "Low", amc: 1080, minStock: 800, maxStock: 4500, leadTimeDays: 14 },
  { name: "Warfarin 5mg", stock: 310, reorderPoint: 350, expiry: "03/2027", forecast: [520, 470, 410, 360, 310, 260], risk: "High", amc: 390, minStock: 175, maxStock: 900, leadTimeDays: 10 },
  { name: "Metformin 1000mg", stock: 2600, reorderPoint: 1200, expiry: "11/2026", forecast: [700, 780, 840, 900, 950, 980], risk: "Low", amc: 860, minStock: 600, maxStock: 3600, leadTimeDays: 14 },
  { name: "Insulin Glargine", stock: 145, reorderPoint: 150, expiry: "01/2026", forecast: [220, 200, 180, 165, 150, 145], risk: "Medium", amc: 180, minStock: 75, maxStock: 400, leadTimeDays: 21 },
  { name: "Ceftriaxone 1g Vial", stock: 60, reorderPoint: 100, expiry: "06/2026", forecast: [140, 120, 100, 85, 70, 60], risk: "High", amc: 95, minStock: 50, maxStock: 250, leadTimeDays: 10 },
  { name: "Salbutamol Inhaler", stock: 1400, reorderPoint: 500, expiry: "09/2026", forecast: [300, 330, 360, 390, 400, 410], risk: "Low", amc: 365, minStock: 250, maxStock: 2000, leadTimeDays: 14 },
  { name: "Bisoprolol 5mg", stock: 520, reorderPoint: 300, expiry: "05/2027", forecast: [280, 300, 310, 320, 330, 340], risk: "Low", amc: 310, minStock: 150, maxStock: 800, leadTimeDays: 14 },
  { name: "Amlodipine 5mg", stock: 610, reorderPoint: 350, expiry: "07/2027", forecast: [340, 350, 360, 370, 380, 390], risk: "Low", amc: 365, minStock: 175, maxStock: 900, leadTimeDays: 14 },
  { name: "Nifedipine 10mg", stock: 95, reorderPoint: 120, expiry: "02/2027", forecast: [130, 120, 110, 105, 100, 95], risk: "High", amc: 110, minStock: 60, maxStock: 300, leadTimeDays: 14 },
  { name: "Atorvastatin 20mg", stock: 780, reorderPoint: 400, expiry: "09/2027", forecast: [360, 380, 400, 410, 420, 430], risk: "Low", amc: 400, minStock: 200, maxStock: 1000, leadTimeDays: 14 },
  { name: "Gliclazide 80mg", stock: 340, reorderPoint: 250, expiry: "04/2027", forecast: [220, 230, 240, 250, 255, 260], risk: "Medium", amc: 245, minStock: 125, maxStock: 650, leadTimeDays: 14 },
  { name: "Citalopram 40mg", stock: 265, reorderPoint: 200, expiry: "10/2027", forecast: [170, 180, 185, 190, 195, 200], risk: "Low", amc: 187, minStock: 100, maxStock: 500, leadTimeDays: 14 },
  { name: "Lisinopril 10mg", stock: 430, reorderPoint: 300, expiry: "06/2027", forecast: [270, 280, 290, 300, 305, 310], risk: "Low", amc: 293, minStock: 150, maxStock: 750, leadTimeDays: 14 },
  { name: "Furosemide 20mg", stock: 205, reorderPoint: 220, expiry: "03/2027", forecast: [190, 200, 210, 215, 220, 225], risk: "Medium", amc: 210, minStock: 110, maxStock: 550, leadTimeDays: 14 },
  { name: "Ciprofloxacin 500mg", stock: 88, reorderPoint: 150, expiry: "12/2026", forecast: [190, 175, 160, 145, 130, 115], risk: "High", amc: 150, minStock: 75, maxStock: 400, leadTimeDays: 10 },
  { name: "Ondansetron 4mg", stock: 42, reorderPoint: 80, expiry: "01/2027", forecast: [95, 88, 80, 72, 65, 58], risk: "High", amc: 76, minStock: 40, maxStock: 220, leadTimeDays: 14 },
  { name: "Prenatal Multivitamin", stock: 340, reorderPoint: 200, expiry: "11/2027", forecast: [180, 190, 195, 200, 205, 210], risk: "Low", amc: 197, minStock: 100, maxStock: 500, leadTimeDays: 21 },
  { name: "Antenatal Multivitamin", stock: 300, reorderPoint: 200, expiry: "11/2027", forecast: [180, 190, 195, 200, 205, 210], risk: "Low", amc: 197, minStock: 100, maxStock: 500, leadTimeDays: 21 },
  { name: "Ferrous Sulfate 200mg", stock: 560, reorderPoint: 300, expiry: "08/2027", forecast: [270, 280, 290, 300, 305, 310], risk: "Low", amc: 293, minStock: 150, maxStock: 750, leadTimeDays: 14 },
  // Theatre/O&G-oriented additions — uterotonic and a second cephalosporin,
  // so those units carry stock that's actually relevant to their procedures
  // rather than reusing the same general-outpatient formulary.
  { name: "Oxytocin 10 IU", stock: 210, reorderPoint: 150, expiry: "09/2026", forecast: [130, 140, 150, 155, 160, 165], risk: "Low", amc: 150, minStock: 80, maxStock: 400, leadTimeDays: 14 },
  { name: "Cefuroxime 1.5g", stock: 70, reorderPoint: 90, expiry: "10/2026", forecast: [95, 90, 85, 80, 75, 70], risk: "Medium", amc: 82, minStock: 40, maxStock: 220, leadTimeDays: 14 },
];

export const PHARMACOVIGILANCE_REPORTS = [
  { id: "ADR-2291", drug: "Ceftriaxone", reaction: "Rash", severity: "Mild", date: "2 days ago" },
  { id: "ADR-2295", drug: "Ceftriaxone", reaction: "Rash", severity: "Mild", date: "2 days ago" },
  { id: "ADR-2298", drug: "Ceftriaxone", reaction: "Facial swelling", severity: "Moderate", date: "1 day ago" },
  { id: "ADR-2301", drug: "Ceftriaxone", reaction: "Rash", severity: "Mild", date: "18 hours ago" },
  { id: "ADR-2303", drug: "Metformin", reaction: "GI upset", severity: "Mild", date: "14 hours ago" },
  { id: "ADR-2305", drug: "Ceftriaxone", reaction: "Difficulty breathing", severity: "Severe", date: "6 hours ago" },
  { id: "ADR-2307", drug: "Warfarin", reaction: "Bruising", severity: "Mild", date: "4 hours ago" },
  { id: "ADR-2309", drug: "Ceftriaxone", reaction: "Rash", severity: "Mild", date: "2 hours ago" },
];

export const SIGNAL_CLUSTER = {
  drug: "Ceftriaxone",
  reactionCluster: "Rash / Facial Swelling / Breathing Difficulty",
  reportCount: 5,
  timeWindow: "48 hours",
  confidence: 87,
  narrative:
    "Five reports involving Ceftriaxone within 48 hours show an escalating allergic-reaction pattern — from mild rash to facial swelling to breathing difficulty. This clustering, especially the severity escalation, is statistically unlikely to be coincidental and warrants urgent clinical review of this batch/patient population.",
};

export const DISCOVERY_FUNNEL = [
  { label: "Candidate Molecules Screened", value: 4_200_000, colorClass: "from-ai-cyan to-hospital-blue" },
  { label: "AI-Filtered Candidates", value: 8_600, colorClass: "from-hospital-blue to-ai-violet" },
  { label: "Predicted Viable Compounds", value: 340, colorClass: "from-ai-violet to-mint" },
  { label: "Laboratory-Tested", value: 42, colorClass: "from-mint to-warn" },
  { label: "Approved Medicine", value: 1, colorClass: "from-warn to-danger" },
];

export const DISCOVERY_TIMELINE = [
  { label: "Traditional Discovery Pipeline", years: 13 },
  { label: "AI-Accelerated Pipeline", years: 4 },
];

export const HOSPITAL_STATS = [
  { label: "Patients Screened Today", value: 312, suffix: "" },
  { label: "Interactions Detected", value: 47, suffix: "" },
  { label: "Dose Adjustments Suggested", value: 29, suffix: "" },
  { label: "Medication Errors Prevented", value: 18, suffix: "" },
  { label: "Patients Counselled", value: 204, suffix: "" },
  { label: "High-Risk Alerts", value: 9, suffix: "" },
];

export const HALLUCINATION_CASE = {
  patientNote: "Patient: Mr. J.U, 81 — atrial fibrillation, INR checked this morning: 1.1 (subtherapeutic).",
  aiRecommendation:
    "AI Recommendation: INR is low at 1.1. Increase warfarin dose from 3 mg to 6 mg daily immediately to reach target range faster.",
  aiConfidence: 91,
  whyWrong:
    "The AI correctly read the INR value but applied a generic 'double the dose' heuristic without accounting for real prescribing practice: warfarin dose changes should be conservative and gradual (typically 10-20% adjustments), because its effect is delayed and highly sensitive to overshoot. Doubling the dose risks dangerous overcorrection into a supratherapeutic, high-bleeding-risk range days later.",
  correctRecommendation:
    "Increase the weekly warfarin dose modestly (e.g., by 10-15%), recheck INR in 3-7 days, and assess for contributing factors (diet, adherence, interacting medications) before making further changes.",
  clinicalJudgement:
    "This is exactly why a pharmacist reviews every AI output before it reaches a patient: the AI pattern-matched 'low value, needs to go up' without the pharmacological nuance a trained clinician applies automatically.",
};
