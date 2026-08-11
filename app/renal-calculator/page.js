"use client";
import { useState } from "react";
import { FiAlertCircle, FiZap } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, PrimaryButton, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import { calculateCrCl, getRenalBand, DOSE_TABLE, RENAL_DRUGS } from "@/lib/dosingLogic";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";

const BAND_STYLES = {
  normal: "text-mint bg-mint/10 border-mint/30",
  moderate: "text-warn bg-warn/10 border-warn/30",
  severe: "text-danger bg-danger/10 border-danger/30",
  failure: "text-danger bg-danger/20 border-danger/40",
};

const DOSING_SYSTEM_PROMPT = `You are a renal dose-adjustment assistant for a pharmacy education demo. Given a medication name and a patient's calculated creatinine clearance (CrCl), give a concise (under 80 words) educational dose-adjustment recommendation, including any relevant black-box or contraindication warning if applicable. Plain text, no markdown, no JSON.`;

export default function RenalCalculatorPage() {
  const [age, setAge] = useState(65);
  const [weight, setWeight] = useState(70);
  const [scr, setScr] = useState(1.0);
  const [sex, setSex] = useState("Male");
  const [customDrug, setCustomDrug] = useState("");
  const [liveAdvice, setLiveAdvice] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();

  const crcl = calculateCrCl({ age, weightKg: weight, scrMgDl: scr, sex });
  const band = crcl !== null ? getRenalBand(crcl) : null;

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

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <PageHeader
          eyebrow="Renal Dose Calculator"
          title="Creatinine Clearance & Dose Adjustment"
          subtitle="Cockcroft-Gault estimation with simplified educational dose bands for common renally-cleared medications."
        />

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
