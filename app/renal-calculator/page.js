"use client";
import { useState } from "react";
import { FiAlertCircle, FiZap, FiActivity, FiCpu, FiShield } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, PrimaryButton, BackButton, SegmentedTabs, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import { calculateCrCl, getRenalBand, DOSE_TABLE, RENAL_DRUGS } from "@/lib/dosingLogic";
import { PGX_PAIRS } from "@/lib/pharmacogenomicsData";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";

const BAND_STYLES = {
  normal: "text-mint bg-mint/10 border-mint/30",
  moderate: "text-warn bg-warn/10 border-warn/30",
  severe: "text-danger bg-danger/10 border-danger/30",
  failure: "text-danger bg-danger/20 border-danger/40",
};

const RISK_STYLES = {
  Low: "text-mint bg-mint/10 border-mint/30",
  Moderate: "text-warn bg-warn/10 border-warn/30",
  High: "text-danger bg-danger/10 border-danger/30",
};

const TABS = [
  { value: "renal", label: "Renal Dosing", icon: FiActivity },
  { value: "pgx", label: "Pharmacogenomics", icon: FiCpu },
];

const DOSING_SYSTEM_PROMPT = `You are a renal dose-adjustment assistant for a pharmacy education demo. Given a medication name and a patient's calculated creatinine clearance (CrCl), give a concise (under 80 words) educational dose-adjustment recommendation, including any relevant black-box or contraindication warning if applicable. Plain text, no markdown, no JSON.`;

const PGX_SYSTEM_PROMPT = `You are a pharmacogenomics (PGx) assistant for a pharmacy education demo. Given a gene and a drug, explain in under 90 words how genetic variation in that gene typically affects response to that drug, and what a pharmacist should consider. Plain text, no markdown, no JSON. Base this on real CPIC/DPWG-style guidance where it exists; otherwise say so plainly.`;

export default function RenalCalculatorPage() {
  const [tab, setTab] = useState("renal");
  const [age, setAge] = useState(65);
  const [weight, setWeight] = useState(70);
  const [scr, setScr] = useState(1.0);
  const [sex, setSex] = useState("Male");
  const [customDrug, setCustomDrug] = useState("");
  const [liveAdvice, setLiveAdvice] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();

  const [pgxPairId, setPgxPairId] = useState(PGX_PAIRS[0].id);
  const [pgxPhenotype, setPgxPhenotype] = useState(PGX_PAIRS[0].phenotypes[0].name);
  const [pgxQuery, setPgxQuery] = useState("");
  const [pgxLiveAnswer, setPgxLiveAnswer] = useState(null);
  const [pgxLiveLoading, setPgxLiveLoading] = useState(false);
  const [pgxLiveError, setPgxLiveError] = useState(null);

  const crcl = calculateCrCl({ age, weightKg: weight, scrMgDl: scr, sex });
  const band = crcl !== null ? getRenalBand(crcl) : null;
  const pgxPair = PGX_PAIRS.find((p) => p.id === pgxPairId);
  const pgxSelected = pgxPair.phenotypes.find((ph) => ph.name === pgxPhenotype) || pgxPair.phenotypes[0];

  async function getLiveAdvice() {
    if (!customDrug.trim() || !crcl) return;
    setLiveError(null);
    setLiveLoading(true);
    setLiveAdvice(null);
    try {
      const text = await askAI(
        `Medication: ${customDrug.trim()}\nCalculated CrCl: ${crcl} mL/min\nRenal band: ${band.band}\nPatient: ${age} yrs, ${weight} kg, ${sex}`,
        { system: DOSING_SYSTEM_PROMPT, maxTokens: 300 }
      );
      setLiveAdvice(text);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  async function askPgx() {
    if (!pgxQuery.trim()) return;
    setPgxLiveError(null);
    setPgxLiveLoading(true);
    setPgxLiveAnswer(null);
    try {
      const text = await askAI(pgxQuery.trim(), { system: PGX_SYSTEM_PROMPT, maxTokens: 260 });
      setPgxLiveAnswer(text);
    } catch (e) {
      setPgxLiveError(e.message);
    } finally {
      setPgxLiveLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="Precision Dosing"
          title="Renal Dose Calculator & Pharmacogenomics"
          subtitle="Cockcroft-Gault estimation with dose bands for renally-cleared medications, plus gene-drug phenotype demonstrations for precision dosing."
        />

        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "renal" && (
          <>
            <GlowCard className="mb-6">
              <div className="grid sm:grid-cols-4 gap-4">
                <Field label="Age (years)">
                  <input type="number" value={age} onChange={(e) => setAge(+e.target.value)} className="input" />
                </Field>
                <Field label="Weight (kg)">
                  <input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="input" />
                </Field>
                <Field label="Serum Creatinine (mg/dL)">
                  <input type="number" step="0.1" value={scr} onChange={(e) => setScr(+e.target.value)} className="input" />
                </Field>
                <Field label="Sex">
                  <select value={sex} onChange={(e) => setSex(e.target.value)} className="input">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </Field>
              </div>
            </GlowCard>

            {crcl !== null && (
              <FadeIn>
                <GlowCard className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Estimated Creatinine Clearance</div>
                    <div className="text-3xl font-bold text-white">{crcl} <span className="text-base text-slate-400 font-normal">mL/min</span></div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border ${BAND_STYLES[band.key]}`}>{band.band}</span>
                </GlowCard>

                <GlowCard className="mb-6">
                  <div className="flex items-start gap-2 text-[12px] text-slate-400 mb-4 p-3 rounded-lg bg-white/[0.03] border border-white/10">
                    <FiAlertCircle className="shrink-0 mt-0.5 text-ai-cyan" size={14} />
                    Educational dose bands only — always verify against current local guidelines and full patient context before real dosing decisions.
                  </div>
                  <div className="space-y-3">
                    {RENAL_DRUGS.map((drug) => (
                      <div key={drug} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                        <div className="sm:w-40 font-semibold text-white text-sm shrink-0">{drug}</div>
                        <div className="text-[13px] text-slate-300">{DOSE_TABLE[drug][band.key]}</div>
                      </div>
                    ))}
                  </div>
                </GlowCard>

                {liveMode && (
                  <GlowCard>
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiZap className="text-ai-cyan" size={15} /> Ask About Another Medication</h3>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                      <input
                        type="text" value={customDrug} onChange={(e) => setCustomDrug(e.target.value)}
                        placeholder="e.g. Rivaroxaban, Digoxin, Allopurinol..."
                        className="flex-1 bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
                      />
                      <PrimaryButton onClick={getLiveAdvice} disabled={liveLoading || !customDrug.trim()}>Get Live Advice</PrimaryButton>
                    </div>
                    {liveLoading && <LiveThinking label="Consulting Claude..." />}
                    {liveError && <AIErrorNote message={liveError} onRetry={getLiveAdvice} />}
                    {liveAdvice && (
                      <FadeIn>
                        <LiveModeNote>Live AI Mode — generated by Claude, not scripted</LiveModeNote>
                        <div className="p-4 rounded-xl bg-ai-cyan/5 border border-ai-cyan/20 text-[13px] text-slate-200 leading-relaxed">
                          {liveAdvice}
                        </div>
                      </FadeIn>
                    )}
                  </GlowCard>
                )}
              </FadeIn>
            )}
          </>
        )}

        {tab === "pgx" && (
          <FadeIn>
            <GlowCard className="mb-6">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiCpu className="text-ai-violet" /> Select a Gene–Drug Pair</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {PGX_PAIRS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPgxPairId(p.id); setPgxPhenotype(p.phenotypes[0].name); }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                      pgxPairId === p.id ? "border-ai-violet/50 bg-ai-violet/10 text-ai-violet" : "border-white/12 text-slate-300 hover:border-white/25 hover:bg-white/5"
                    }`}
                  >
                    {p.gene} → {p.drug}
                  </button>
                ))}
              </div>
            </GlowCard>

            <GlowCard className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="text-ai-cyan shrink-0" size={15} />
                <h3 className="text-white font-bold text-sm">{pgxPair.gene} & {pgxPair.drug}</h3>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-4">{pgxPair.mechanism}</p>

              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Select a Phenotype</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {pgxPair.phenotypes.map((ph) => (
                  <button
                    key={ph.name}
                    onClick={() => setPgxPhenotype(ph.name)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      pgxPhenotype === ph.name ? "border-ai-cyan/50 bg-ai-cyan/10 text-ai-cyan" : "border-white/12 text-slate-300 hover:border-white/25 hover:bg-white/5"
                    }`}
                  >
                    {ph.name}
                  </button>
                ))}
              </div>

              <div className={`p-4 rounded-xl border ${
                pgxSelected.risk === "High" ? "bg-danger/5 border-danger/25" : pgxSelected.risk === "Moderate" ? "bg-warn/5 border-warn/25" : "bg-mint/5 border-mint/25"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{pgxSelected.name}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${RISK_STYLES[pgxSelected.risk]}`}>{pgxSelected.risk} Risk</span>
                </div>
                <p className="text-[13px] text-slate-300 leading-relaxed">{pgxSelected.recommendation}</p>
              </div>
            </GlowCard>

            {liveMode && (
              <GlowCard>
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiZap className="text-ai-cyan" size={15} /> Ask About Another Gene–Drug Pair</h3>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input
                    type="text" value={pgxQuery} onChange={(e) => setPgxQuery(e.target.value)}
                    placeholder="e.g. How does DPYD affect fluorouracil dosing?"
                    className="flex-1 bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
                  />
                  <PrimaryButton onClick={askPgx} disabled={pgxLiveLoading || !pgxQuery.trim()}>Ask Claude</PrimaryButton>
                </div>
                {pgxLiveLoading && <LiveThinking label="Consulting Claude..." />}
                {pgxLiveError && <AIErrorNote message={pgxLiveError} onRetry={askPgx} />}
                {pgxLiveAnswer && (
                  <FadeIn>
                    <LiveModeNote>Live AI Mode — generated by Claude, not scripted</LiveModeNote>
                    <div className="p-4 rounded-xl bg-ai-cyan/5 border border-ai-cyan/20 text-[13px] text-slate-200 leading-relaxed">
                      {pgxLiveAnswer}
                    </div>
                  </FadeIn>
                )}
              </GlowCard>
            )}
          </FadeIn>
        )}
      </main>
      <style jsx global>{`
        .input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 10px 12px;
          color: white;
          font-size: 14px;
        }
        .input:focus { outline: none; border-color: #22D3EE; }
      `}</style>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
