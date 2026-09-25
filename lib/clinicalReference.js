// Reference-range lookup for vitals, lab values, and ABG readings shown in
// the patient workspace. Each getter returns either null (no reference
// exists for this field, so it renders as plain text) or a small status
// object: { level, label, className, metric, reference }.
//
// `level` is a coarse bucket (low/normal/elevated/high/critical/moderate/
// severe/subtherapeutic/therapeutic) used only to pick a color; `label` is
// the short word shown in the badge; `metric`/`reference` feed the hover
// tooltip so the reader can see what's actually being compared against.
//
// Educational simplification only — not a substitute for a full clinical
// reference range table.

function parseFirstNumber(str) {
  const m = String(str ?? "").match(/-?[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

const LEVEL_STYLE = {
  low: { label: "Low", className: "text-warn bg-warn/10 border-warn/30" },
  subtherapeutic: { label: "Low", className: "text-warn bg-warn/10 border-warn/30" },
  high: { label: "High", className: "text-danger bg-danger/10 border-danger/30" },
  elevated: { label: "Elevated", className: "text-warn bg-warn/10 border-warn/30" },
  moderate: { label: "Moderate", className: "text-warn bg-warn/10 border-warn/30" },
  severe: { label: "Severe", className: "text-danger bg-danger/10 border-danger/30" },
  critical: { label: "Critical", className: "text-danger bg-danger/15 border-danger/40" },
  normal: { label: "Normal", className: "text-mint bg-mint/10 border-mint/30" },
  therapeutic: { label: "Normal", className: "text-mint bg-mint/10 border-mint/30" },
};

function badge(level, metric, reference) {
  const base = LEVEL_STYLE[level] || LEVEL_STYLE.normal;
  return { level, ...base, metric, reference };
}

/**
 * @param {string} key - one of the keys used in patient.vitals (bp/hr/rr/temp/spo2)
 * @param {string} rawValue - the displayed value, e.g. "138/82 mmHg"
 */
export function getVitalStatus(key, rawValue) {
  const k = String(key).toLowerCase();

  if (k === "bp") {
    const m = String(rawValue).match(/(\d+)\s*\/\s*(\d+)/);
    if (!m) return null;
    const sys = parseInt(m[1], 10);
    const dia = parseInt(m[2], 10);
    let level = "normal";
    if (sys >= 140 || dia >= 90) level = "high";
    else if (sys >= 130 || dia >= 80) level = "elevated";
    else if (sys < 90 || dia < 60) level = "low";
    return badge(level, "Blood Pressure", "90–120 / 60–80 mmHg");
  }

  if (k === "hr") {
    const v = parseFirstNumber(rawValue);
    if (v == null) return null;
    const level = v < 60 ? "low" : v > 100 ? "high" : "normal";
    return badge(level, "Heart Rate", "60–100 bpm");
  }

  if (k === "rr") {
    const v = parseFirstNumber(rawValue);
    if (v == null) return null;
    const level = v < 12 ? "low" : v > 20 ? "high" : "normal";
    return badge(level, "Respiratory Rate", "12–20 breaths/min");
  }

  if (k === "temp") {
    const v = parseFirstNumber(rawValue);
    if (v == null) return null;
    const level = v < 36.1 ? "low" : v > 38 ? "high" : v > 37.2 ? "elevated" : "normal";
    return badge(level, "Temperature", "36.1–37.2°C");
  }

  if (k === "spo2") {
    const v = parseFirstNumber(rawValue);
    if (v == null) return null;
    const level = v < 90 ? "critical" : v < 95 ? "low" : "normal";
    return badge(level, "Oxygen Saturation", "≥ 95%");
  }

  return null;
}

/**
 * @param {string} key - a lab label as used in patient.labs, e.g. "Serum Creatinine"
 * @param {string} rawValue - the displayed value, e.g. "1.3 mg/dL"
 */
export function getLabStatus(key, rawValue) {
  const k = String(key).toLowerCase();
  const v = parseFirstNumber(rawValue);

  if (k.includes("creatinine clearance")) {
    if (v == null) return null;
    const level = v >= 50 ? "normal" : v >= 30 ? "moderate" : v >= 10 ? "severe" : "critical";
    return badge(level, "Creatinine Clearance", "≥ 50 mL/min (normal/mild impairment)");
  }

  if (k.includes("egfr")) {
    if (v == null) return null;
    const level = v >= 60 ? "normal" : v >= 30 ? "moderate" : v >= 15 ? "severe" : "critical";
    return badge(level, "eGFR", "≥ 60 mL/min/1.73m²");
  }

  if (k.includes("serum creatinine")) {
    if (v == null) return null;
    const level = v > 1.3 ? "high" : v < 0.5 ? "low" : "normal";
    return badge(level, "Serum Creatinine", "0.5–1.3 mg/dL");
  }

  if (k.includes("blood glucose")) {
    if (v == null) return null;
    const level = v < 4.0 ? "low" : v > 11.0 ? "high" : v > 7.8 ? "elevated" : "normal";
    return badge(level, "Blood Glucose", "4.0–7.8 mmol/L");
  }

  if (k === "inr") {
    if (v == null) return null;
    const level = v < 2.0 ? "subtherapeutic" : v > 3.0 ? "high" : "therapeutic";
    return badge(level, "INR", "2.0–3.0 (therapeutic range on warfarin)");
  }

  if (k === "potassium") {
    if (v == null) return null;
    const level = v < 3.5 ? "low" : v > 5.0 ? "high" : "normal";
    return badge(level, "Potassium", "3.5–5.0 mmol/L");
  }

  if (k.includes("hba1c")) {
    if (v == null) return null;
    const level = v >= 6.5 ? "high" : v >= 5.7 ? "elevated" : "normal";
    return badge(level, "HbA1c", "< 5.7% normal · ≥ 6.5% diabetic range");
  }

  if (k.includes("liver function")) {
    const isNormal = /within normal/i.test(String(rawValue));
    return badge(isNormal ? "normal" : "elevated", "Liver Function", "Within normal limits");
  }

  return null;
}

/**
 * @param {string} key - one of pH/pco2/hco3/lactate
 * @param {number|string} rawValue
 */
export function getAbgStatus(key, rawValue) {
  const k = String(key).toLowerCase();
  const v = parseFirstNumber(rawValue);
  if (v == null) return null;

  if (k === "ph") {
    const level = v < 7.35 ? "low" : v > 7.45 ? "high" : "normal";
    return badge(level, "pH", "7.35–7.45");
  }
  if (k === "pco2") {
    const level = v < 35 ? "low" : v > 45 ? "high" : "normal";
    return badge(level, "pCO₂", "35–45 mmHg");
  }
  if (k === "hco3") {
    const level = v < 22 ? "low" : v > 26 ? "high" : "normal";
    return badge(level, "HCO₃⁻", "22–26 mEq/L");
  }
  if (k === "lactate") {
    const level = v > 4 ? "critical" : v > 2 ? "elevated" : "normal";
    return badge(level, "Lactate", "< 2 mmol/L");
  }
  return null;
}
