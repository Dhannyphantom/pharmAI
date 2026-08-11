"use client";
import { useState } from "react";
import { FiUpload, FiFileText, FiCheckCircle, FiAlertTriangle, FiZap } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, PrimaryButton, GhostButton, ProgressRing, FadeIn, StaggerList, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import ScanningSequence from "@/components/ScanningSequence";
import { SCANNER_CASE } from "@/lib/miscData";
import { useApp } from "@/context/AppContext";
import { askAIJson } from "@/lib/aiClient";

const SCANNER_SYSTEM_PROMPT = `You are a prescription-scanning AI in a pharmacy education demo. The presenter will type out text simulating what handwriting-recognition (OCR) produced from a prescription. Analyze it.

Respond with STRICT JSON ONLY — no markdown, no code fences, no commentary — matching EXACTLY this shape:
{
  "recognisedText": "<clean version of the recognised prescription text>",
  "findings": [{"label": "<short label like 'Dose Check'>", "value": "<finding text>", "status": "ok" | "warn"}],
  "riskScore": <number 0-100>,
  "priority": "High" | "Medium" | "Low",
  "confidence": <number 0-100>
}
Include findings for at least: medicines recognised, dose check, allergy check (assume none stated unless mentioned), and interaction check. Base this on sound, real pharmacology.`;

export default function ScannerPage() {
  const [stage, setStage] = useState("upload"); // upload -> scanning -> report
  const [ocrText, setOcrText] = useState("");
  const [liveResult, setLiveResult] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();

  const result = liveMode && liveResult ? liveResult : SCANNER_CASE;

  async function runLiveScan() {
    setLiveError(null);
    setLiveLoading(true);
    setStage("scanning");
    try {
      const json = await askAIJson(`Simulated OCR text from prescription: ${ocrText.trim()}`, { system: SCANNER_SYSTEM_PROMPT, maxTokens: 700 });
      setLiveResult(json);
      setStage("report");
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <PageHeader
          eyebrow="Prescription Scanner"
          title="Simulated Prescription Upload"
          subtitle={
            liveMode
              ? "Live AI Mode is on — type what a scanned prescription would say and Claude analyzes it for real."
              : "A simplified simulation of how AI-assisted prescription scanning works — no real OCR is performed in this educational demo."
          }
        />

        {stage === "upload" && !liveMode && (
          <GlowCard className="flex flex-col items-center justify-center py-16 border-dashed border-2 border-white/15">
            <FiUpload size={36} className="text-ai-cyan mb-4" />
            <p className="text-slate-300 mb-1 font-medium">Drop a handwritten prescription here</p>
            <p className="text-slate-500 text-xs mb-6">(Simulated — click below to run the demo)</p>
            <PrimaryButton onClick={() => setStage("scanning")}>Simulate Prescription Upload</PrimaryButton>
          </GlowCard>
        )}

        {stage === "upload" && liveMode && (
          <GlowCard>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Simulated OCR Output</label>
            <textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              placeholder="e.g. Rx: Sertraline 50mg OD x30 + Tramadol 50mg QDS PRN (continue)"
              rows={3}
              className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan mb-4"
            />
            <PrimaryButton onClick={runLiveScan} disabled={!ocrText.trim()} className="flex items-center gap-2">
              <FiZap size={14} /> Analyze With Live AI
            </PrimaryButton>
          </GlowCard>
        )}

        {stage === "scanning" && !liveMode && (
          <GlowCard glow="glow-cyan">
            <ScanningSequence steps={SCANNER_CASE.steps} onComplete={() => setStage("report")} />
          </GlowCard>
        )}

        {stage === "scanning" && liveMode && (
          <GlowCard glow="glow-cyan">
            {liveLoading && <LiveThinking label="Scanning live with Claude..." />}
            {liveError && <AIErrorNote message={liveError} onRetry={runLiveScan} />}
          </GlowCard>
        )}

        {stage === "report" && (
          <div className="space-y-5">
            {liveMode && liveResult && <LiveModeNote>Live AI Mode — this analysis was generated live by Claude, not scripted</LiveModeNote>}
            <FadeIn>
              <GlowCard>
                <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide mb-2">
                  <FiFileText /> Recognised Text
                </div>
                <p className="font-mono text-sm text-white bg-black/30 rounded-lg p-4 border border-white/10">
                  {result.recognisedText}
                </p>
              </GlowCard>
            </FadeIn>

            <FadeIn delay={0.1}>
              <GlowCard>
                <div className="flex flex-wrap justify-around gap-6 mb-2">
                  <ProgressRing percent={result.riskScore} color="#F59E0B" label="Risk Score" />
                  <ProgressRing percent={result.confidence} color="#22D3EE" label="AI Confidence" />
                </div>
              </GlowCard>
            </FadeIn>

            <FadeIn delay={0.2}>
              <GlowCard>
                <h3 className="text-white font-bold mb-4">Scan Findings</h3>
                <StaggerList
                  items={result.findings}
                  startDelay={0.1}
                  renderItem={(f) => (
                    <div className={`flex items-start justify-between gap-3 p-4 rounded-xl border ${
                      f.status === "warn" ? "bg-warn/5 border-warn/25" : "bg-mint/5 border-mint/20"
                    }`}>
                      <div>
                        <div className="text-[13px] font-semibold text-white mb-0.5">{f.label}</div>
                        <div className="text-[12.5px] text-slate-300">{f.value}</div>
                      </div>
                      {f.status === "warn" ? (
                        <FiAlertTriangle className="text-warn shrink-0 mt-0.5" />
                      ) : (
                        <FiCheckCircle className="text-mint shrink-0 mt-0.5" />
                      )}
                    </div>
                  )}
                />
              </GlowCard>
            </FadeIn>

            <div className="flex justify-end">
              <GhostButton onClick={() => { setStage("upload"); setLiveResult(null); setOcrText(""); }}>Scan Another Prescription</GhostButton>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
