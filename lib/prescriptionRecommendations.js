// Suggests items a set of prescriptions implies but doesn't spell out.
// Prescribers typically write only the essential drug; a pharmacist is
// expected to know what else is needed to actually administer it.

const FLUID_NAMES = ["normal saline", "ringer's lactate", "ringers lactate", "dextrose", "iv fluid"];

// Powdered/vial antibiotics that need reconstitution before they can be given.
const RECONSTITUTION_DRUGS = ["ceftriaxone", "cefuroxime", "cefotaxime", "ampicillin", "flucloxacillin", "gentamicin", "vancomycin", "cefepime"];

function norm(s) {
  return (s || "").trim().toLowerCase();
}

function isFluid(name) {
  const n = norm(name);
  return FLUID_NAMES.some((f) => n.includes(f));
}

function isInjectableRoute(route) {
  const r = norm(route);
  if (!r) return false;
  return ["iv", "im", "sc", "intravenous", "intramuscular", "subcutaneous"].some((k) => r.includes(k));
}

/**
 * @param {Array<{drug:string, dose?:string, route?:string, consumable?:boolean}>} prescriptions
 * @returns {Array<{item:string, reason:string, common:boolean}>}
 */
export function getRecommendedAdditions(prescriptions) {
  const existingNames = prescriptions.map((p) => norm(p.drug));
  const has = (needle) => existingNames.some((n) => n.includes(needle));

  const recs = new Map();
  function suggest(item, reason, common = true) {
    const key = norm(item);
    if (has(key)) return;
    if (!recs.has(key)) recs.set(key, { item, reasons: new Set(), common: false });
    const rec = recs.get(key);
    rec.reasons.add(reason);
    rec.common = rec.common || common;
  }

  const drugItems = prescriptions.filter((p) => !p.consumable);
  const fluidItems = prescriptions.filter((p) => isFluid(p.drug));
  const injectableDrugs = drugItems.filter((p) => isInjectableRoute(p.route) && !isFluid(p.drug));

  // An IV cannula on its own can't deliver anything — it needs a giving set.
  if (has("iv cannula") && !has("iv giving set") && !has("giving set")) {
    suggest("IV Giving Set", "An IV cannula has been prescribed — a giving set is needed to actually administer fluids or medications through it.");
  }

  // A prescribed IV fluid needs both a cannula (for access) and a giving set (to run it).
  for (const f of fluidItems) {
    suggest("IV Giving Set", `Needed to administer ${f.drug} as an IV infusion.`);
    if (!has("iv cannula")) {
      suggest("IV Cannula (appropriate gauge)", `IV access is needed to give ${f.drug}.`);
    }
  }

  // Any injectable drug needs a syringe and needle to draw up and give it.
  if (injectableDrugs.length > 0 && !has("syringe")) {
    const names = injectableDrugs.map((d) => `${d.drug} (${(d.route || "").toUpperCase()})`).join(", ");
    suggest("Syringes & Needles (appropriate size)", `Needed to draw up and administer: ${names}.`);
  }

  // IV drugs (not fluids) also need cannula access.
  const ivDrugs = injectableDrugs.filter((d) => norm(d.route).includes("iv"));
  if (ivDrugs.length > 0 && !has("iv cannula")) {
    const names = ivDrugs.map((d) => d.drug).join(", ");
    suggest("IV Cannula (appropriate gauge)", `IV access is needed to give: ${names}.`);
  }

  // Powdered antibiotics need a diluent before they can be drawn up at all.
  for (const d of injectableDrugs) {
    if (RECONSTITUTION_DRUGS.some((rd) => norm(d.drug).includes(rd)) && !has("water for injection")) {
      suggest("Water for Injection (diluent)", `${d.drug} is supplied as a powder and must be reconstituted before it can be given.`);
    }
  }

  return [...recs.values()]
    .map((r) => ({ item: r.item, reason: [...r.reasons].join(" "), common: r.common }));
}
