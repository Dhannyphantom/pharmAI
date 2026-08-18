// Simplified pharmacogenomics (PGx) reference for the demo. Educational
// simulation only — real PGx-guided prescribing follows CPIC/DPWG guidelines.

export const PGX_PAIRS = [
  {
    id: "cyp2c19-clopidogrel",
    gene: "CYP2C19",
    drug: "Clopidogrel",
    mechanism: "Clopidogrel is a prodrug — CYP2C19 converts it into its active antiplatelet form. Reduced-function alleles mean less active drug is produced.",
    phenotypes: [
      { name: "Poor Metabolizer", risk: "High", recommendation: "Avoid clopidogrel — use an alternative antiplatelet (e.g. prasugrel or ticagrelor). Minimal conversion to active metabolite significantly lowers efficacy, raising stent thrombosis / recurrent event risk." },
      { name: "Intermediate Metabolizer", risk: "Moderate", recommendation: "Consider an alternative agent or increased clinical monitoring — moderately reduced antiplatelet effect is possible." },
      { name: "Normal Metabolizer", risk: "Low", recommendation: "Standard clopidogrel dosing is appropriate." },
      { name: "Ultrarapid Metabolizer", risk: "Low", recommendation: "Standard dosing is appropriate; no clinically actionable dose change, though a theoretical bleeding-risk signal exists from enhanced activation." },
    ],
  },
  {
    id: "cyp2d6-codeine",
    gene: "CYP2D6",
    drug: "Codeine",
    mechanism: "Codeine itself is a weak analgesic — CYP2D6 converts it into morphine, the active compound responsible for pain relief.",
    phenotypes: [
      { name: "Poor Metabolizer", risk: "High", recommendation: "Avoid codeine — minimal conversion to morphine means inadequate pain relief. Use a non-codeine analgesic instead." },
      { name: "Intermediate Metabolizer", risk: "Moderate", recommendation: "Reduced analgesic effect is possible — monitor efficacy and consider an alternative if pain control is inadequate." },
      { name: "Normal Metabolizer", risk: "Low", recommendation: "Standard codeine dosing is appropriate." },
      { name: "Ultrarapid Metabolizer", risk: "High", recommendation: "Avoid codeine — rapid, excessive conversion to morphine risks toxicity and respiratory depression, particularly dangerous in children and breastfeeding mothers." },
    ],
  },
  {
    id: "tpmt-azathioprine",
    gene: "TPMT",
    drug: "Azathioprine",
    mechanism: "TPMT breaks down azathioprine's active thiopurine metabolites. Low TPMT activity lets toxic metabolites accumulate.",
    phenotypes: [
      { name: "Poor Metabolizer", risk: "High", recommendation: "Reduce the dose drastically (often by ~90%) or use an alternative agent — standard dosing carries a high risk of life-threatening myelosuppression." },
      { name: "Intermediate Metabolizer", risk: "Moderate", recommendation: "Start at a reduced dose (30-50% of standard) and monitor full blood counts closely, especially in the first weeks." },
      { name: "Normal Metabolizer", risk: "Low", recommendation: "Standard dosing is appropriate with routine blood count monitoring." },
    ],
  },
  {
    id: "cyp2c9-vkorc1-warfarin",
    gene: "CYP2C9 / VKORC1",
    drug: "Warfarin",
    mechanism: "CYP2C9 clears warfarin from the body; VKORC1 is warfarin's target enzyme. Variants in either gene change how sensitive a patient is to a given dose.",
    phenotypes: [
      { name: "High Sensitivity (Poor Metabolizer)", risk: "High", recommendation: "Start at a markedly lower dose (e.g. 0.5-2mg) with more frequent INR monitoring — standard starting doses carry a materially increased bleeding risk." },
      { name: "Intermediate Sensitivity", risk: "Moderate", recommendation: "Consider a modestly reduced starting dose and monitor INR closely during initial titration." },
      { name: "Normal Sensitivity", risk: "Low", recommendation: "Standard warfarin initiation protocol is appropriate." },
    ],
  },
  {
    id: "hla-b-carbamazepine",
    gene: "HLA-B*15:02",
    drug: "Carbamazepine",
    mechanism: "This HLA allele is strongly associated with a T-cell mediated severe cutaneous reaction to carbamazepine, independent of dose.",
    phenotypes: [
      { name: "Positive", risk: "High", recommendation: "Avoid carbamazepine entirely — strongly associated with Stevens-Johnson syndrome / toxic epidermal necrolysis (SJS/TEN), particularly in patients of Southeast Asian and Han Chinese ancestry." },
      { name: "Negative", risk: "Low", recommendation: "Standard carbamazepine dosing is appropriate; this allele-specific SJS/TEN risk is not significantly elevated." },
    ],
  },
];

export function getPgxPairById(id) {
  return PGX_PAIRS.find((p) => p.id === id);
}
