// Patient case library for the AI Clinical Pharmacy Assistant demo.
// All cases are fictional composites for educational use only.
// Names are initialized (e.g. "Mrs. A.B") for demonstration purposes.

export const CASES = [
  {
    id: "bello",
    name: "Mrs. A.B",
    age: 74,
    sex: "Female",
    weight: "68 kg",
    height: "160 cm",
    diagnosis: "Atrial fibrillation, urinary tract infection (new)",
    pastMedicalHistory: ["Atrial fibrillation (5 years)", "Hypertension", "Osteoarthritis"],
    currentMedications: [
      "Warfarin 5 mg once daily",
      "Bisoprolol 5 mg once daily",
      "Amlodipine 5 mg once daily",
    ],
    newPrescription: { drug: "Ciprofloxacin", dose: "500 mg", route: "Oral", frequency: "Twice daily for 7 days" },
    allergies: "No known drug allergies (NKDA)",
    pregnancyStatus: "Not applicable",
    vitals: { bp: "138/82 mmHg", hr: "76 bpm", rr: "16/min", temp: "37.8°C", spo2: "97%" },
    labs: {
      "Serum Creatinine": "1.3 mg/dL",
      "Creatinine Clearance": "42 mL/min",
      eGFR: "45 mL/min/1.73m²",
      "Liver Function": "Within normal limits",
      "Blood Glucose": "5.6 mmol/L",
      INR: "2.4 (baseline, therapeutic)",
    },
    clinicalNotes:
      "Patient presents with dysuria and urgency. Urinalysis positive for nitrites and leukocytes. Started empirically on ciprofloxacin by the covering physician before pharmacy review.",
    aiReport: {
      riskScore: 82,
      priority: "High",
      confidence: 94,
      interactions: [
        {
          drugs: "Warfarin + Ciprofloxacin",
          severity: "Major",
          mechanism:
            "Ciprofloxacin inhibits CYP1A2 and displaces warfarin from plasma proteins, significantly increasing INR and bleeding risk. Onset typically within 3-5 days.",
          recommendation:
            "Avoid combination if an alternative exists. If ciprofloxacin is clinically necessary, reduce warfarin dose empirically (~25-30%) and monitor INR closely.",
        },
      ],
      alternatives: [
        "Nitrofurantoin 100 mg twice daily for 5 days (minimal interaction with warfarin, appropriate for uncomplicated UTI, but caution if CrCl < 30 mL/min — this patient's CrCl of 42 mL/min is acceptable)",
        "Fosfomycin 3 g single dose (no significant warfarin interaction)",
      ],
      monitoring: [
        "Recheck INR within 3-5 days of starting any interacting antibiotic",
        "Watch for signs of bleeding: bruising, gum bleeding, dark stools",
        "Repeat renal function if antibiotic course continues beyond 7 days",
      ],
      counsellingPoints: [
        "Report any unusual bruising or bleeding immediately",
        "Complete the full antibiotic course even if symptoms improve",
        "Keep the INR recheck appointment — do not skip it",
      ],
    },
    finalRecommendation: {
      action: "Consult Prescriber",
      reasoning:
        "The warfarin-ciprofloxacin interaction is well-documented and carries a major bleeding risk in an elderly patient already at baseline therapeutic INR. A safer first-line agent (nitrofurantoin or fosfomycin) should be discussed with the prescriber before dispensing.",
    },
  },
  {
    id: "adekunle",
    name: "Mr. T.A",
    age: 58,
    sex: "Male",
    weight: "84 kg",
    height: "172 cm",
    diagnosis: "Type 2 diabetes mellitus, Chronic Kidney Disease Stage 3b",
    pastMedicalHistory: ["Type 2 diabetes (8 years)", "Chronic kidney disease", "Hyperlipidaemia"],
    currentMedications: ["Atorvastatin 20 mg once daily", "Gliclazide 80 mg once daily"],
    newPrescription: { drug: "Metformin", dose: "1000 mg", route: "Oral", frequency: "Twice daily" },
    allergies: "No known drug allergies (NKDA)",
    pregnancyStatus: "Not applicable",
    vitals: { bp: "142/88 mmHg", hr: "80 bpm", rr: "15/min", temp: "36.7°C", spo2: "98%" },
    labs: {
      "Serum Creatinine": "2.1 mg/dL",
      "Creatinine Clearance": "27 mL/min",
      eGFR: "28 mL/min/1.73m²",
      "Liver Function": "Within normal limits",
      "Blood Glucose": "9.8 mmol/L (random)",
      "HbA1c": "8.4%",
    },
    clinicalNotes:
      "Referred from outpatient diabetes clinic for glycaemic control. Metformin initiated at standard adult dose without renal function being cross-checked against the most recent labs.",
    aiReport: {
      riskScore: 76,
      priority: "High",
      confidence: 91,
      interactions: [
        {
          drugs: "Metformin + eGFR 28 mL/min/1.73m²",
          severity: "Major",
          mechanism:
            "Metformin is renally cleared. At eGFR below 30, accumulation significantly raises the risk of lactic acidosis — a rare but life-threatening adverse effect carrying an FDA black box warning.",
          recommendation:
            "Metformin is generally not recommended at eGFR < 30. If initiated at all, this should only occur with specialist input; the prescribed dose (1000 mg BD) is inappropriate for this renal function.",
        },
      ],
      alternatives: [
        "DPP-4 inhibitor (e.g., linagliptin, no renal dose adjustment needed) added to existing gliclazide",
        "SGLT2 inhibitor — caution advised below eGFR 30 depending on specific agent; specialist input recommended",
      ],
      monitoring: [
        "Recheck eGFR before any metformin initiation or continuation",
        "Watch for signs of lactic acidosis: unusual muscle pain, difficulty breathing, abdominal discomfort",
        "Trend HbA1c every 3 months once therapy is stabilised",
      ],
      counsellingPoints: [
        "This particular medication may not be suitable given current kidney function",
        "Report unusual muscle pain, breathlessness, or severe stomach discomfort immediately",
        "Kidney function will need to be rechecked regularly regardless of which medicine is chosen",
      ],
    },
    finalRecommendation: {
      action: "Do Not Dispense",
      reasoning:
        "eGFR of 28 mL/min/1.73m² falls below the threshold at which metformin carries a black-box lactic acidosis risk. This prescription should be returned to the prescriber for a renally-appropriate alternative before any dispensing occurs.",
    },
  },
  {
    id: "okoye",
    name: "Mrs. C.O",
    age: 29,
    sex: "Female",
    weight: "71 kg",
    height: "165 cm",
    diagnosis: "Urinary tract infection, pregnancy (28 weeks gestation)",
    pastMedicalHistory: ["Currently pregnant — 28 weeks gestation", "No significant past medical history"],
    currentMedications: ["Prenatal multivitamin", "Ferrous sulfate 200 mg once daily"],
    newPrescription: { drug: "Ciprofloxacin", dose: "500 mg", route: "Oral", frequency: "Twice daily for 7 days" },
    allergies: "No known drug allergies (NKDA)",
    pregnancyStatus: "Pregnant — 28 weeks gestation",
    vitals: { bp: "118/74 mmHg", hr: "88 bpm", rr: "16/min", temp: "37.5°C", spo2: "99%" },
    labs: {
      "Serum Creatinine": "0.6 mg/dL",
      "Creatinine Clearance": "110 mL/min",
      eGFR: ">90 mL/min/1.73m²",
      "Liver Function": "Within normal limits",
      "Blood Glucose": "5.2 mmol/L",
    },
    clinicalNotes:
      "Presented with dysuria and suprapubic discomfort. Urine culture pending. Prescribed ciprofloxacin at the walk-in clinic without pregnancy status being flagged in the system.",
    aiReport: {
      riskScore: 88,
      priority: "High",
      confidence: 96,
      interactions: [
        {
          drugs: "Ciprofloxacin + Pregnancy (28 weeks)",
          severity: "Major",
          mechanism:
            "Fluoroquinolones are generally avoided in pregnancy due to animal studies showing arthropathy (cartilage damage) risk in the developing fetus. Safer, well-studied alternatives exist for uncomplicated UTI in pregnancy.",
          recommendation:
            "Do not dispense. Recommend a pregnancy-appropriate first-line agent and flag pregnancy status clearly in the patient record.",
        },
      ],
      alternatives: [
        "Nitrofurantoin 100 mg twice daily for 5-7 days (first-line in pregnancy, avoid only near term at 36+ weeks)",
        "Cephalexin 500 mg twice daily for 5-7 days (safe in pregnancy)",
      ],
      monitoring: [
        "Confirm urine culture and sensitivity results once available",
        "Ensure pregnancy status is flagged prominently in the dispensing system",
        "Routine antenatal follow-up for infection resolution",
      ],
      counsellingPoints: [
        "This particular antibiotic is not recommended during pregnancy",
        "A safer alternative will be provided that treats the infection just as effectively",
        "Complete the full course and attend follow-up antenatal appointments",
      ],
    },
    finalRecommendation: {
      action: "Do Not Dispense",
      reasoning:
        "Ciprofloxacin carries a well-established caution in pregnancy. Given safe, effective first-line alternatives exist for uncomplicated UTI in pregnancy, this prescription should be corrected with the prescriber rather than dispensed as written.",
    },
  },
  {
    id: "eze",
    name: "Mrs. G.E",
    age: 63,
    sex: "Female",
    weight: "66 kg",
    height: "158 cm",
    diagnosis: "Major depressive disorder, post-operative nausea",
    pastMedicalHistory: ["Major depressive disorder (on citalopram 2 years)", "Hypertension", "Recent cholecystectomy (2 days post-op)"],
    currentMedications: ["Citalopram 40 mg once daily", "Lisinopril 10 mg once daily", "Furosemide 20 mg once daily"],
    newPrescription: { drug: "Ondansetron", dose: "8 mg", route: "IV", frequency: "Every 8 hours as needed for nausea" },
    allergies: "No known drug allergies (NKDA)",
    pregnancyStatus: "Not applicable",
    vitals: { bp: "128/78 mmHg", hr: "92 bpm", rr: "18/min", temp: "37.2°C", spo2: "96%" },
    labs: {
      "Serum Creatinine": "0.9 mg/dL",
      "Creatinine Clearance": "68 mL/min",
      eGFR: "72 mL/min/1.73m²",
      "Liver Function": "Within normal limits",
      "Blood Glucose": "6.1 mmol/L",
      Potassium: "3.2 mmol/L (low)",
    },
    clinicalNotes:
      "Post-operative day 2 following laparoscopic cholecystectomy, experiencing nausea. Ondansetron prescribed for symptom control. Potassium is low, likely related to furosemide and post-operative fluid shifts.",
    aiReport: {
      riskScore: 71,
      priority: "Medium",
      confidence: 89,
      interactions: [
        {
          drugs: "Citalopram + Ondansetron",
          severity: "Moderate",
          mechanism:
            "Both citalopram and ondansetron prolong the QT interval. Combined use increases the risk of QT prolongation and torsades de pointes, an effect compounded here by this patient's low potassium (3.2 mmol/L) from furosemide use.",
          recommendation:
            "Correct hypokalaemia before or alongside administration. Consider an alternative antiemetic with lower QT risk, or use the lowest effective ondansetron dose with ECG monitoring.",
        },
      ],
      alternatives: [
        "Metoclopramide 10 mg (lower QT risk, caution with extrapyramidal effects in older adults)",
        "Domperidone (caution: also has some QT effect — assess overall risk individually)",
      ],
      monitoring: [
        "Correct serum potassium to within normal range before proceeding",
        "Consider baseline ECG given citalopram dose (40 mg) is already at the upper recommended limit for her age",
        "Monitor for palpitations, dizziness, or syncope",
      ],
      counsellingPoints: [
        "Report any palpitations, dizziness, or fainting immediately to nursing staff",
        "Potassium levels will be corrected alongside anti-nausea treatment",
        "This is a precaution, not a reason to withhold nausea relief entirely",
      ],
    },
    finalRecommendation: {
      action: "Dispense With Monitoring",
      reasoning:
        "The QT-prolongation risk is real but manageable: correct the potassium, use the lowest effective dose, and monitor. This does not need to be withheld outright, but should not be dispensed without addressing the electrolyte abnormality first.",
    },
  },
];

export function getCaseById(id) {
  return CASES.find((c) => c.id === id);
}
