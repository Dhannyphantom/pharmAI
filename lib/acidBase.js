// Simplified acid-base disturbance interpretation, for education only.
// Uses standard normal reference ranges:
//   pH   7.35 - 7.45
//   pCO2 35 - 45 mmHg
//   HCO3 22 - 26 mEq/L
// This is a teaching-level simplification (not full Winter's-formula /
// expected-compensation-range math) intended to demonstrate the concept
// of tying a patient's acid-base status back into their medication plan.

const NORMAL = { pHLow: 7.35, pHHigh: 7.45, pco2Low: 35, pco2High: 45, hco3Low: 22, hco3High: 26 };

export function interpretABG({ pH, pco2, hco3 }) {
  if (pH == null || pco2 == null || hco3 == null) return null;

  const acidemia = pH < NORMAL.pHLow;
  const alkalemia = pH > NORMAL.pHHigh;
  const pco2High = pco2 > NORMAL.pco2High;
  const pco2Low = pco2 < NORMAL.pco2Low;
  const hco3High = hco3 > NORMAL.hco3High;
  const hco3Low = hco3 < NORMAL.hco3Low;

  let primaryDisorder = "Normal";
  let compensation = "None Needed";
  let explanation = "This blood gas falls within normal limits.";

  if (acidemia) {
    if (hco3Low && !pco2High) {
      primaryDisorder = "Metabolic Acidosis";
      compensation = pco2Low ? "Partially Compensated (respiratory compensation in progress)" : "Uncompensated";
      explanation = "Low bicarbonate is driving the acidemia; a low pCO2 alongside it would indicate the lungs are already compensating by blowing off CO2.";
    } else if (pco2High && !hco3Low) {
      primaryDisorder = "Respiratory Acidosis";
      compensation = hco3High ? "Partially Compensated (renal compensation in progress)" : "Uncompensated (likely acute)";
      explanation = "Elevated pCO2 (hypoventilation) is driving the acidemia; a raised bicarbonate alongside it would indicate the kidneys have started retaining bicarbonate to compensate.";
    } else if (hco3Low && pco2High) {
      primaryDisorder = "Mixed Acidosis (Metabolic + Respiratory)";
      compensation = "Combined disorder — two processes are pushing pH the same direction at once";
      explanation = "Both a low bicarbonate and a high pCO2 are present, meaning two separate processes are driving the acidemia rather than one compensating for the other.";
    } else {
      primaryDisorder = "Acidemia (mixed picture)";
      explanation = "The pH is low but the pCO2/HCO3 pattern doesn't fit a single simple disorder — treat as a mixed disturbance and correlate clinically.";
    }
  } else if (alkalemia) {
    if (hco3High && !pco2Low) {
      primaryDisorder = "Metabolic Alkalosis";
      compensation = pco2High ? "Partially Compensated (respiratory compensation in progress)" : "Uncompensated";
      explanation = "Elevated bicarbonate is driving the alkalemia; a raised pCO2 alongside it would indicate the lungs are compensating by hypoventilating.";
    } else if (pco2Low && !hco3High) {
      primaryDisorder = "Respiratory Alkalosis";
      compensation = hco3Low ? "Partially Compensated (renal compensation in progress)" : "Uncompensated (likely acute)";
      explanation = "Low pCO2 (hyperventilation) is driving the alkalemia; a lowered bicarbonate alongside it would indicate the kidneys have started excreting bicarbonate to compensate.";
    } else if (hco3High && pco2Low) {
      primaryDisorder = "Mixed Alkalosis (Metabolic + Respiratory)";
      compensation = "Combined disorder — two processes are pushing pH the same direction at once";
      explanation = "Both a high bicarbonate and a low pCO2 are present, meaning two separate processes are driving the alkalemia at once.";
    } else {
      primaryDisorder = "Alkalemia (mixed picture)";
      explanation = "The pH is high but the pCO2/HCO3 pattern doesn't fit a single simple disorder — treat as a mixed disturbance and correlate clinically.";
    }
  } else if (hco3Low && pco2Low) {
    primaryDisorder = "Fully Compensated Metabolic Acidosis";
    compensation = "Fully Compensated";
    explanation = "pH has been normalised, but both pCO2 and HCO3 are low — consistent with a metabolic acidosis that respiratory compensation has fully corrected for.";
  } else if (hco3High && pco2High) {
    primaryDisorder = "Fully Compensated Metabolic Alkalosis";
    compensation = "Fully Compensated";
    explanation = "pH has been normalised, but both pCO2 and HCO3 are high — consistent with a metabolic alkalosis that respiratory compensation has fully corrected for.";
  }

  const severity =
    pH < 7.2 || pH > 7.6 ? "Severe" :
    pH < 7.3 || pH > 7.5 ? "Moderate" :
    primaryDisorder === "Normal" ? "None" : "Mild";

  return { primaryDisorder, compensation, explanation, severity };
}

// Cross-references the acid-base disorder against the patient's actual
// medication list for a short list of well-established, teachable
// interactions between the disturbance and specific drug classes.
export function getAcidBaseInterventions(disorder, allDrugs = []) {
  if (!disorder || disorder.primaryDisorder === "Normal") {
    return ["No acid-base disturbance detected — no dosing or monitoring implications from this profile."];
  }

  const drugs = allDrugs.map((d) => d.toLowerCase());
  const has = (name) => drugs.some((d) => d.includes(name));
  const type = disorder.primaryDisorder;
  const interventions = [];

  if (type.includes("Metabolic Acidosis")) {
    if (has("metformin")) {
      interventions.push("Metabolic acidosis compounds metformin's lactic acidosis risk on top of any renal impairment — reinforces holding or avoiding metformin here.");
    }
    interventions.push("Identify and treat the underlying cause (renal failure, DKA, lactic acidosis, toxin ingestion) rather than treating the pH number in isolation.");
    interventions.push("Recheck the metabolic panel and repeat the blood gas after any intervention to confirm the trend is genuinely improving.");
  }

  if (type.includes("Respiratory Acidosis")) {
    if (has("tramadol") || has("codeine") || has("morphine") || has("diazepam")) {
      interventions.push("A respiratory depressant is already on this chart (opioid/sedative) — use with extra caution or dose-reduce given reduced respiratory reserve.");
    }
    interventions.push("Assess airway, breathing, and level of consciousness — this pattern reflects inadequate ventilation and may need respiratory support, not a pharmacological fix alone.");
  }

  if (type.includes("Metabolic Alkalosis")) {
    if (has("furosemide")) {
      interventions.push("Ongoing loop diuretic use is a common contributor to metabolic alkalosis and often travels with hypokalaemia — review the diuretic dose and replace potassium as needed.");
    }
    if (has("citalopram") || has("ondansetron")) {
      interventions.push("Alkalosis frequently travels with hypokalaemia, and both independently raise QT-prolongation risk — extra caution is warranted alongside any QT-prolonging medicine already on this chart.");
    }
    interventions.push("Check chloride and potassium — most metabolic alkalosis is chloride-responsive and corrects with volume and electrolyte repletion.");
  }

  if (type.includes("Respiratory Alkalosis")) {
    interventions.push("If this reflects a known physiological state (e.g. pregnancy) rather than acute illness, no intervention is needed beyond documenting it as this patient's baseline.");
    interventions.push("If acute and symptomatic (light-headedness, paraesthesia), consider anxiety, pain, hypoxia, or sepsis as drivers rather than treating the gas result directly.");
  }

  if (type.startsWith("Mixed")) {
    interventions.push("Mixed disorders need the underlying causes of both processes addressed individually — correcting one without the other can unmask or worsen the second.");
  }

  if (interventions.length === 0) {
    interventions.push("Correlate with the clinical picture and trend the gas alongside treatment of the underlying cause.");
  }

  return interventions;
}
