export const CHALLENGE_CASES = [
  {
    id: 1,
    prescription: "Fluconazole 150mg single dose for vaginal thrush, in a patient stable on Warfarin for atrial fibrillation",
    correctAnswer: "CONSULT DOCTOR",
    aiDetected:
      "Even as a single dose, fluconazole is a potent CYP2C9 inhibitor — the same enzyme that clears warfarin. INR can rise significantly within days of just one dose, not only with a full course.",
    pharmacistReasoning:
      "It's tempting to wave this through because it's 'just one tablet,' but fluconazole's interaction with warfarin doesn't require repeated dosing to matter. The safe move is to flag it to the prescriber and arrange an INR recheck within the week, not dispense and assume a single dose is too small to count.",
    points: 15,
  },
  {
    id: 2,
    prescription: "Trimethoprim/sulfamethoxazole (Co-trimoxazole) for a UTI, in a patient on weekly Methotrexate 15mg for rheumatoid arthritis",
    correctAnswer: "NO",
    aiDetected:
      "Co-trimoxazole displaces methotrexate from protein binding and inhibits its renal clearance, while both drugs independently suppress folate metabolism — the combination carries a well-documented risk of severe, sometimes fatal bone marrow suppression.",
    pharmacistReasoning:
      "This one is genuinely easy to miss because the two drugs are prescribed for completely unrelated reasons by different specialists. It's not a 'monitor and proceed' situation — this combination should not be dispensed; an alternative antibiotic (e.g. nitrofurantoin) should be sought instead.",
    points: 20,
  },
  {
    id: 3,
    prescription: "Ibuprofen 400mg three times daily as needed, for a 68-year-old with Stage 3 CKD (eGFR 45) already taking Lisinopril and Furosemide",
    correctAnswer: "NO",
    aiDetected:
      "This is the 'triple whammy' — an ACE inhibitor, a diuretic, and an NSAID together significantly raise the risk of acute kidney injury by independently reducing renal perfusion and blood flow through three different mechanisms.",
    pharmacistReasoning:
      "None of these three drugs is dangerous alone, and each is a completely standard prescription — that's exactly why this combination gets missed. Recommend paracetamol first-line and flag the combination to the prescriber rather than dispensing.",
    points: 20,
  },
  {
    id: 4,
    prescription: "St John's Wort, bought over the counter, by a kidney transplant patient stable on Tacrolimus",
    correctAnswer: "NO",
    aiDetected:
      "St John's Wort strongly induces CYP3A4, the enzyme that metabolises tacrolimus. It can drop tacrolimus levels enough to risk acute transplant rejection — a herbal product, not a prescription drug, causing a life-threatening interaction.",
    pharmacistReasoning:
      "Patients often don't think to mention herbal or over-the-counter products when asked 'what medicines are you taking' — and this is precisely the kind of interaction a purely prescription-focused check would miss entirely. Strongly advise against it and inform the transplant team.",
    points: 20,
  },
  {
    id: 5,
    prescription: "Codeine linctus for a persistent cough, requested for a breastfeeding mother two weeks postpartum",
    correctAnswer: "NO",
    aiDetected:
      "Codeine is a prodrug converted to morphine by CYP2D6. In ultra-rapid metabolisers, breast milk morphine concentrations can reach dangerous levels for the infant — this is exactly why codeine is now avoided in breastfeeding, following documented infant deaths.",
    pharmacistReasoning:
      "Codeine used to be considered a routine, 'mild' choice for breastfeeding mothers, so this is a case where outdated intuition actively works against the right answer. Recommend paracetamol or a non-codeine alternative instead.",
    points: 20,
  },
  {
    id: 6,
    prescription: "Rivaroxaban 20mg once daily, newly started for atrial fibrillation in a patient with eGFR 12 mL/min/1.73m²",
    correctAnswer: "NO",
    aiDetected:
      "Rivaroxaban is substantially renally cleared. At an eGFR this low, drug accumulation significantly raises bleeding risk, and most direct oral anticoagulants are considered contraindicated or require specialist input below eGFR 15.",
    pharmacistReasoning:
      "DOACs are often assumed to be the 'simpler, safer' alternative to warfarin, which can make prescribers less vigilant about renal function specifically for this drug class. This needs specialist input — likely warfarin with careful monitoring, or a much-reduced-dose strategy under nephrology guidance.",
    points: 15,
  },
  {
    id: 7,
    prescription: "Amiodarone 200mg once daily added for a patient already stable on sotalol for arrhythmia",
    correctAnswer: "CONSULT DOCTOR",
    aiDetected:
      "Both amiodarone and sotalol are antiarrhythmics that prolong the QT interval. Combined use significantly raises the risk of torsades de pointes, a life-threatening arrhythmia.",
    pharmacistReasoning:
      "This isn't automatically wrong — cardiology sometimes intentionally overlaps therapy short-term during a medication switch — but it's unusual and risky enough that it needs direct confirmation with the prescriber before dispensing, rather than an outright refusal or an automatic fill.",
    points: 15,
  },
  {
    id: 8,
    prescription: "Amoxicillin 500mg three times daily for community-acquired pneumonia, in a fit 30-year-old with a clearly documented penicillin allergy history that turns out to be childhood eczema, unrelated to any drug reaction",
    correctAnswer: "YES",
    aiDetected:
      "The chart flags a 'penicillin allergy,' but on review the documented reaction is childhood eczema with no temporal link to any antibiotic — this doesn't meet clinical criteria for a true penicillin allergy.",
    pharmacistReasoning:
      "This is the opposite trap: over-cautious systems (and people) sometimes withhold a perfectly good first-line antibiotic because of a poorly characterised 'allergy' label. Reading the actual documented reaction — not just the flag — is what allows this to be safely dispensed with routine counselling.",
    points: 20,
  },
];
