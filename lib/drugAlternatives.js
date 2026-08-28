// Illustrative alternative-drug suggestions surfaced when an interaction
// check flags a newly prescribed medication against something else on the
// chart. Each entry gives one or two commonly substituted alternatives
// with a short rationale — always a suggestion for the pharmacist to
// confirm against the prescriber and full clinical picture, never an
// automatic substitution.

const ALTERNATIVES_BY_DRUG = {
  ciprofloxacin: [
    { drug: "Nitrofurantoin", dose: "100mg", route: "Oral", frequency: "Twice daily for 5 days", rationale: "Minimal interaction with warfarin; appropriate for uncomplicated UTI if CrCl ≥30 mL/min." },
    { drug: "Fosfomycin", dose: "3g", route: "Oral", frequency: "Single dose", rationale: "No significant warfarin interaction; simple single-dose regimen." },
  ],
  ceftriaxone: [
    { drug: "Cefuroxime", dose: "1.5g", route: "IV", frequency: "Every 8 hours", rationale: "Similar cephalosporin coverage without the calcium co-administration caution." },
  ],
  ibuprofen: [
    { drug: "Paracetamol", dose: "1g", route: "Oral", frequency: "Every 6 hours as needed", rationale: "Avoids the NSAID-related bleeding and renal risk while still covering pain." },
  ],
  tramadol: [
    { drug: "Paracetamol", dose: "1g", route: "Oral", frequency: "Every 6 hours as needed", rationale: "Avoids the serotonergic/opioid interaction risk seen with tramadol." },
  ],
  metformin: [
    { drug: "Linagliptin", dose: "5mg", route: "Oral", frequency: "Once daily", rationale: "No renal dose adjustment needed; avoids metformin's lactic acidosis risk in renal impairment." },
  ],
  fluconazole: [
    { drug: "Clotrimazole", dose: "500mg pessary", route: "Vaginal", frequency: "Single dose", rationale: "Topical azole avoids the systemic CYP2C9 interaction with warfarin." },
  ],
  clarithromycin: [
    { drug: "Azithromycin", dose: "500mg", route: "Oral", frequency: "Once daily for 3 days", rationale: "Much weaker CYP3A4 inhibition — substantially lower statin interaction risk." },
  ],
  codeine: [
    { drug: "Paracetamol", dose: "1g", route: "Oral", frequency: "Every 6 hours as needed", rationale: "Avoids unpredictable CYP2D6-driven morphine exposure risk." },
  ],
  nifedipine: [
    { drug: "Losartan", dose: "50mg", route: "Oral", frequency: "Once daily", rationale: "Avoids duplicating a calcium channel blocker already on the chart (Amlodipine)." },
  ],
};

export function getAlternatives(drugName) {
  const key = (drugName || "").trim().toLowerCase();
  const match = Object.keys(ALTERNATIVES_BY_DRUG).find((k) => key.includes(k));
  return match ? ALTERNATIVES_BY_DRUG[match] : [];
}
