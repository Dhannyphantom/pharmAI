export const CHALLENGE_CASES = [
  {
    id: 1,
    prescription: "Amoxicillin 500 mg three times daily for a patient with documented penicillin anaphylaxis",
    correctAnswer: "NO",
    aiDetected:
      "Allergy conflict detected: the patient's chart lists a documented history of anaphylaxis to penicillin. Amoxicillin is a penicillin-class antibiotic and cross-reacts directly.",
    pharmacistReasoning:
      "This is an absolute contraindication, not a relative caution. Anaphylaxis history means even a single dose could be life-threatening. This prescription must be stopped and an alternative antibiotic class selected — never dispense.",
    points: 10,
  },
  {
    id: 2,
    prescription: "Sildenafil 50 mg as needed, for a patient also taking isosorbide mononitrate for angina",
    correctAnswer: "NO",
    aiDetected:
      "Major interaction: PDE5 inhibitors combined with nitrates can cause a severe, life-threatening drop in blood pressure.",
    pharmacistReasoning:
      "This combination is an absolute contraindication. The hypotensive effect can be profound and rapid. The prescriber should be contacted immediately — this is not a 'monitor and proceed' situation.",
    points: 10,
  },
  {
    id: 3,
    prescription: "Ibuprofen 400 mg three times daily as needed, for a fit and well 27-year-old with a mild ankle sprain, no other medical history",
    correctAnswer: "YES",
    aiDetected:
      "No allergies, interactions, or contraindications detected. Renal and GI risk factors are minimal for a healthy young adult on a short course.",
    pharmacistReasoning:
      "This is a straightforward, appropriate prescription for a healthy patient with no risk factors. Standard counselling on taking with food and short-term use is all that's needed — safe to dispense.",
    points: 10,
  },
  {
    id: 4,
    prescription: "Amiodarone 200 mg once daily added for a patient already stable on sotalol for arrhythmia",
    correctAnswer: "CONSULT DOCTOR",
    aiDetected:
      "Duplicate therapeutic class and QT-prolongation risk: both amiodarone and sotalol are antiarrhythmics that prolong the QT interval. Combined use significantly raises torsades de pointes risk.",
    pharmacistReasoning:
      "This isn't automatically wrong — sometimes cardiology intentionally overlaps therapy short-term — but it's unusual enough, and risky enough, that it needs direct confirmation with the prescriber before dispensing, rather than an outright refusal or automatic fill.",
    points: 10,
  },
  {
    id: 5,
    prescription: "Paracetamol 1 g four times daily for a patient with well-controlled mild hypertension, no liver disease",
    correctAnswer: "YES",
    aiDetected:
      "No interactions, allergies, or contraindications identified. Dose is within the standard maximum daily limit.",
    pharmacistReasoning:
      "A textbook-appropriate, standard-dose prescription for a patient with no relevant risk factors. Safe to dispense with routine counselling.",
    points: 10,
  },
];
