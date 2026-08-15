# What changed this round

Copy everything in this package over your project at the same paths. Nothing needs to be
deleted this round.

## 1. Patient names initialized

`lib/cases.js` names changed to initials (`Mrs. A.B`, `Mr. T.A`, `Mrs. C.O`, `Mrs. G.E`);
the synthetic Theatre-linked patient is `Mrs. N.C`. This flows through everywhere that reads
from the case library — `/cases`, `/cases/[id]/assess`, and `/attend`.

## 2. Back navigation

New `BackButton` in `components/ui.js` — uses browser history when available, falls back to
a sensible parent route otherwise (e.g. patient workspace → patient search → home). Added to
the top of every page that's part of a flow: `/attend`, `/attend/[pid]` (now uses the shared
component instead of a one-off button), `/theatre`, `/inventory`, `/counseling`,
`/duplicate-check`, `/nhis-ops`.

## 3 & 4. Interaction checking — fixed, not just extended

You were right on both counts, and they were the same underlying bug. The Attend workspace
was only checking new-prescriptions against current-medications. Fixed to check **every
unique pair across the full medication list** — current-vs-current, current-vs-new, and
new-vs-new (`lib/patients.js`, `getPatientAnalysis`).

That surfaced the second issue: once Mrs. A.B's Warfarin+Ciprofloxacin pair was actually
being checked, it came back **"Low"** — because `lib/interactionData.js`'s reference table
only had 6 pairs, and that specific one wasn't in it, so it fell through to the generic "no
data" default. I expanded the table with the pairs your own case library depends on
(Warfarin+Ciprofloxacin → Major, Citalopram+Ondansetron → Moderate, plus a few more) and
added the relevant drugs to the picker list, so `/interactions` benefits too. Verified by
running the analysis engine against all 5 demo patients — Mrs. A.B's Warfarin+Ciprofloxacin
now correctly shows **Major**, matching her curated clinical case.

Interaction results are now sorted by severity (Major first) and tagged **New Rx** when a
pair involves a new prescription, so the clinically urgent ones aren't buried in the noise
of routine current-medication pairs.

## 5. Multi-item new prescriptions

New prescriptions are no longer capped at one item. `lib/patients.js` now layers consumables
and secondary items on top of each case's primary prescription — e.g. Mrs. A.B gets an IV
cannula and Normal Saline alongside her antibiotic; Mrs. N.C's theatre prep includes a
spinal anaesthesia set and gauze packs. Consumables are tagged **Consumable** in the UI and
excluded from interaction/duplicate checks (they're not drugs).

## 6. Duplicate therapy example

Mrs. A.B now also gets Nifedipine as a new prescription — same class (calcium channel
blocker) as her existing Amlodipine — so the Duplicate Prescription Check panel actually has
something to show. Verified: `Amlodipine 5mg` correctly flags against `Nifedipine 10mg`.

## 7. LMIS data (AMC, ROL, MOS) + recommendations

New `lib/lmis.js` — a shared `computeLmis()` helper (months-of-stock, status, and a
recommendation string) used by both the Attend workspace and the main Inventory page, so the
logic isn't duplicated.

- **`lib/miscData.js`** (unit-level `INVENTORY_ITEMS`) and **`lib/bulkStoreData.js`**
  (`CENTRAL_STOCK`) now carry `amc`, `minStock`, `maxStock`, and `leadTimeDays` alongside
  existing stock/reorder data.
- **Attend workspace** — "Unit vs Central Stock" now shows AMC, current stock, and months of
  stock (MOS) side-by-side for unit and central store, each with its own status badge and a
  one-line recommendation, and only nudges "Send Requisition" when actually below reorder
  level or safety stock.
- **Main Inventory page** — the Unit Forecast tab now opens with a full LMIS overview table
  (AMC, ROL, min/max, MOS, status, recommendation) across every item, before the existing
  per-item forecast chart.

## 8. Billing — more history + filter/sort

Every patient's `billingHistory` expanded (4–6 entries each, was 2), using standardized unit
names (A&E, In-Patient, GOPD Pharmacy, NHIS Pharmacy, Theatre, Theatre Pharmacy, O&G, O&G
Pharmacy, Renal) and a third status, **Overdue**, alongside Paid/Pending.

The Billing History panel in the Attend workspace now has a filter/sort bar: filter by status
(All/Paid/Pending/Overdue) and by unit, and sort by newest/oldest, price high↔low, or unit
A–Z — all client-side, instant.

## Files touched this round

`lib/cases.js` (names), `lib/interactionData.js` (expanded pairs), `lib/miscData.js` (LMIS
fields on `INVENTORY_ITEMS`), `lib/bulkStoreData.js` (LMIS fields on `CENTRAL_STOCK`),
`lib/lmis.js` (new), `lib/patients.js` (interaction fix, duplicate example, multi-item Rx,
expanded billing, LMIS-aware inventory flags), `components/ui.js` (`BackButton` added),
`app/attend/page.js`, `app/attend/[pid]/page.js`, `app/theatre/page.js`,
`app/inventory/page.js`, `app/counseling/page.js`, `app/duplicate-check/page.js`,
`app/nhis-ops/page.js`.

Not touched: `lib/dosingLogic.js`, `lib/challengeData.js`, `lib/aiClient.js`,
`app/api/ai/route.js`, `context/AppContext.js`, `components/NavBar.js`,
`app/globals.css`, and any page not listed above.
