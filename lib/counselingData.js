export const COUNSELING_DRUGS = [
  {
    id: "metformin",
    name: "Metformin",
    explanation:
      "Metformin helps your body respond better to insulin and lowers the amount of sugar your liver releases into your blood. It's one of the most widely used medicines for type 2 diabetes.",
    howToTake: "Take with or just after meals to reduce stomach upset. Swallow tablets whole — do not crush extended-release forms.",
    commonSideEffects: ["Nausea", "Diarrhoea", "Stomach discomfort", "Metallic taste"],
    seriousSideEffects: ["Unusual muscle pain, breathing difficulty, or severe tiredness (rare, may signal lactic acidosis) — seek urgent care"],
    lifestyleAdvice: ["Limit alcohol — combined with metformin it raises the risk of lactic acidosis", "Stay well hydrated, especially during illness"],
    missedDose: "Take it as soon as you remember unless it's almost time for your next dose — then skip it. Never take a double dose.",
    storage: "Store at room temperature, away from moisture and direct sunlight.",
    monitoring: "Periodic kidney function and vitamin B12 checks, as long-term use can lower B12 levels.",
    clinical: {
      drugClass: "Biguanide (antidiabetic)",
      strengths: "500mg, 850mg, 1000mg tablets; extended-release 500mg/750mg/1000mg",
      adultDosing: "Start 500mg once/twice daily with food, titrate up to 2000mg/day in divided doses",
      contraindications: "eGFR < 30 mL/min/1.73m², acute illness with risk of renal hypoperfusion",
      keyInteractions: "Iodinated contrast media (temporary hold), alcohol (lactic acidosis risk)",
    },
  },
  {
    id: "insulin",
    name: "Insulin",
    explanation:
      "Insulin is a hormone that helps sugar move from your blood into your cells for energy. This injectable version replaces or supplements what your body isn't making enough of.",
    howToTake: "Inject under the skin (subcutaneously) at the site and time your care team recommends. Rotate injection sites to avoid lumps under the skin.",
    commonSideEffects: ["Injection site redness or irritation", "Weight gain"],
    seriousSideEffects: ["Signs of low blood sugar: shakiness, sweating, confusion, fast heartbeat — treat immediately with fast-acting sugar"],
    lifestyleAdvice: ["Never skip meals after taking a dose meant to cover food", "Carry a fast-acting sugar source at all times", "Check blood sugar as advised, especially before driving"],
    missedDose: "Follow your care team's specific instructions — do not simply double up, as this can cause dangerous low blood sugar.",
    storage: "Store unopened insulin in the refrigerator. Once in use, most types can be kept at room temperature for the period stated on the label — check your specific product.",
    monitoring: "Regular blood glucose monitoring and periodic HbA1c checks.",
    clinical: {
      drugClass: "Exogenous insulin (antidiabetic)",
      strengths: "100 units/mL pen or vial (rapid, short, intermediate, and long-acting formulations)",
      adultDosing: "Individualised, weight- and regimen-based; typically 0.2-1 unit/kg/day split by regimen",
      contraindications: "Episodes of hypoglycaemia unless dose/timing adjusted; caution in renal/hepatic impairment (dose adjustment)",
      keyInteractions: "Beta-blockers can mask hypoglycaemia symptoms; corticosteroids raise glucose and antagonise effect",
    },
  },
  {
    id: "warfarin",
    name: "Warfarin",
    explanation:
      "Warfarin is a blood thinner that helps prevent harmful clots from forming, which can reduce the risk of stroke and other serious complications.",
    howToTake: "Take at the same time each day, exactly as prescribed. Your dose may change based on regular blood test (INR) results.",
    commonSideEffects: ["Mild bruising"],
    seriousSideEffects: ["Unusual bleeding, blood in urine or stool, severe headache, heavy bruising — seek urgent medical attention"],
    lifestyleAdvice: [
      "Keep your diet consistent — sudden changes in leafy green vegetable intake affect vitamin K and can change how warfarin works",
      "Avoid starting or stopping other medicines, including over-the-counter products, without checking first",
      "Limit alcohol intake",
    ],
    missedDose: "Take it the same day if remembered. Never take a double dose to make up for a missed one — contact your care team if unsure.",
    storage: "Store at room temperature, away from light and moisture.",
    monitoring: "Regular INR blood tests are essential to keep your dose safe and effective.",
    clinical: {
      drugClass: "Vitamin K antagonist (anticoagulant)",
      strengths: "0.5mg, 1mg, 3mg, 5mg tablets",
      adultDosing: "Individualised, guided by INR; typical maintenance 2-10mg once daily",
      contraindications: "Active bleeding, severe liver disease, pregnancy (relative)",
      keyInteractions: "Numerous — antibiotics, NSAIDs, amiodarone, many herbal products all affect INR",
    },
  },
  {
    id: "enoxaparin",
    name: "Enoxaparin",
    explanation:
      "Enoxaparin is an injectable blood thinner used to prevent or treat harmful blood clots, often used after surgery or during hospital stays.",
    howToTake: "Injected under the skin, usually in the abdomen. Alternate sides with each injection and avoid rubbing the area afterward.",
    commonSideEffects: ["Bruising or irritation at the injection site"],
    seriousSideEffects: ["Unusual bleeding or bruising, blood in urine or stool — report immediately"],
    lifestyleAdvice: ["Avoid activities with a high risk of injury while on this medicine", "Tell every healthcare provider you see that you're taking this medicine before any procedure"],
    missedDose: "Contact your care team as soon as possible for guidance — timing matters with this medicine.",
    storage: "Store pre-filled syringes at room temperature, away from light.",
    monitoring: "Platelet counts may be checked periodically, especially with longer courses.",
    clinical: {
      drugClass: "Low-molecular-weight heparin (anticoagulant)",
      strengths: "20mg, 40mg, 60mg, 80mg, 100mg pre-filled syringes",
      adultDosing: "Prophylaxis: 40mg once daily. Treatment: 1mg/kg every 12 hours (renal adjustment needed)",
      contraindications: "Active major bleeding, severe thrombocytopenia, epidural catheter in place",
      keyInteractions: "Additive bleeding risk with antiplatelets, NSAIDs, other anticoagulants",
    },
  },
  {
    id: "salbutamol",
    name: "Salbutamol",
    explanation:
      "Salbutamol (also called albuterol) is a quick-relief inhaler that relaxes the muscles around your airways, making it easier to breathe during asthma symptoms.",
    howToTake: "Shake well before use. Breathe out fully, then inhale as you press down, and hold your breath for about 10 seconds. Use a spacer if provided.",
    commonSideEffects: ["Mild shakiness", "Fast heartbeat", "Headache"],
    seriousSideEffects: ["Chest pain, severe fast or irregular heartbeat, or worsening breathing despite using the inhaler — seek urgent care"],
    lifestyleAdvice: ["Carry your inhaler with you at all times", "If you're using it more than twice a week for symptoms, tell your care team — your overall asthma plan may need adjusting"],
    missedDose: "This is a reliever used as needed for symptoms, not usually on a fixed schedule — use it when symptoms occur.",
    storage: "Store at room temperature. Check the dose counter and expiry date regularly.",
    monitoring: "Track how often you need to use it — increasing use can be a sign your asthma isn't well controlled.",
    clinical: {
      drugClass: "Short-acting beta-2 agonist (SABA)",
      strengths: "100mcg/puff MDI; 2.5mg/2.5mL and 5mg/2.5mL nebules",
      adultDosing: "1-2 puffs (100-200mcg) as needed, up to four times daily",
      contraindications: "Rarely contraindicated; caution in significant cardiac arrhythmia",
      keyInteractions: "Beta-blockers antagonise effect; increased hypokalaemia risk with diuretics/steroids",
    },
  },
  {
    id: "paracetamol",
    name: "Paracetamol",
    explanation:
      "Paracetamol (acetaminophen) is a common pain reliever and fever reducer, suitable for mild to moderate pain.",
    howToTake: "Take with or without food, as directed on the label or by your care team. Do not exceed the maximum daily dose.",
    commonSideEffects: ["Generally well tolerated at recommended doses"],
    seriousSideEffects: ["Yellowing of the skin or eyes, severe stomach pain, dark urine — these can indicate liver problems, especially with overdose — seek urgent care"],
    lifestyleAdvice: ["Check other medicines you take — many cold and flu products already contain paracetamol, and combining them can lead to accidental overdose", "Avoid or limit alcohol"],
    missedDose: "This is often taken as needed; if on a scheduled dose and you miss one, take it when remembered unless close to the next dose.",
    storage: "Store at room temperature, away from children's reach.",
    monitoring: "No routine monitoring needed at standard doses, but liver function may be checked with long-term high-dose use.",
    clinical: {
      drugClass: "Non-opioid analgesic / antipyretic",
      strengths: "500mg tablets; 120mg/5mL, 250mg/5mL suspensions; 1g IV",
      adultDosing: "500mg-1g every 4-6 hours, max 4g/day (lower max in hepatic impairment/low body weight)",
      contraindications: "Severe hepatic impairment (relative); caution with chronic alcohol use",
      keyInteractions: "Warfarin (mild INR increase with regular high-dose use); enzyme-inducing anticonvulsants raise hepatotoxicity risk",
    },
  },
  {
    id: "ceftriaxone",
    name: "Ceftriaxone",
    explanation:
      "Ceftriaxone is an antibiotic used to treat a wide range of bacterial infections, often given in hospital for more serious infections.",
    howToTake: "Given by injection or IV infusion by a healthcare professional, usually once daily.",
    commonSideEffects: ["Diarrhoea", "Injection site discomfort", "Mild rash"],
    seriousSideEffects: ["Signs of allergic reaction: swelling of the face or throat, severe rash, difficulty breathing — seek emergency care immediately"],
    lifestyleAdvice: ["Tell your care team about any past antibiotic allergies before treatment starts", "Complete the full course as prescribed even if you start feeling better"],
    missedDose: "This is typically administered by healthcare staff on a set schedule, so missed doses are uncommon — report any concerns to your care team.",
    storage: "Prepared and stored by pharmacy/nursing staff according to institutional protocol.",
    monitoring: "Watch for allergic reactions during and shortly after the first dose.",
    clinical: {
      drugClass: "Third-generation cephalosporin antibiotic",
      strengths: "250mg, 500mg, 1g, 2g vials (IV/IM)",
      adultDosing: "1-2g once daily IV/IM, up to 4g/day in severe infection",
      contraindications: "Cephalosporin allergy; avoid with IV calcium-containing products in neonates",
      keyInteractions: "Do not co-administer with calcium-containing IV solutions",
    },
  },
];

export function getDrugById(id) {
  return COUNSELING_DRUGS.find((d) => d.id === id);
}

export function findDrugByName(name) {
  const q = name.trim().toLowerCase();
  if (!q) return null;
  return COUNSELING_DRUGS.find((d) => d.name.toLowerCase() === q) ||
    COUNSELING_DRUGS.find((d) => d.name.toLowerCase().includes(q) || q.includes(d.name.toLowerCase())) ||
    null;
}
