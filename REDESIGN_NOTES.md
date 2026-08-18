# What changed this round

Copy everything in this package over your project at the same paths, then **delete these
two folders** — they're replaced, not just unlinked:

```
app/nhis-ops/            → removed (item 2)
app/duplicate-check/     → replaced by app/training/ (item 4)
```

Also delete `lib/nhisOpsData.js` (no longer used). **Keep `lib/duplicateData.js`** — it's
still used internally by the Attend workflow's duplicate check, it just no longer has its
own standalone page.

## 1. Unit vs Central Stock now shows every prescribed drug

This wasn't actually a rendering bug — `getPatientAnalysis` was already looping over every
current + new medication. The real problem was the inventory catalog itself: it only had 6
items, so most patients' actual drugs (Ciprofloxacin, Nifedipine, Bisoprolol, Citalopram,
etc.) had no stock record at all and silently disappeared from the list. Expanded
`INVENTORY_ITEMS` (`lib/miscData.js`) and `CENTRAL_STOCK` (`lib/bulkStoreData.js`) from 6 to
19 items, covering every drug across all 5 demo patients. Verified: Mrs. A.B now shows all 5
of her medications (Warfarin, Bisoprolol, Amlodipine, Ciprofloxacin, Nifedipine), not just
Warfarin.

## 2 & 3. Removed NHIS page, renamed Theatre

`/nhis-ops` removed from nav and home. `/theatre`'s title/eyebrow changed from "O&G & Theatre
Pharmacy" to "Theatre" (route and functionality unchanged).

## 4. Pharmacy Training — replaces Duplicate Prescription Detection

New `/training` — practice patient counselling with a virtual patient.

- **Simulated Mode**: step through a fully worked example session (patient message → model
  student response → coach feedback) for one of 3 personas (new Type 2 diabetic starting
  Metformin, elderly patient anxious about Warfarin and diet, worried parent of a child on
  antibiotics).
- **Live AI Mode**: free-form chat — type or talk. A **"Switch to Audio"** toggle uses the
  browser's built-in Web Speech API (no new dependencies) — your mic input is transcribed and
  sent, and the patient's replies are read aloud. Each turn, Claude plays the patient in
  character *and* returns coach feedback in the same response — tagged **Applause**, **Tip**,
  or **Correction** — shown inline under the patient's reply. A running tally of each badge
  type sits at the top of the session.
- `lib/trainingData.js` holds the personas/scripts; the coaching JSON schema and persona
  system prompt live directly in `app/training/page.js`.

## 5. Drug Discovery — real-world example, verified

Added a "Real-World Example — Not Illustrative" card: **rentosertib (INS018_055)**, Insilico
Medicine's AI-discovered TNIK inhibitor for idiopathic pulmonary fibrosis — both its
biological target and molecular structure were identified by their generative AI platform.
Phase IIa results were published in *Nature Medicine* (June 2025) showing dose-dependent lung
function improvement vs. placebo, and it entered Phase III in July 2026. I verified this via
web search before writing it up (not from memory, since AI-drug-discovery milestones move
fast) — the card links directly to the peer-reviewed Nature Medicine article
(doi: 10.1038/s41591-025-03743-2) for verification.

## 6. Real demand forecasting, with stockout prediction

New `lib/forecast.js`. Previously the "6-month forecast" chart just displayed a static array
— not a prediction. Now `computeForecast()` derives a trend from the trailing 6 months of
actual consumption, projects the *next* 6 months forward from that trend, and simulates stock
depletion against the projection (no restocking assumed) to predict a stockout month.

The Inventory page's chart now shows both halves — dashed grey for the actual trailing 6
months, solid cyan for the predicted next 6 months — with a callout underneath: either
*"Stockout predicted in Month X"* or *"No stockout predicted within 6 months."* I had to tune
the trend model (dampened linear rather than compounding exponential) and bump a few items'
stock levels — the first version I tried was mathematically "correct" but nonsensical (a
"Low risk" item predicting stockout next month from noisy 6-point trend compounding) — so I
re-tested until the predictions tracked sensibly with each item's existing risk label.

## 7. Rebranded to PhantomAI

`app/layout.js` metadata, `components/NavBar.js` logo/wordmark, and the `app/page.js` hero
now read **PhantomAI: The Clinical Pharmacy Assistant**.

## 8. Incorrect dose detection

New `lib/doseCheck.js` — a structured adult-dosing reference (single-dose min/max, max daily
total) for 14 common drugs, with automatic mg/g/mcg normalization (this caught a real bug
while building it: Ceftriaxone is dosed in grams — without normalizing, "1g" parsed as the
number `1` and falsely flagged as a dangerously low dose). Wired into `getPatientAnalysis` as
a new **Dose Accuracy Check** panel next to Duplicate Prescription Check. Mrs. A.B's Nifedipine
was changed to a deliberately excessive 200mg (max is 90mg/day) so there's a live example to
see flagged; verified no false positives against the other 4 patients' real prescriptions.

## 9. Pharmacogenomics tab on the Renal Dose Calculator

`/renal-calculator` is now tabbed: **Renal Dosing** (unchanged) and **Pharmacogenomics**
(new). Pick a gene–drug pair (CYP2C19/Clopidogrel, CYP2D6/Codeine, TPMT/Azathioprine,
CYP2C9-VKORC1/Warfarin, HLA-B*15:02/Carbamazepine), then a phenotype, to see a risk-rated
dosing recommendation with the underlying mechanism explained. Live AI Mode adds a free-text
box for any other gene-drug pair. Data in `lib/pharmacogenomicsData.js`.

## Files touched this round

New: `lib/forecast.js`, `lib/doseCheck.js`, `lib/pharmacogenomicsData.js`,
`lib/trainingData.js`, `app/training/page.js`.
Rewritten: `lib/miscData.js`, `lib/bulkStoreData.js`, `lib/patients.js`, `app/layout.js`,
`components/NavBar.js`, `app/page.js`, `app/inventory/page.js`, `app/theatre/page.js`,
`app/drug-discovery/page.js`, `app/renal-calculator/page.js`, `app/attend/[pid]/page.js`
(dose check panel + prescriptions list).
Removed (delete from your project): `app/nhis-ops/`, `app/duplicate-check/`,
`lib/nhisOpsData.js`.

Not touched: `lib/cases.js`, `lib/interactionData.js`, `lib/counselingData.js`,
`lib/dosingLogic.js`, `lib/duplicateData.js`, `lib/surgicalData.js`, `lib/theatreData.js`,
`lib/lmis.js`, `lib/prescriptionRecommendations.js`, `lib/challengeData.js`,
`lib/aiClient.js`, `app/api/ai/route.js`, `context/AppContext.js`,
`components/ui.js`, `components/Disclaimer.js`, `app/attend/page.js`, `app/counseling/*`, and
`/cases`, `/challenge`, `/scanner`, `/interactions`, `/pharmacovigilance`, `/hallucination`.
