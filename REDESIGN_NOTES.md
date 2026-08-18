# What changed this round

Copy everything in this package over your project at the same paths. Nothing needs to be
deleted this round.

## 1. AI features to reduce unpaid pharmacy bills

New `lib/paymentRisk.js` — turns a patient's billing history into an actionable **Payment
Risk Score** (0–100, Low/Medium/High) rather than just a flat record. Weighted toward
overdue bills as the clearest non-payment signal, with pending count and outstanding-ratio
as secondary factors. Shown at the top of the Billing History panel in `/attend/[pid]`,
with:
- The contributing factors spelled out (e.g. "3 overdue bills totaling ₦4,200")
- A concrete recommendation ("request part-payment or confirm NHIS pre-authorization before
  dispensing further non-urgent items...")
- A **Draft Payment Reminder** button — Simulated Mode gives an instant templated message,
  Live AI Mode has Claude draft a short, courteous reminder from the actual outstanding
  items

I recalibrated the scoring after the first pass made every demo patient read as "Low" risk
(the weights were too diluted across a small billing history) — retuned it and adjusted a
couple of Mrs. A.B's billing statuses so there's a real "High risk" example to show, while
Mr. T.A stays "Low" for contrast. Verified the spread before shipping.

## 2. Harder AI vs Pharmacist questions

Rewrote `lib/challengeData.js` — 8 new scenarios, still relatable (real drugs, real
situations), but each hinges on something genuinely easy to miss rather than an obvious
allergy/contraindication: a single-dose fluconazole + warfarin interaction, co-trimoxazole +
methotrexate, the ACE-inhibitor/diuretic/NSAID "triple whammy," St John's Wort self-purchased
by a transplant patient on tacrolimus, codeine in a breastfeeding mother (ties into the new
pharmacogenomics module), a DOAC in severe renal impairment, and one deliberately reversed
case — a "penicillin allergy" that turns out to be unrelated childhood eczema — where the
right answer is to dispense, not withhold.

## 3. Presenter Notes removed

Removed from `components/NavBar.js` (button + keyboard shortcut) and `context/AppContext.js`
(state entirely). Also removed its one other usage, in `app/cases/[id]/assess/page.js` (the
hidden presenter-note callout on the patient banner) — otherwise that page would have kept a
dead reference to the removed context field.

## 4. Unit selection on the Inventory page

New `lib/unitInventory.js`. A unit selector row now sits above the tabs on `/inventory` —
GOPD, NHIS, Theatre, O&G, Paediatric, Renal, A&E, In-Patient — each scaling the same
formulary to a plausible relative stock level rather than maintaining 8 separate catalogs.
Switching units live-updates the LMIS table, the forecast chart, and risk badges.

Risk is now computed dynamically from stock vs. reorder level (`computeRisk()`) instead of
read from a static field — necessary once stock is unit-dependent, since a static "Low risk"
label would go stale the moment you switched units.

## 5. "Educational Demonstration" text removed from home

The eyebrow line under the logo is gone; the hero now goes straight from the icon to the
PhantomAI wordmark.

## 6. Animation polish

Most of the groundwork was already in place from earlier rounds — confirmed and left as-is:
`app/template.js` (page-transition wrapper, re-animates on every route change), `FadeIn`'s
scale+fade entrance, `.surface-interactive` hover/press, the achievement-pop/shimmer/pulse-
ring keyframes, and the pulsing ring on the home page's "Attend to Patient" card. Everything
animates `opacity`/`transform` only (no layout-triggering properties), and
`prefers-reduced-motion` is respected globally — verified both are still intact after this
round's edits.

## Files touched this round

New: `lib/paymentRisk.js`, `lib/unitInventory.js`.
Rewritten: `lib/challengeData.js`, `lib/patients.js` (payment risk + a real overdue example),
`components/NavBar.js`, `context/AppContext.js`, `app/cases/[id]/assess/page.js`,
`app/inventory/page.js`, `app/attend/[pid]/page.js`.

Not touched: everything else from previous rounds.
