// Procedure catalog. `checklist` is the standard supply list. `complicationItems`
// are additional items that MAY be needed depending on how the case goes —
// each with a short justification, and `common: true` for the ones worth
// preparing for by default rather than treating as edge cases.

export const PROCEDURES = [
  {
    id: "cs",
    name: "Elective Caesarean Section",
    department: "O&G",
    checklist: [
      { item: "Spinal anaesthesia set", qty: 1 },
      { item: "Ceftriaxone 1g (prophylaxis)", qty: 1 },
      { item: "Oxytocin 10 IU ampoules", qty: 4 },
      { item: "Sterile gauze packs", qty: 6 },
      { item: "Suture set (Vicryl 1-0)", qty: 2 },
      { item: "IV fluids (Normal Saline 1L)", qty: 3 },
    ],
    complicationItems: [
      { item: "Tranexamic acid 1g", reason: "For postpartum haemorrhage — bleeding beyond expected blood loss", common: true },
      { item: "Blood cross-match units", reason: "In case of significant haemorrhage requiring transfusion", common: true },
      { item: "Additional Oxytocin 10 IU", reason: "Uterine atony not responding to the initial dose", common: true },
      { item: "Misoprostol 400mcg", reason: "Second-line uterotonic if oxytocin alone is insufficient", common: false },
      { item: "General anaesthesia set", reason: "Conversion from spinal to general anaesthesia if spinal fails or case becomes urgent", common: false },
    ],
  },
  {
    id: "hyst",
    name: "Total Abdominal Hysterectomy",
    department: "O&G",
    checklist: [
      { item: "General anaesthesia set", qty: 1 },
      { item: "Cefuroxime 1.5g (prophylaxis)", qty: 1 },
      { item: "Sterile gauze packs", qty: 8 },
      { item: "Suture set (Vicryl 1-0 & 2-0)", qty: 3 },
      { item: "IV fluids (Normal Saline 1L)", qty: 2 },
      { item: "Blood cross-match units on standby", qty: 2 },
    ],
    complicationItems: [
      { item: "Additional blood cross-match units", reason: "Adhesions or vascular injury increasing intraoperative blood loss", common: true },
      { item: "Tranexamic acid 1g", reason: "For excessive intraoperative bleeding", common: true },
      { item: "Urinary catheter set", reason: "Bladder injury requiring prolonged catheterisation", common: false },
      { item: "Metronidazole IV", reason: "Extended antibiotic cover if bowel is entered", common: false },
    ],
  },
  {
    id: "d&c",
    name: "Dilatation & Curettage",
    department: "O&G",
    checklist: [
      { item: "Local/short general anaesthesia set", qty: 1 },
      { item: "Misoprostol 400mcg", qty: 2 },
      { item: "Sterile gauze packs", qty: 3 },
      { item: "IV fluids (Normal Saline 1L)", qty: 1 },
    ],
    complicationItems: [
      { item: "Oxytocin 10 IU ampoules", reason: "Heavier than expected uterine bleeding post-procedure", common: true },
      { item: "Ceftriaxone 1g", reason: "Signs of infection or retained products", common: false },
    ],
  },
  {
    id: "ectopic",
    name: "Emergency Ectopic Pregnancy Surgery",
    department: "O&G",
    checklist: [
      { item: "General anaesthesia set", qty: 1 },
      { item: "Blood cross-match units on standby", qty: 3 },
      { item: "Sterile gauze packs", qty: 8 },
      { item: "Suture set (Vicryl 1-0)", qty: 2 },
      { item: "IV fluids (Normal Saline 1L)", qty: 3 },
      { item: "Tranexamic acid 1g", qty: 2 },
    ],
    complicationItems: [
      { item: "Additional blood cross-match units", reason: "Haemoperitoneum often exceeds initial estimate in ruptured ectopic", common: true },
      { item: "Inotrope/vasopressor set", reason: "Haemodynamic instability from significant blood loss", common: false },
    ],
  },
  {
    id: "appendicectomy",
    name: "Appendicectomy",
    department: "General Surgery",
    checklist: [
      { item: "General anaesthesia set", qty: 1 },
      { item: "Ceftriaxone 1g", qty: 1 },
      { item: "Sterile gauze packs", qty: 4 },
      { item: "Suture set", qty: 1 },
    ],
    complicationItems: [
      { item: "Metronidazole IV", reason: "Perforated or gangrenous appendix — broader anaerobic cover needed", common: true },
      { item: "Additional sterile gauze packs", reason: "Peritoneal contamination requiring more extensive lavage", common: true },
      { item: "Drain set", reason: "Localized abscess found intraoperatively", common: false },
    ],
  },
  {
    id: "fracture-fixation",
    name: "Closed Fracture Fixation",
    department: "Orthopaedics",
    checklist: [
      { item: "Local anaesthesia set", qty: 1 },
      { item: "Sterile gauze packs", qty: 3 },
      { item: "Cefuroxime 1.5g", qty: 1 },
    ],
    complicationItems: [
      { item: "General anaesthesia set", reason: "Conversion to general anaesthesia if closed reduction fails or is poorly tolerated", common: true },
      { item: "Blood cross-match units", reason: "Long-bone fractures can cause significant occult blood loss", common: false },
    ],
  },
  {
    id: "tonsillectomy",
    name: "Tonsillectomy",
    department: "ENT",
    checklist: [
      { item: "General anaesthesia set", qty: 1 },
      { item: "Sterile gauze packs", qty: 3 },
    ],
    complicationItems: [
      { item: "Tranexamic acid 1g", reason: "Post-tonsillectomy bleeding is a well-recognised complication", common: true },
      { item: "Adrenaline (topical/injectable)", reason: "Local haemostasis for active bleeding at the tonsillar bed", common: true },
    ],
  },
  {
    id: "perforated-viscus",
    name: "Perforated Viscus Repair",
    department: "General Surgery",
    checklist: [
      { item: "General anaesthesia set", qty: 1 },
      { item: "Blood cross-match units", qty: 2 },
      { item: "Ceftriaxone 1g", qty: 1 },
      { item: "Metronidazole IV", qty: 1 },
      { item: "Suture set", qty: 2 },
    ],
    complicationItems: [
      { item: "Additional blood cross-match units", reason: "Extensive peritoneal contamination and sepsis increase transfusion needs", common: true },
      { item: "Drain set", reason: "Abscess or ongoing contamination requiring drainage", common: true },
      { item: "Inotrope/vasopressor set", reason: "Septic shock from peritoneal contamination", common: false },
    ],
  },
];

// NHIS / Payment tracker — supplied vs billed vs paid vs outstanding, per item.
export const PAYMENT_TRACKER = [
  { id: "PT-101", item: "Ceftriaxone 1g (prophylaxis)", procedure: "Elective Caesarean Section", supplied: 12, billed: 12, paid: 10, outstanding: 2 },
  { id: "PT-102", item: "Suture set (Vicryl 1-0)", procedure: "Total Abdominal Hysterectomy", supplied: 8, billed: 8, paid: 8, outstanding: 0 },
  { id: "PT-103", item: "Blood cross-match units", procedure: "Emergency Ectopic Pregnancy Surgery", supplied: 6, billed: 4, paid: 4, outstanding: 2 },
  { id: "PT-104", item: "Oxytocin 10 IU ampoules", procedure: "Elective Caesarean Section", supplied: 20, billed: 20, paid: 16, outstanding: 4 },
  { id: "PT-105", item: "Misoprostol 400mcg", procedure: "Dilatation & Curettage", supplied: 10, billed: 6, paid: 6, outstanding: 0 },
];

export function getProcedureById(id) {
  return PROCEDURES.find((p) => p.id === id);
}

export function getProcedureByName(name) {
  return PROCEDURES.find((p) => p.name === name);
}
