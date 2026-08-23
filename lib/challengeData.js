// Question pool for "AI vs Pharmacist". Deliberately balanced across
// correct answers (YES / NO / CONSULT DOCTOR) so the correct choice can't
// be guessed from a pattern — each scenario is designed to be genuinely
// easy to get wrong, including cases where the "obviously cautious" answer
// (NO) is actually the wrong call.

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
  {
    id: 9,
    prescription: "Sumatriptan 50mg as needed for migraine, newly prescribed to a patient stable on Sertraline 100mg for depression",
    correctAnswer: "YES",
    aiDetected:
      "Triptans and SSRIs both increase serotonin activity, and product labelling carries a warning about serotonin syndrome with this combination.",
    pharmacistReasoning:
      "This looks like a classic 'red flag stack' at first glance, but the actual reported incidence of serotonin syndrome with triptan-SSRI combinations is very low, and major headache guidelines consider the combination acceptable with standard counselling on symptoms to watch for. Reflexively refusing a first-line migraine treatment here would deny effective care over a theoretical risk real-world evidence doesn't strongly support — dispense with brief safety-netting advice.",
    points: 20,
  },
  {
    id: 10,
    prescription: "Amiodarone 200mg once daily newly started for atrial fibrillation, in a patient already stable on Digoxin 125mcg once daily",
    correctAnswer: "CONSULT DOCTOR",
    aiDetected:
      "Amiodarone inhibits P-glycoprotein and reduces renal clearance of digoxin, commonly raising digoxin levels by 70-100% within days to weeks.",
    pharmacistReasoning:
      "This combination is used deliberately in cardiology, so an outright refusal isn't right — but dispensing the digoxin dose unchanged risks toxicity. The correct move is to flag it so the prescriber can proactively reduce the digoxin dose (or hold it) and arrange a level check, rather than the pharmacy assuming a dose change on the prescriber's behalf.",
    points: 20,
  },
  {
    id: 11,
    prescription: "Ibuprofen 400mg for 3 days for an ankle sprain, requested by a healthy 40-year-old already taking daily low-dose Aspirin 75mg for cardiovascular prevention",
    correctAnswer: "YES",
    aiDetected:
      "Ibuprofen can competitively block aspirin's irreversible effect on platelets if the two are taken too close together, theoretically blunting aspirin's cardioprotective benefit.",
    pharmacistReasoning:
      "The interaction is real, but for a short, occasional course in a low cardiovascular-risk patient the practical fix is timing, not withholding treatment: take the aspirin at least 2 hours before the ibuprofen dose (or use paracetamol if simpler). Refusing a short NSAID course for a sprain over this is overly cautious and leaves the patient in pain unnecessarily.",
    points: 15,
  },
  {
    id: 12,
    prescription: "A new Ferrous Sulfate 200mg once-daily iron supplement, requested to be taken alongside a patient's existing Levothyroxine 100mcg dose each morning for convenience",
    correctAnswer: "YES",
    aiDetected:
      "Iron salts bind levothyroxine in the gut and can reduce its absorption by up to 60% if taken at the same time.",
    pharmacistReasoning:
      "This is a counselling issue, not a reason to withhold either medication: separate the two doses by at least 4 hours (e.g. levothyroxine on waking, iron at lunch or dinner), and thyroid function can be monitored as usual. Dispensing both with clear timing instructions is correct — an interaction doesn't automatically mean 'do not dispense'.",
    points: 15,
  },
  {
    id: 13,
    prescription: "A combined oral contraceptive pill, newly requested by a 32-year-old woman who smokes 10 cigarettes a day and has well-controlled migraine without aura",
    correctAnswer: "CONSULT DOCTOR",
    aiDetected:
      "Smoking plus combined hormonal contraception raises cardiovascular and stroke risk, and this risk compounds further with any migraine history, even without the 'with aura' red flag that makes combined pills absolutely contraindicated.",
    pharmacistReasoning:
      "She isn't over the hard 35-and-smoking cutoff, and migraine without aura isn't an absolute contraindication either — so this isn't a flat refusal. But two risk factors stacking together is exactly the kind of borderline case that should be discussed with the prescriber, who may prefer a progestogen-only or non-hormonal option instead.",
    points: 20,
  },
  {
    id: 14,
    prescription: "Metoclopramide 10mg three times daily requested for a 20-year-old woman with acute nausea, no other history",
    correctAnswer: "YES",
    aiDetected:
      "Metoclopramide carries a known risk of extrapyramidal reactions and acute dystonia, with young women at comparatively higher risk than other groups.",
    pharmacistReasoning:
      "The risk is real but manageable — regulatory guidance restricts metoclopramide to short courses (5 days or less) rather than avoiding it in young women altogether. Dispense with clear counselling on the treatment duration limit and what a dystonic reaction looks like (e.g. involuntary muscle spasms, especially of the face/neck) so she knows to seek help if it occurs.",
    points: 15,
  },
  {
    id: 15,
    prescription: "Tamsulosin 400mcg once daily newly started for benign prostatic hyperplasia, in a patient who occasionally uses Sildenafil 50mg for erectile dysfunction",
    correctAnswer: "CONSULT DOCTOR",
    aiDetected:
      "Both tamsulosin (an alpha-blocker) and sildenafil (a PDE5 inhibitor) can independently cause vasodilation and hypotension; together they raise the risk of symptomatic low blood pressure and dizziness, particularly with the first few doses.",
    pharmacistReasoning:
      "Both drugs are commonly used together in practice, so this isn't a straightforward refusal — but the prescriber should be looped in to advise on dose timing (e.g. taking sildenafil several hours apart from tamsulosin) and to counsel on rising slowly from sitting or lying, rather than the pharmacy silently dispensing both without that conversation happening.",
    points: 15,
  },
  {
    id: 16,
    prescription: "Spironolactone 25mg newly added for heart failure, in a patient already on Lisinopril 10mg who reports regularly using a potassium-based salt substitute at home",
    correctAnswer: "NO",
    aiDetected:
      "Spironolactone (potassium-sparing) plus an ACE inhibitor plus a potassium-based salt substitute is a triple hyperkalaemia risk — three separate mechanisms all pushing potassium upward at once.",
    pharmacistReasoning:
      "Each element alone might be manageable, but stacking all three is exactly the kind of combination that gets missed because no single medicine looks dangerous in isolation. This needs potassium levels checked and the salt substitute addressed with the patient before dispensing — recommend holding until a baseline potassium is confirmed safe.",
    points: 20,
  },
  {
    id: 17,
    prescription: "Domperidone 10mg three times daily requested off-label by a breastfeeding mother to increase low milk supply, with no personal or family cardiac history",
    correctAnswer: "CONSULT DOCTOR",
    aiDetected:
      "Domperidone carries a class-wide cardiac warning (QT prolongation and rare sudden cardiac events) that led regulators in several countries to restrict its use, independent of whether a particular patient has known cardiac risk factors.",
    pharmacistReasoning:
      "The absence of cardiac history doesn't make this automatically fine — the restrictions on domperidone for milk supply exist because the affected cases weren't reliably predictable in advance. This is a case for discussion with the prescriber or a lactation specialist about risk, dose, and duration, rather than a same-day dispense or an outright refusal.",
    points: 20,
  },
  {
    id: 18,
    prescription: "Sodium Valproate 500mg twice daily continued unchanged for epilepsy, in a 19-year-old woman newly starting a combined oral contraceptive for cycle control",
    correctAnswer: "CONSULT DOCTOR",
    aiDetected:
      "Valproate is a significant human teratogen, and regulatory pregnancy-prevention programmes require women of childbearing potential on valproate to have highly effective contraception and documented annual risk acknowledgement — this isn't primarily a drug-drug interaction question.",
    pharmacistReasoning:
      "The real issue here isn't the contraceptive pill interacting with valproate (it doesn't, meaningfully) — it's confirming she's actually enrolled in the pregnancy-prevention requirements that come with any valproate prescription in a woman of childbearing age. That conversation needs to happen with the prescriber or specialist team, not be assumed complete.",
    points: 20,
  },
];

// Fisher–Yates shuffle — used both to pick a random session and to
// randomise the on-screen order of the YES/NO/CONSULT buttons, so neither
// the question order nor the answer position forms a learnable pattern.
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Draws a fresh random set of `count` questions from the full pool — used
// to start/restart a session so every playthrough differs.
export function pickRandomChallengeQuestions(count = 5) {
  return shuffleArray(CHALLENGE_CASES).slice(0, Math.min(count, CHALLENGE_CASES.length));
}
