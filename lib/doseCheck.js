// Simplified adult dosing reference for the Attend to Patient dose-accuracy
// check. Educational simulation only — always verify against a full clinical
// reference for real practice.

export const DOSE_REFERENCE = {
  amoxicillin: { minSingle: 250, maxSingle: 1000, maxDaily: 3000, unit: "mg" },
  ciprofloxacin: { minSingle: 250, maxSingle: 750, maxDaily: 1500, unit: "mg" },
  metformin: { minSingle: 500, maxSingle: 1000, maxDaily: 2000, unit: "mg" },
  warfarin: { minSingle: 1, maxSingle: 10, maxDaily: 10, unit: "mg" },
  nifedipine: { minSingle: 10, maxSingle: 90, maxDaily: 90, unit: "mg" },
  amlodipine: { minSingle: 2.5, maxSingle: 10, maxDaily: 10, unit: "mg" },
  ondansetron: { minSingle: 4, maxSingle: 8, maxDaily: 24, unit: "mg" },
  ceftriaxone: { minSingle: 250, maxSingle: 2000, maxDaily: 4000, unit: "mg" },
  bisoprolol: { minSingle: 1.25, maxSingle: 10, maxDaily: 10, unit: "mg" },
  gliclazide: { minSingle: 40, maxSingle: 160, maxDaily: 320, unit: "mg" },
  atorvastatin: { minSingle: 10, maxSingle: 80, maxDaily: 80, unit: "mg" },
  citalopram: { minSingle: 10, maxSingle: 40, maxDaily: 40, unit: "mg" },
  lisinopril: { minSingle: 2.5, maxSingle: 40, maxDaily: 40, unit: "mg" },
  furosemide: { minSingle: 20, maxSingle: 80, maxDaily: 600, unit: "mg" },
};

function parseDoseInMg(doseText) {
  const text = String(doseText || "").toLowerCase();
  const m = text.match(/([\d.]+)\s*(mcg|microgram|mg|milligram|g|gram)?/);
  if (!m) return null;
  let num = parseFloat(m[1]);
  const unit = m[2];
  if (unit === "g" || unit === "gram") num *= 1000;
  else if (unit === "mcg" || unit === "microgram") num /= 1000;
  // otherwise assume mg (the default/most common case, and covers "mg"/"milligram")
  return num;
}

function parseFrequencyPerDay(freqText) {
  const f = String(freqText || "").toLowerCase();
  if (f.includes("once")) return 1;
  if (f.includes("twice")) return 2;
  if (f.includes("three times") || f.includes("thrice") || f.includes("tds")) return 3;
  if (f.includes("four times") || f.includes("qds")) return 4;
  const everyMatch = f.match(/every\s+(\d+)\s*h/);
  if (everyMatch) return Math.max(1, Math.round(24 / parseInt(everyMatch[1], 10)));
  return null;
}

export function checkDose(drugName, doseText, frequencyText) {
  const key = Object.keys(DOSE_REFERENCE).find((k) => drugName.toLowerCase().includes(k));
  if (!key) return null;
  const ref = DOSE_REFERENCE[key];
  const doseNum = parseDoseInMg(doseText);
  if (doseNum == null) return null;
  const freqPerDay = parseFrequencyPerDay(frequencyText);
  const dailyTotal = freqPerDay ? doseNum * freqPerDay : null;

  if (doseNum > ref.maxSingle) {
    return { status: "high", message: `${doseNum}${ref.unit} exceeds the typical single-dose maximum of ${ref.maxSingle}${ref.unit}.` };
  }
  if (doseNum < ref.minSingle) {
    return { status: "low", message: `${doseNum}${ref.unit} is below the typical single-dose minimum of ${ref.minSingle}${ref.unit} — verify this is intentional (e.g. a renal or hepatic adjustment).` };
  }
  if (dailyTotal && ref.maxDaily && dailyTotal > ref.maxDaily) {
    return { status: "high", message: `Total daily dose of ${dailyTotal}${ref.unit} (${doseNum}${ref.unit} × ${freqPerDay}/day) exceeds the typical maximum of ${ref.maxDaily}${ref.unit}/day.` };
  }
  return { status: "ok", message: `Within the typical adult range of ${ref.minSingle}-${ref.maxSingle}${ref.unit} per dose.` };
}
