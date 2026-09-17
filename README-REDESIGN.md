# PhantomAI — de-AI-ified UI

## What changed and why

The old UI had every classic "AI-generated" tell: glassmorphism cards, a
cyan→violet neon gradient repeated everywhere, box-shadow glows, rainbow
gradient text, a literal animated neural-network canvas as the page
background, and gamified "achievement unlocked" badges. None of that is
specific to a hospital pharmacy tool — it's decoration, not judgement.

Rather than hand-edit 70+ page files, the fix targets the handful of files
every page already depends on. Tailwind v4 defines your custom colors
(`ai-cyan`, `ai-violet`, `hospital-blue`, `mint`, `warn`, `danger`) as CSS
variables in one `@theme` block — every page's `bg-ai-cyan/10`,
`from-hospital-blue to-ai-violet`, `.glow-cyan` etc. reads from that block.
Redefining the *values* there, plus flattening the `.glass` / `.glass-strong`
surface classes and the `.btn-primary` gradient, re-themes the entire app
from one file.

## Files in this package (drop into your project at the same paths)

- `app/globals.css` — new token system: one accent blue + neutral grays,
  the old neon triad (cyan/violet/blue) is now a single restrained family,
  glass/blur removed, glow reduced to a 1px tint, gradient text now solid.
- `app/layout.js` — removes `<NeuralBackground />`, adds the persistent
  `<Sidebar />`, shifts content over on desktop.
- `app/page.js` — home page rebuilt to match the reference: orb hero,
  greeting, a functional search/command bar, three featured shortcuts,
  then the module grid as flat cards.
- `components/Orb.js` — **new**. The glossy rotating sphere from the
  reference image. Pure CSS, no canvas/particles. This is the one
  deliberate animated moment, reused for every "AI is working" state.
- `components/Sidebar.js` — **new**. The persistent left icon rail
  (desktop), matching the reference's structure: logo mark, primary nav,
  a flyout for the full module list, Live Mode / fullscreen / settings /
  avatar at the base.
- `components/NavBar.js` — now mobile-only (the desktop nav moved to
  Sidebar). Every page still does `<NavBar />` unmodified.
- `components/ui.js` — same exports and props as before (`GlowCard`,
  `PrimaryButton`, `SeverityPill`, `ProgressRing`, `SegmentedTabs`, `Modal`,
  `LiveThinking`, etc.), restyled underneath. `LiveThinking` now shows the
  Orb instead of a dual counter-rotating ring.
- `components/ScanningSequence.js` — same, uses the Orb.
- `components/Disclaimer.js`, `components/ConfettiBurst.js` — small
  palette/flattening updates.

Because `NavBar`, `GlowCard`, `PrimaryButton`, etc. keep their exact names
and props, **every other page (cases, inventory, theatre, documentation,
counseling, and the rest) inherits the new look with zero changes to those
files.**

## What this doesn't cover yet

A few pages set colors as literal hex strings rather than through the
token system, so they won't re-theme automatically:
- `<ProgressRing color="#22D3EE" />` / `color="#EF4444"` in
  `app/cases/[id]/assess/page.js`, `app/attend/[pid]/page.js`,
  `app/scanner/page.js`, `app/drug-discovery/page.js`.
- `components/CountdownTimer.js` (`stroke={urgent ? "#EF4444" : "#22D3EE"}`).
- The inline `<style jsx>` block in `app/renal-calculator/page.js`.

These are cosmetic and low-risk to leave (red-for-risk / blue-for-info still
reads correctly) — happy to sweep them to `var(--accent)` /
`var(--color-danger)` on request. You may also want to delete
`components/NeuralBackground.js` outright since nothing imports it anymore.

## Sizing note

`Sidebar` is fixed-width (84px) and hidden below `lg:`. On mobile, `NavBar`
takes over as a slim top bar with a menu sheet, so no page needs a
mobile-specific layout change.
