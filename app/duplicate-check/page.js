"use client";
import { useState } from "react";
import { FiCopy, FiZap, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import {
  PageHeader,
  GlowCard,
  FadeIn,
  PrimaryButton,
  GhostButton,
  SeverityPill,
  BackButton,
  LiveThinking,
  AIErrorNote,
  LiveModeNote,
} from "@/components/ui";
import { detectDuplicates, DEFAULT_SCENARIO } from "@/lib/duplicateData";
import { useApp } from "@/context/AppContext";
import { askAIJson } from "@/lib/aiClient";

const DUPLICATE_SYSTEM_PROMPT = `You are a duplicate-therapy detection AI for a pharmacy education demo (GOPD unit). Given a patient's current medication list and one new prescription, identify any duplicate or overlapping therapy (same drug, or same therapeutic class).

Respond with STRICT JSON ONLY — no markdown, no code fences, no commentary — matching EXACTLY this shape:
{
  "newDrug": "<the new prescription, cleaned up>",
  "newClass": "<its therapeutic class>",
  "duplicates": [{"drug": "<current medication>", "drugClass": "<its class>", "reason": "<why it overlaps>"}],
  "riskLevel": "Low" | "Medium" | "High"
}
If there is no overlap, return an empty duplicates array and riskLevel "Low". Base this on real pharmacology.`;

export default function DuplicateCheckPage() {
  const [currentMedsText, setCurrentMedsText] = useState(
    DEFAULT_SCENARIO.currentMedsText,
  );
  const [newDrug, setNewDrug] = useState(DEFAULT_SCENARIO.newDrug);
  const [result, setResult] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();

  function runSimulated() {
    setLiveError(null);
    setResult(detectDuplicates(currentMedsText, newDrug));
  }

  async function runLive() {
    if (!currentMedsText.trim() || !newDrug.trim()) return;
    setLiveError(null);
    setLiveLoading(true);
    setResult(null);
    try {
      const json = await askAIJson(
        `Current medications:\n${currentMedsText}\n\nNew prescription: ${newDrug}`,
        { system: DUPLICATE_SYSTEM_PROMPT, maxTokens: 500 },
      );
      setResult(json);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  function check() {
    if (liveMode) runLive();
    else runSimulated();
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="GOPD Pharmacy"
          title="Duplicate Prescription Detection"
          subtitle={
            liveMode
              ? "Live AI Mode is on — Claude compares the new prescription against the current chart for real."
              : "Enter a patient's current medications and a new prescription. The local reference engine flags same-drug or same-class duplication."
          }
        />

        <GlowCard className="mb-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                Current Medications (one per line)
              </label>
              <textarea
                value={currentMedsText}
                onChange={(e) => setCurrentMedsText(e.target.value)}
                rows={5}
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                New Prescription
              </label>
              <input
                type="text"
                value={newDrug}
                onChange={(e) => setNewDrug(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
              />
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                {liveMode
                  ? "Claude will reason about drug class overlap."
                  : "Checked against a local therapeutic-class reference of ~45 common drugs."}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <PrimaryButton
              onClick={check}
              disabled={
                liveLoading || !currentMedsText.trim() || !newDrug.trim()
              }
              className="flex items-center gap-2"
            >
              {liveMode && <FiZap size={14} />}{" "}
              {liveMode ? "Check With Live AI" : "Check for Duplicates"}
            </PrimaryButton>
            <GhostButton
              onClick={() => {
                setCurrentMedsText(DEFAULT_SCENARIO.currentMedsText);
                setNewDrug(DEFAULT_SCENARIO.newDrug);
                setResult(null);
              }}
            >
              Reset Example
            </GhostButton>
          </div>
        </GlowCard>

        {liveLoading && (
          <GlowCard className="mb-6">
            <LiveThinking label="Comparing therapy with Phantom..." />
          </GlowCard>
        )}
        {liveError && (
          <GlowCard className="mb-6">
            <AIErrorNote message={liveError} onRetry={runLive} />
          </GlowCard>
        )}

        {result && (
          <FadeIn>
            {liveMode && (
              <LiveModeNote>
                Live AI Mode — generated by Claude, not scripted
              </LiveModeNote>
            )}
            <GlowCard
              className={
                result.duplicates.length ? "border-warn/25" : "border-mint/25"
              }
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                    New Prescription
                  </div>
                  <div className="text-white font-semibold">
                    {result.newDrug}{" "}
                    <span className="text-slate-400 font-normal text-sm">
                      — {result.newClass}
                    </span>
                  </div>
                </div>
                <SeverityPill level={result.riskLevel} />
              </div>

              {result.duplicates.length === 0 ? (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-mint/5 border border-mint/20 text-mint text-sm">
                  <FiCheckCircle /> No duplicate or overlapping therapy detected
                  against the current chart.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {result.duplicates.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-warn/5 border border-warn/20"
                    >
                      <FiAlertTriangle
                        className="text-warn shrink-0 mt-0.5"
                        size={15}
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {d.drug}{" "}
                          <span className="text-slate-400 font-normal">
                            — {d.drugClass}
                          </span>
                        </div>
                        <div className="text-[12.5px] text-slate-300 mt-0.5">
                          {d.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>
          </FadeIn>
        )}

        {!result && !liveLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-6">
            <FiCopy className="shrink-0" /> Enter a chart above and run the
            check to see it in action.
          </div>
        )}
      </main>
    </>
  );
}
