"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiZap } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import {
  PageHeader,
  GlowCard,
  SeverityPill,
  FadeIn,
  PrimaryButton,
  LiveThinking,
  AIErrorNote,
  LiveModeNote,
} from "@/components/ui";
import { INTERACTION_DRUGS, getInteraction } from "@/lib/interactionData";
import { useApp } from "@/context/AppContext";
import { askAIJson } from "@/lib/aiClient";

const SEVERITY_LINE_COLOR = {
  Low: "#34D399",
  Moderate: "#F59E0B",
  Major: "#EF4444",
};

const INTERACTION_SYSTEM_PROMPT = `You are a drug-interaction checker for a pharmacy education demo. Given two medication names, analyze whether they interact.

Respond with STRICT JSON ONLY — no markdown, no code fences, no commentary — matching EXACTLY this shape:
{
  "severity": "Low" | "Moderate" | "Major",
  "mechanism": "<why they do or don't interact, in 1-3 sentences>",
  "recommendation": "<practical guidance in 1 sentence>"
}
Base this on sound, real pharmacology. If there is no clinically significant interaction, say so plainly with severity "Low".`;

export default function InteractionsPage() {
  const [drugA, setDrugA] = useState(null);
  const [drugB, setDrugB] = useState(null);
  const [customA, setCustomA] = useState("");
  const [customB, setCustomB] = useState("");
  const [liveResult, setLiveResult] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();

  const staticInteraction =
    drugA && drugB ? getInteraction(drugA, drugB) : null;
  const interaction = liveMode ? liveResult : staticInteraction;
  const lineColor = interaction
    ? SEVERITY_LINE_COLOR[interaction.severity] || "#94A3B8"
    : "#334155";

  function pick(drug) {
    if (liveMode) return;
    if (drugA === drug) {
      setDrugA(null);
      return;
    }
    if (drugB === drug) {
      setDrugB(null);
      return;
    }
    if (!drugA) setDrugA(drug);
    else if (!drugB) setDrugB(drug);
    else {
      setDrugA(drug);
      setDrugB(null);
    }
  }

  async function checkLive() {
    if (!customA.trim() || !customB.trim()) return;
    setLiveError(null);
    setLiveLoading(true);
    setLiveResult(null);
    setDrugA(customA.trim());
    setDrugB(customB.trim());
    try {
      const json = await askAIJson(
        `Drug A: ${customA.trim()}\nDrug B: ${customB.trim()}`,
        { system: INTERACTION_SYSTEM_PROMPT, maxTokens: 400 },
      );
      setLiveResult(json);
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
          eyebrow="Interaction Visualizer"
          title="Pick Two Medications"
          subtitle={
            liveMode
              ? "Live AI Mode is on — type any two medications and Claude checks the interaction in real time."
              : "Select any two drug cards to see whether — and why — they interact."
          }
        />

        {liveMode ? (
          <GlowCard className="mb-6">
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={customA}
                onChange={(e) => setCustomA(e.target.value)}
                placeholder="Drug A, e.g. Sildenafil"
                className="bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
              />
              <input
                type="text"
                value={customB}
                onChange={(e) => setCustomB(e.target.value)}
                placeholder="Drug B, e.g. Isosorbide Mononitrate"
                className="bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
              />
            </div>
            <PrimaryButton
              onClick={checkLive}
              disabled={liveLoading || !customA.trim() || !customB.trim()}
              className="flex items-center gap-2"
            >
              <FiZap size={14} /> Check Live Interaction
            </PrimaryButton>
          </GlowCard>
        ) : (
          <div className="flex flex-wrap gap-2.5 mb-10">
            {INTERACTION_DRUGS.map((d) => {
              const active = d === drugA || d === drugB;
              return (
                <button
                  key={d}
                  onClick={() => pick(d)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                    active
                      ? "bg-gradient-to-r from-hospital-blue to-ai-violet text-white border-transparent glow-blue"
                      : "border-white/12 text-slate-300 hover:border-white/25 hover:bg-white/5"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        )}

        {liveMode && liveLoading && (
          <GlowCard className="mb-5">
            <LiveThinking label="Checking interaction with Phantom..." />
          </GlowCard>
        )}
        {liveMode && liveError && (
          <GlowCard className="mb-5">
            <AIErrorNote message={liveError} onRetry={checkLive} />
          </GlowCard>
        )}

        <GlowCard className="relative min-h-[220px] flex items-center justify-center overflow-hidden">
          {!drugA && !drugB && (
            <p className="text-slate-500 text-sm">
              Select two medications above to visualize their interaction.
            </p>
          )}

          {(drugA || drugB) && (
            <div className="w-full flex items-center justify-between gap-6 relative py-8">
              <DrugNode name={drugA} />
              <div className="flex-1 relative h-1 flex items-center">
                {drugA && drugB && interaction && (
                  <motion.div
                    className="h-[3px] w-full rounded-full relative"
                    style={{ background: lineColor }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                      style={{ background: lineColor }}
                      animate={{ left: ["0%", "100%"] }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </motion.div>
                )}
                {(!drugA || !drugB || !interaction) && (
                  <div className="h-[2px] w-full bg-white/10 border-dashed" />
                )}
                {interaction && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <FiZap style={{ color: lineColor }} size={20} />
                  </div>
                )}
              </div>
              <DrugNode name={drugB} />
            </div>
          )}
        </GlowCard>

        {interaction && (
          <FadeIn delay={0.15} className="mt-5">
            {liveMode && (
              <LiveModeNote>
                Live AI Mode — this analysis was generated live by Claude, not
                scripted
              </LiveModeNote>
            )}
            <GlowCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">
                  {drugA} + {drugB}
                </h3>
                <SeverityPill level={interaction.severity} />
              </div>
              <p className="text-[13px] text-slate-300 mb-3 leading-relaxed">
                {interaction.mechanism}
              </p>
              <p className="text-[13px] text-ai-cyan">
                → {interaction.recommendation}
              </p>
            </GlowCard>
          </FadeIn>
        )}
      </main>
    </>
  );
}

function DrugNode({ name }) {
  return (
    <div className="flex flex-col items-center gap-2 w-28 sm:w-36 shrink-0">
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border ${
          name
            ? "bg-gradient-to-br from-hospital-blue/30 to-ai-violet/30 border-ai-cyan/30 glow-blue"
            : "border-white/10 bg-white/[0.02]"
        }`}
      >
        <span className="text-2xl">💊</span>
      </div>
      <span className="text-xs sm:text-sm text-center font-medium text-slate-200">
        {name || "—"}
      </span>
    </div>
  );
}
