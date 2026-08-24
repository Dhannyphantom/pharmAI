// Translates pharmacist-facing clinical findings into a patient-friendly
// "what this means for you" framing for the Patient Portal's safety alerts
// panel. This reuses the same interaction/duplicate/renal logic the
// pharmacist workspace already runs (lib/patients.js getPatientAnalysis) —
// it doesn't add new detection, just reframes moderate/major findings in
// plain language and points the patient toward their care team rather than
// naming a diagnosis or mechanism.

const SEVERITY_ACTION = {
  Major: { tone: "Please discuss with your doctor or pharmacist soon", color: "danger" },
  Moderate: { tone: "Worth mentioning at your next visit", color: "warn" },
};

export function buildPatientSafetyAlerts(analysis) {
  const alerts = [];

  analysis.interactions
    .filter((it) => it.severity === "Major" || it.severity === "Moderate")
    .forEach((it) => {
      const action = SEVERITY_ACTION[it.severity];
      alerts.push({
        title: it.pair.replace(" + ", " and "),
        message: "Our pharmacy team flagged that these two medicines can affect each other when taken together.",
        action: action.tone,
        color: action.color,
      });
    });

  analysis.duplicateResults.forEach((r) => {
    r.duplicates.forEach((d) => {
      alerts.push({
        title: d.drug,
        message: "You may already be taking something similar to a newly prescribed medicine — this could mean getting more of the same effect than intended.",
        action: SEVERITY_ACTION.Moderate.tone,
        color: "warn",
      });
    });
  });

  if (analysis.renal && analysis.renal.band.key !== "normal" && analysis.renal.recommendations.length > 0) {
    alerts.push({
      title: "Kidney Function & Your Medicines",
      message: "Your recent kidney function results may mean one or more of your medicine doses needs adjusting.",
      action: SEVERITY_ACTION.Major.tone,
      color: "danger",
    });
  }

  return alerts;
}
