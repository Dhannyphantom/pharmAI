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
export const INVENTORY_ITEMS = [
  { name: "Amoxicillin 500mg", stock: 1240, reorderPoint: 800, expiry: "08/2026", forecast: [820, 900, 1050, 1180, 1240, 1300], risk: "Low", amc: 1080, minStock: 400, maxStock: 2000, leadTimeDays: 14 },
  { name: "Warfarin 5mg", stock: 310, reorderPoint: 350, expiry: "03/2027", forecast: [520, 470, 410, 360, 310, 260], risk: "High", amc: 390, minStock: 175, maxStock: 900, leadTimeDays: 10 },
  { name: "Metformin 1000mg", stock: 980, reorderPoint: 600, expiry: "11/2026", forecast: [700, 780, 840, 900, 950, 980], risk: "Low", amc: 860, minStock: 300, maxStock: 1600, leadTimeDays: 14 },
  { name: "Insulin Glargine", stock: 145, reorderPoint: 150, expiry: "01/2026", forecast: [220, 200, 180, 165, 150, 145], risk: "Medium", amc: 180, minStock: 75, maxStock: 400, leadTimeDays: 21 },
  { name: "Ceftriaxone 1g Vial", stock: 60, reorderPoint: 100, expiry: "06/2026", forecast: [140, 120, 100, 85, 70, 60], risk: "High", amc: 95, minStock: 50, maxStock: 250, leadTimeDays: 10 },
  { name: "Salbutamol Inhaler", stock: 410, reorderPoint: 250, expiry: "09/2026", forecast: [300, 330, 360, 390, 400, 410], risk: "Low", amc: 365, minStock: 125, maxStock: 800, leadTimeDays: 14 },
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
