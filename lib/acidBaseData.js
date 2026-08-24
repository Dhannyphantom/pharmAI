// Supplemental arterial blood gas (ABG) values per demo patient, merged
// onto the patient object in lib/patients.js. Kept separate from
// lib/cases.js so the core case data doesn't need to change.
// Illustrative/simulated — educational demo only.

export const ABG_BY_ID = {
  bello: {
    pH: 7.47, pco2: 32, hco3: 23, lactate: 1.1,
    note: "Drawn on admission with fever and mild tachypnoea from the UTI.",
  },
  adekunle: {
    pH: 7.32, pco2: 34, hco3: 17, lactate: 1.4,
    note: "Reflects his underlying CKD — a degree of chronic metabolic acidosis is expected at this level of renal impairment.",
  },
  okoye: {
    pH: 7.44, pco2: 30, hco3: 21, lactate: 0.9,
    note: "Consistent with the normal respiratory alkalosis of pregnancy (progesterone-driven increase in minute ventilation).",
  },
  eze: {
    pH: 7.49, pco2: 44, hco3: 34, lactate: 1.0,
    note: "Likely contributed to by ongoing furosemide use and the low potassium already noted on her chart.",
  },
  chukwu: {
    pH: 7.42, pco2: 32, hco3: 24, lactate: 1.0,
    note: "Within the expected range for late pregnancy.",
  },
};

export function getAbgForPatient(id) {
  return ABG_BY_ID[id] || null;
}
