// Simulated medication adherence tracking for the Patient Portal.
// Each patient has a 7-day dose log per medication; `computeAdherence`
// derives the headline percentage, missed-dose count, and per-medicine
// breakdown from it. This is illustrative demo data, not connected to any
// real dispensing or ingestion-tracking system.

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// true = taken, false = missed, null = not yet due (future day this week)
const ADHERENCE_BY_ID = {
  bello: {
    "Warfarin 5mg": [true, true, true, false, true, true, null],
    "Bisoprolol 5mg": [true, true, true, true, true, true, null],
    "Amlodipine 5mg": [true, true, false, true, true, true, null],
  },
  adekunle: {
    "Atorvastatin 20mg": [true, true, true, true, false, true, null],
    "Gliclazide 80mg": [true, false, true, true, true, false, null],
  },
  okoye: {
    "Prenatal Multivitamin": [true, true, true, true, true, true, null],
    "Ferrous Sulfate 200mg": [true, true, false, true, true, true, null],
  },
  eze: {
    "Citalopram 40mg": [true, true, true, true, true, true, null],
    "Lisinopril 10mg": [false, true, true, true, false, true, null],
    "Furosemide 20mg": [true, true, true, true, true, true, null],
  },
  chukwu: {
    "Ferrous Sulfate 200mg": [true, true, true, true, true, true, null],
    "Antenatal Multivitamin": [true, true, true, false, true, true, null],
  },
};

export function getAdherenceLog(patientId) {
  return ADHERENCE_BY_ID[patientId] || {};
}

export function computeAdherence(log) {
  const meds = Object.keys(log);
  let taken = 0, missed = 0, total = 0;
  const perMed = {};

  meds.forEach((med) => {
    const days = log[med];
    const takenDays = days.filter((d) => d === true).length;
    const missedDays = days.filter((d) => d === false).length;
    taken += takenDays;
    missed += missedDays;
    total += takenDays + missedDays;
    perMed[med] = {
      days,
      percent: takenDays + missedDays > 0 ? Math.round((takenDays / (takenDays + missedDays)) * 100) : 100,
    };
  });

  const overallPercent = total > 0 ? Math.round((taken / total) * 100) : 100;
  return { overallPercent, taken, missed, total, perMed };
}
