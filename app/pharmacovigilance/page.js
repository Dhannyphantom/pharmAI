"use client";
import { useState } from "react";
import { FiActivity, FiAlertTriangle, FiZap } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, ProgressRing, FadeIn, StaggerList, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import { PHARMACOVIGILANCE_REPORTS, SIGNAL_CLUSTER } from "@/lib/miscData";
import { useApp } from "@/context/AppContext";
import { askAIJson } from "@/lib/aiClient";

const SEVERITY_DOT = { Mild: "bg-mint", Moderate: "bg-warn", Severe: "bg-danger" };

const SIGNAL_SYSTEM_PROMPT = `You are a pharmacovigilance signal-detection AI in an education demo. Given a list of recent adverse drug reaction reports (JSON), look for clustering patterns (same drug, escalating severity, short time window) that could indicate a safety signal.

Respond with STRICT JSON ONLY — no markdown, no code fences, no commentary — matching EXACTLY this shape:
{
  "drug": "<drug name the signal centers on, or 'None' if no signal>",
  "reactionCluster": "<short description of the reaction pattern>",
  "reportCount": <number of reports contributing to this signal>,
  "confidence": <number 0-100>,
  "narrative": "<2-3 sentence explanation of why this is or isn't a signal worth escalating>"
}`;

export default function PharmacovigilancePage() {
  const [signalRevealed, setSignalRevealed] = useState(false);
  const [liveSignal, setLiveSignal] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();

  const signal = liveMode && liveSignal ? liveSignal : SIGNAL_CLUSTER;

  async function revealSignal() {
    setSignalRevealed(true);
    if (!liveMode) return;
    setLiveError(null);
    setLiveLoading(true);
    try {
      const json = await askAIJson(
        `Recent adverse event reports: ${JSON.stringify(PHARMACOVIGILANCE_REPORTS)}`,
        { system: SIGNAL_SYSTEM_PROMPT, maxTokens: 500 }
      );
      setLiveSignal(json);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <PageHeader
          eyebrow="Pharmacovigilance"
          title="Adverse Event Signal Detection"
          subtitle={
            liveMode
              ? "Live AI Mode is on — Claude analyzes the simulated report feed below in real time for clustering signals."
              : "AI clusters incoming adverse drug reports to surface safety signals a single reviewer might miss."
          }
        />

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <GlowCard>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiActivity className="text-ai-cyan" /> Incoming Reports (Simulated Feed)</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {PHARMACOVIGILANCE_REPORTS.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/10 text-[13px]">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${SEVERITY_DOT[r.severity]}`}></span>
                    <div>
                      <div className="text-slate-200 font-medium">{r.drug} — {r.reaction}</div>
                      <div className="text-slate-500 text-[11px]">{r.id} • {r.date}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">{r.severity}</span>
                </div>
              ))}
            </div>
          </GlowCard>

          <GlowCard>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiAlertTriangle className="text-warn" /> AI Signal Detection</h3>
            {!signalRevealed ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <p className="text-sm text-slate-400 text-center max-w-xs">
                  {liveMode ? "Have Claude analyze the report feed for clustering signals." : "AI has been clustering the report stream in the background. Reveal what it found."}
                </p>
                <button
                  onClick={revealSignal}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-hospital-blue to-ai-violet text-white font-semibold text-sm glow-blue"
                >
                  {liveMode && <FiZap size={14} />} {liveMode ? "Analyze Live With AI" : "Reveal Detected Signal"}
                </button>
              </div>
            ) : liveMode && liveLoading ? (
              <LiveThinking label="Clustering reports with Claude..." />
            ) : liveMode && liveError ? (
              <AIErrorNote message={liveError} onRetry={revealSignal} />
            ) : (
              <FadeIn>
                {liveMode && liveSignal && <LiveModeNote>Live AI Mode — generated by Claude, not scripted</LiveModeNote>}
                <div className="flex justify-center mb-5">
                  <ProgressRing percent={signal.confidence} color="#EF4444" label="Signal Confidence" />
                </div>
                <div className="p-4 rounded-xl bg-danger/10 border border-danger/25">
                  <div className="text-sm font-bold text-danger mb-1">
                    {signal.reportCount} reports · {signal.drug} {!liveMode && `· ${SIGNAL_CLUSTER.timeWindow}`}
                  </div>
                  <div className="text-[13px] text-slate-200 font-medium mb-2">{signal.reactionCluster}</div>
                  <p className="text-[12.5px] text-slate-300 leading-relaxed">{signal.narrative}</p>
                </div>
              </FadeIn>
            )}
          </GlowCard>
        </div>
      </main>
    </>
  );
}
