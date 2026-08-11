"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiZap } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, AnimatedCounter, FadeIn, PrimaryButton, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import { DISCOVERY_FUNNEL, DISCOVERY_TIMELINE } from "@/lib/miscData";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";

const DISCOVERY_SYSTEM_PROMPT = `You are explaining AI-accelerated drug discovery for a pharmacy education audience. Given a funnel of illustrative figures (molecules screened down to one approved medicine) and a timeline comparison, write a concise (under 100 words) plain-language explanation of why AI meaningfully shortens this pipeline. No markdown, no JSON.`;

export default function DrugDiscoveryPage() {
  const maxYears = Math.max(...DISCOVERY_TIMELINE.map((t) => t.years));
  const [liveText, setLiveText] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();

  async function explain() {
    setLiveError(null);
    setLiveLoading(true);
    setLiveText(null);
    try {
      const text = await askAI(
        `Funnel: ${JSON.stringify(DISCOVERY_FUNNEL.map((s) => ({ label: s.label, value: s.value })))}\nTimeline: ${JSON.stringify(DISCOVERY_TIMELINE)}`,
        { system: DISCOVERY_SYSTEM_PROMPT, maxTokens: 300 }
      );
      setLiveText(text);
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
          eyebrow="Drug Discovery"
          title="From Millions of Molecules to One Medicine"
          subtitle="A simplified illustration of how AI narrows an enormous search space down to a handful of viable drug candidates."
        />

        <GlowCard className="mb-6">
          <div className="space-y-5">
            {DISCOVERY_FUNNEL.map((stage, i) => {
              const widthPct = 100 - i * 18;
              return (
                <FadeIn key={stage.label} delay={i * 0.15}>
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm text-slate-300">{stage.label}</span>
                      <span className="text-lg font-bold text-white">
                        <AnimatedCounter value={stage.value} />
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${stage.colorClass}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </GlowCard>

        <FadeIn delay={0.8}>
          <GlowCard>
            <h3 className="text-white font-bold text-sm mb-4">Timeline Reduction</h3>
            <div className="space-y-4">
              {DISCOVERY_TIMELINE.map((t, i) => (
                <div key={t.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300">{t.label}</span>
                    <span className="text-white font-semibold">{t.years} years</span>
                  </div>
                  <div className="h-4 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${i === 0 ? "bg-slate-500" : "bg-gradient-to-r from-ai-cyan to-mint"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(t.years / maxYears) * 100}%` }}
                      transition={{ duration: 1.1, delay: 0.9 + i * 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12.5px] text-slate-500 mt-4">Illustrative figures for educational purposes — actual timelines vary widely by therapeutic area and regulatory pathway.</p>

            {liveMode && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <PrimaryButton onClick={explain} disabled={liveLoading} className="flex items-center gap-2 mb-3">
                  <FiZap size={14} /> Ask Live AI to Explain This
                </PrimaryButton>
                {liveLoading && <LiveThinking label="Thinking with Claude..." />}
                {liveError && <AIErrorNote message={liveError} onRetry={explain} />}
                {liveText && (
                  <FadeIn>
                    <LiveModeNote>Live AI Mode — generated by Claude, not scripted</LiveModeNote>
                    <p className="text-[13px] text-slate-200 leading-relaxed p-3 rounded-lg bg-ai-cyan/5 border border-ai-cyan/20">{liveText}</p>
                  </FadeIn>
                )}
              </div>
            )}
          </GlowCard>
        </FadeIn>
      </main>
    </>
  );
}
