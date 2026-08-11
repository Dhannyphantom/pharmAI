// Drug list + known interaction pairs for the Medication Interaction Visualizer.

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
