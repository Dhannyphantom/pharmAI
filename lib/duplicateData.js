// Therapeutic-class map for the Duplicate Prescription Detection demo.
// Educational simulation only — not a substitute for a real drug database.

export const DRUG_CLASS_MAP = {
  amoxicillin: "Penicillin antibiotic",
  ampicillin: "Penicillin antibiotic",
  "co-amoxiclav": "Penicillin antibiotic",
  coamoxiclav: "Penicillin antibiotic",
  flucloxacillin: "Penicillin antibiotic",
  ciprofloxacin: "Fluoroquinolone antibiotic",
  levofloxacin: "Fluoroquinolone antibiotic",
  ofloxacin: "Fluoroquinolone antibiotic",
  ceftriaxone: "Cephalosporin antibiotic",
  cefuroxime: "Cephalosporin antibiotic",
  cefixime: "Cephalosporin antibiotic",
  metronidazole: "Nitroimidazole antibiotic",
  omeprazole: "Proton pump inhibitor",
  esomeprazole: "Proton pump inhibitor",
  lansoprazole: "Proton pump inhibitor",
  pantoprazole: "Proton pump inhibitor",
  ibuprofen: "NSAID",
  diclofenac: "NSAID",
  naproxen: "NSAID",
  celecoxib: "NSAID",
  paracetamol: "Non-opioid analgesic",
  acetaminophen: "Non-opioid analgesic",
  metformin: "Biguanide (antidiabetic)",
  gliclazide: "Sulfonylurea (antidiabetic)",
  glibenclamide: "Sulfonylurea (antidiabetic)",
  glimepiride: "Sulfonylurea (antidiabetic)",
  lisinopril: "ACE inhibitor",
  enalapril: "ACE inhibitor",
  ramipril: "ACE inhibitor",
  losartan: "Angiotensin receptor blocker (ARB)",
  valsartan: "Angiotensin receptor blocker (ARB)",
  amlodipine: "Calcium channel blocker",
  nifedipine: "Calcium channel blocker",
  bisoprolol: "Beta-blocker",
  atenolol: "Beta-blocker",
  propranolol: "Beta-blocker",
  simvastatin: "Statin",
  atorvastatin: "Statin",
  rosuvastatin: "Statin",
  warfarin: "Vitamin K antagonist (anticoagulant)",
  enoxaparin: "Low-molecular-weight heparin (anticoagulant)",
  sertraline: "SSRI (antidepressant)",
  fluoxetine: "SSRI (antidepressant)",
  citalopram: "SSRI (antidepressant)",
  tramadol: "Opioid analgesic",
  codeine: "Opioid analgesic",
  morphine: "Opioid analgesic",
  ondansetron: "5-HT3 antagonist (antiemetic)",
  metoclopramide: "Dopamine antagonist (antiemetic)",
  salbutamol: "Short-acting beta-2 agonist (SABA)",
  albuterol: "Short-acting beta-2 agonist (SABA)",
};

// Longer keys first, so "co-amoxiclav" matches before a shorter substring would.
const SORTED_KEYS = Object.keys(DRUG_CLASS_MAP).sort((a, b) => b.length - a.length);

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Finds the first known drug name as a whole word inside a free-text entry
// like "Omeprazole 20mg once daily" — a plain equality check would miss this.
export function extractDrugKey(text) {
  const t = text.toLowerCase();
  for (const key of SORTED_KEYS) {
    const re = new RegExp(`(^|[^a-z])${escapeRegExp(key)}([^a-z]|$)`, "i");
    if (re.test(t)) return key;
  }
  return null;
}

export function classify(drugName) {
  const key = extractDrugKey(drugName);
  return key ? DRUG_CLASS_MAP[key] : null;
}

// Parse a free-text, comma/newline separated medication list into drug names.
export function parseMedList(text) {
  return text
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function detectDuplicates(currentMedsText, newDrug) {
  const currentMeds = parseMedList(currentMedsText);
  const newKey = extractDrugKey(newDrug);
  const newClass = newKey ? DRUG_CLASS_MAP[newKey] : null;
  const matches = [];

  for (const med of currentMeds) {
    const medKey = extractDrugKey(med);
    const medClass = medKey ? DRUG_CLASS_MAP[medKey] : null;

    if (newKey && medKey && medKey === newKey) {
      matches.push({ drug: med, reason: `Identical medication already on the chart (${newDrug.trim()})`, drugClass: medClass });
      continue;
    }
    if (newClass && medClass && medClass === newClass) {
      matches.push({ drug: med, reason: `Same therapeutic class as ${newDrug.trim()} (${newClass})`, drugClass: medClass });
    }
  }

  return {
    newDrug: newDrug.trim(),
    newClass: newClass || "Not in local reference (~45 drugs) — verify manually or use Live AI Mode",
    currentMeds,
    duplicates: matches,
    riskLevel: matches.length > 0 ? (matches.some((m) => m.reason.startsWith("Identical")) ? "High" : "Medium") : "Low",
  };
}

export const DEFAULT_SCENARIO = {
  currentMedsText: "Amlodipine 5mg once daily\nOmeprazole 20mg once daily\nSimvastatin 40mg once daily",
  newDrug: "Esomeprazole 40mg once daily",
};
