# AI Clinical Pharmacy Assistant — Educational Demonstration

A live-presentation web app built for a pharmacy internship "Hallmark" talk:
**Applications of Artificial Intelligence in Current Pharmacy Practice and Patient Care.**

> ⚠️ **This app is NOT intended for real clinical decision making.** Every recommendation is
> pre-scripted, simulated content for teaching purposes. It requires pharmacist review and
> professional clinical judgement in real practice.

---

## Why the default mode is simulated, not "live AI"

By default, every "AI" output in this app — clinical reports, scanning sequences, counselling
drafts, pharmacovigilance signals — is **pre-written, deterministic content**, not a live call to
a language model. (Live AI Mode, described in the next section, adds the option to make it real.)
Defaulting to scripted content was a deliberate choice, not a shortcut:

- **Reliability on stage.** A live presentation can't depend on network access or an API
  being up. Nothing here can fail mid-talk because Wi-Fi drops.
- **Precision of the teaching point.** Each case is built around one specific, correct clinical
  lesson (a renal dose limit, a pregnancy contraindication, a QT-prolongation risk). A live
  model's output can vary; a scripted case can't drift off the point you rehearsed.
- **It's what the brief asked for.** The original spec explicitly designs the prescription
  scanner and several other modules as simulations ("No actual OCR required — everything can
  be simulated").

The data files in `/lib` are still the "source of truth" for Simulated Mode, and the seam that
Live AI Mode calls out to instead — see below.

---

## Two modes: Simulated (default) and Live AI

Every module now has a **Live AI Mode** toggle in the top nav bar (also persisted across
reloads via `localStorage`). It changes what powers the app:

| | Simulated Mode (default) | Live AI Mode |
|---|---|---|
| Content source | Pre-written, deterministic data in `/lib` | Real calls to the Anthropic API, generated on the spot |
| Reliability | Works with zero internet connection | Needs internet + a valid API key |
| Best for | The actual live presentation — nothing can fail on stage | Rehearsal, Q&A, or showing the audience it's not a parlour trick |
| Cases / drugs / prescriptions available | The built-in set (4 patients, 7 drugs, 5 quiz questions, 10 interaction pairs) | **Anything** — type a custom drug, patient scenario, or drug pair and get a real, live response |

**To enable Live AI Mode:**

```bash
cp .env.local.example .env.local
# then edit .env.local and set:
# ANTHROPIC_API_KEY=sk-ant-your-real-key-here
```

Restart the dev/prod server after adding the key, then click the mode pill in the top bar
(shows "Simulated Mode" → click to switch to "Live AI Mode"). The API key **never reaches the
browser** — it's used only inside the server-side route at `app/api/ai/route.js`, which proxies
requests to `https://api.anthropic.com/v1/messages`.

**What becomes live in each module**, when the toggle is on:
- **Patient Assessment** — the full AI clinical report and final recommendation are generated
  live from the same patient chart data, instead of reading `case.aiReport`
- **Patient Counselling** — type *any* medication name, not just the built-in 7
- **AI vs Pharmacist** — describe *any* prescription scenario, and Claude generates the
  question, correct answer, and both reasoning panels on the spot
- **Prescription Scanner** — type simulated OCR text for any prescription and get a real analysis
- **Interaction Visualizer** — type any two drug names instead of picking from the fixed list
- **Renal Dose Calculator** — ask for live dosing advice on any drug beyond the built-in 5
- **Inventory / Pharmacovigilance / Drug Discovery / Hospital Dashboard** — an "Ask Live AI to
  interpret this" button that sends the (still-simulated) on-screen data to Claude for a real
  natural-language read
- **AI Hallucination Demo** — deliberately **stays scripted even in Live AI Mode**. Its whole
  teaching point depends on showing one guaranteed-wrong recommendation; a live model call could
  happen to answer correctly and undercut the lesson. The page explains this to the audience.

**Cost note:** each live interaction is a real, billed API call. For a short demo section this
is trivial, but if you leave Live AI Mode on and click through everything repeatedly during
rehearsal, keep an eye on usage in the Anthropic console.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For the actual presentation, use a production build (faster, no dev overlay):

```bash
npm run build
npm run start
```

**Keyboard shortcuts** (while the app has focus):
- `F` — toggle fullscreen (best for projecting)
- `P` — toggle presenter notes (shows hidden teaching-point call-outs on assessment pages)

---

## What's inside

| Module | Route | What it does |
|---|---|---|
| Landing | `/` | Title screen + module menu |
| Patient Assessment | `/cases` → `/cases/[id]/assess` | The core 5-step flow: chart → 30s discussion timer → AI scan animation → full clinical report → final recommendation |
| Patient Counselling | `/counseling` | 7 medications, patient-friendly AI-drafted counselling cards |
| AI vs Pharmacist | `/challenge` | Live scored quiz: dispense / don't / consult |
| Prescription Scanner | `/scanner` | Simulated handwriting-to-report pipeline |
| Interaction Visualizer | `/interactions` | Pick two drugs, animated connection + severity |
| Renal Dose Calculator | `/renal-calculator` | Real Cockcroft-Gault CrCl calculation + educational dose bands |
| Inventory Management | `/inventory` | Simulated stock/demand-forecast dashboard (Recharts) |
| Pharmacovigilance | `/pharmacovigilance` | Simulated adverse-event signal clustering |
| Drug Discovery | `/drug-discovery` | Animated funnel: millions of molecules → one medicine |
| Hospital Dashboard | `/hospital-dashboard` | Animated daily activity counters |
| AI Hallucination Demo | `/hallucination` | A confidently wrong AI recommendation, and why |
| Final Takeaway | `/takeaway` | Closing two-column message |

### The 4 built-in patient cases

Each hits a different category of hidden medication problem, on purpose:

1. **Mrs. Adaeze Bello, 74** — Warfarin + new ciprofloxacin → major interaction, bleeding risk
2. **Mr. Tunde Adekunle, 58** — Metformin prescribed at eGFR 28 → renal contraindication, black-box lactic acidosis risk
3. **Mrs. Chidinma Okoye, 29** — Ciprofloxacin prescribed at 28 weeks pregnant → pregnancy contraindication
4. **Mrs. Grace Eze, 63** — Citalopram + ondansetron with low potassium → QT-prolongation risk

All patients and clinical details are fictional composites for teaching purposes.

---

## Tech stack

- **Next.js 16** (App Router, JavaScript only, no TypeScript)
- **Tailwind CSS v4** (CSS-first `@theme` config in `app/globals.css` — hospital-blue /
  AI-cyan / violet glassmorphism palette)
- **Framer Motion** for all animation
- **React Icons** (Feather set)
- **Recharts** for the inventory forecast chart
- **canvas-confetti** for the celebratory bursts

No TypeScript. In Simulated Mode (the default), there's no server-side data fetching and no
external API calls at all — everything runs entirely client-side, which also means it works with
**no internet connection** once loaded (good insurance for a live talk on unfamiliar Wi-Fi).
Live AI Mode adds one server-side route (`app/api/ai/route.js`) that proxies to the real
Anthropic API using your own key — see "Two modes" above.

Note: fonts are a plain system-font stack rather than `next/font/google` — this was a
deliberate fix during development (Google Fonts wasn't reachable in the build sandbox used to
create this project) and it also means one less network dependency on presentation day.

---

## Editing the content

All clinical/demo content for **Simulated Mode** lives in `/lib`:
- `cases.js` — the 4 patient assessment cases + full AI report content
- `counselingData.js` — the 7 patient-counselling drug cards
- `interactionData.js` — drug interaction pairs for the visualizer
- `challengeData.js` — the AI vs Pharmacist quiz questions
- `dosingLogic.js` — Cockcroft-Gault formula + dose band tables
- `miscData.js` — scanner, inventory, pharmacovigilance, drug discovery, hospital stats, and
  the hallucination-demo case

**Live AI Mode** infrastructure lives in:
- `app/api/ai/route.js` — the server-side proxy to `api.anthropic.com` (reads `ANTHROPIC_API_KEY`)
- `lib/aiClient.js` — client-side `askAI()` / `askAIJson()` helpers every module calls

Adding a 5th patient case, for example, is just adding one more object to the `CASES` array in
`cases.js` — the case library grid and assessment flow pick it up automatically.

---

## Disclaimer

Displayed in the footer of every page:

> Educational Demonstration Only. This application is NOT intended for real clinical decision
> making. All recommendations require pharmacist review and professional clinical judgement.
