// Drug list + known interaction pairs for the Medication Interaction Visualizer,
// also reused by the Attend to Patient workflow's interaction cross-check.

export const INTERACTION_DRUGS = [
  "Warfarin",
  "Metronidazole",
  "Aspirin",
  "Ibuprofen",
  "Simvastatin",
  "Clarithromycin",
  "Digoxin",
  "Furosemide",
  "Sertraline",
  "Tramadol",
  "Ciprofloxacin",
  "Citalopram",
  "Ondansetron",
  "Metformin",
  "Gliclazide",
  "Amlodipine",
  "Nifedipine",
  "Bisoprolol",
];

// Keyed as "DrugA|DrugB" (alphabetical order) for lookup simplicity.
const PAIRS = {
  "Metronidazole|Warfarin": {
    severity: "Major",
    mechanism:
      "Metronidazole inhibits the liver enzyme (CYP2C9) that breaks down warfarin, causing warfarin levels — and bleeding risk — to rise sharply within days.",
    recommendation: "Avoid combination where possible. If unavoidable, reduce warfarin dose proactively and monitor INR closely.",
  },
  "Aspirin|Warfarin": {
    severity: "Major",
    mechanism:
      "Both drugs increase bleeding risk through different mechanisms — aspirin inhibits platelet function while warfarin reduces clotting factors — so combined use compounds bleeding risk significantly.",
    recommendation: "Avoid unless there is a specific, clearly documented indication for dual therapy, with close monitoring.",
  },
  "Aspirin|Ibuprofen": {
    severity: "Moderate",
    mechanism:
      "Ibuprofen can reduce the cardioprotective antiplatelet effect of low-dose aspirin, and both increase the risk of gastrointestinal bleeding and renal impairment when combined.",
    recommendation: "Avoid regular concurrent use; if occasional ibuprofen is needed, take it several hours after the aspirin dose.",
  },
  "Clarithromycin|Simvastatin": {
    severity: "Major",
    mechanism:
      "Clarithromycin strongly inhibits CYP3A4, the enzyme that clears simvastatin, causing statin levels to rise substantially and significantly increasing the risk of myopathy and rhabdomyolysis.",
    recommendation: "Withhold simvastatin during the clarithromycin course, or switch to an antibiotic/statin combination with less interaction potential.",
  },
  "Digoxin|Furosemide": {
    severity: "Moderate",
    mechanism:
      "Furosemide can cause potassium and magnesium loss; low potassium increases the heart's sensitivity to digoxin, raising the risk of digoxin toxicity even at normal digoxin levels.",
    recommendation: "Monitor electrolytes (especially potassium) regularly and watch for signs of digoxin toxicity such as nausea, visual disturbances, or arrhythmia.",
  },
  "Sertraline|Tramadol": {
    severity: "Major",
    mechanism:
      "Both increase serotonin activity; combined use raises the risk of serotonin syndrome, a potentially life-threatening condition causing agitation, high fever, and muscle rigidity.",
    recommendation: "Use with caution and only if necessary; educate the patient on serotonin syndrome symptoms and consider alternative analgesia.",
  },
  "Ciprofloxacin|Warfarin": {
    severity: "Major",
    mechanism:
      "Ciprofloxacin inhibits CYP1A2 and displaces warfarin from plasma proteins, significantly increasing INR and bleeding risk within 3-5 days of starting.",
    recommendation: "Avoid where an alternative antibiotic exists. If unavoidable, anticipate a warfarin dose reduction and recheck INR within days.",
  },
  "Citalopram|Ondansetron": {
    severity: "Moderate",
    mechanism:
      "Both citalopram and ondansetron prolong the QT interval; combined use raises the risk of QT prolongation and torsades de pointes, especially with coexisting hypokalaemia.",
    recommendation: "Correct any electrolyte abnormality first, use the lowest effective ondansetron dose, and consider ECG monitoring in at-risk patients.",
  },
  "Furosemide|Metformin": {
    severity: "Low",
    mechanism: "No clinically significant direct interaction; furosemide-induced dehydration can theoretically raise lactic acidosis risk with metformin in acute illness.",
    recommendation: "No routine action needed; advise adequate hydration, especially during illness.",
  },
  "Amlodipine|Nifedipine": {
    severity: "Moderate",
    mechanism: "Both are dihydropyridine calcium channel blockers; concurrent use is therapeutic duplication rather than a true interaction, and compounds hypotension and peripheral oedema risk.",
    recommendation: "Avoid routine duplication — confirm whether both are intended, and consult the prescriber if unclear.",
  },
  "Bisoprolol|Gliclazide": {
    severity: "Low",
    mechanism: "Beta-blockers can blunt the adrenergic warning signs of hypoglycaemia (tremor, tachycardia), making low blood sugar harder to detect.",
    recommendation: "Counsel on alternative hypoglycaemia symptoms (sweating, confusion) and encourage regular blood glucose monitoring.",
  },
};

export function getInteraction(drugA, drugB) {
  if (!drugA || !drugB || drugA === drugB) return null;
  const key = [drugA, drugB].sort().join("|");
  return PAIRS[key] || {
    severity: "Low",
    mechanism: "No clinically significant interaction is documented between these two agents in this simplified educational dataset.",
    recommendation: "Standard monitoring applies. Always verify against a current clinical reference for real practice.",
  };
}
