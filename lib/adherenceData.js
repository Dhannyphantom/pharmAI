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

// Maps JS's Date.getDay() (0 = Sunday .. 6 = Saturday) onto the Mon..Sun
// order DAY_LABELS uses, so "today" always lines up with the real calendar
// instead of being hardcoded to whatever weekday the demo data happened to
// be written for.
export function getCurrentDayIndex() {
  const jsDay = new Date().getDay();
  return (jsDay + 6) % 7;
}

/**
 * `todayIndex` defaults to the real current weekday (Mon=0..Sun=6). Any
 * logged day AFTER today is treated as "not yet due" regardless of what
 * the static demo data says at that slot — so the weekly calendar always
 * reflects where we actually are in the real week, not a fixed Sat/Sun
 * cutoff, and totals only count days that have actually happened so far.
 */
export function computeAdherence(log, todayIndex = getCurrentDayIndex()) {
  const meds = Object.keys(log);
  let taken = 0, missed = 0, total = 0;
  const perMed = {};

  meds.forEach((med) => {
    const days = log[med];
    const maskedDays = days.map((d, i) => (i > todayIndex ? null : d));
    const takenDays = maskedDays.filter((d) => d === true).length;
    const missedDays = maskedDays.filter((d) => d === false).length;
    taken += takenDays;
    missed += missedDays;
    total += takenDays + missedDays;
    perMed[med] = {
      days: maskedDays,
      percent: takenDays + missedDays > 0 ? Math.round((takenDays / (takenDays + missedDays)) * 100) : 100,
    };
  });

  const overallPercent = total > 0 ? Math.round((taken / total) * 100) : 100;
  return { overallPercent, taken, missed, total, perMed, todayIndex };
}
