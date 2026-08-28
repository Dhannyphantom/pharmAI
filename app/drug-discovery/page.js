"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiZap, FiExternalLink, FiCheckCircle } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import {
  PageHeader,
  GlowCard,
  AnimatedCounter,
  FadeIn,
  PrimaryButton,
  BackButton,
  LiveThinking,
  AIErrorNote,
  LiveModeNote,
} from "@/components/ui";
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
        { system: DISCOVERY_SYSTEM_PROMPT, maxTokens: 300 },
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
        <BackButton label="Back to home" fallbackHref="/" />
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
                      <span className="text-sm text-slate-300">
                        {stage.label}
                      </span>
                      <span className="text-lg font-bold text-white">
                        <AnimatedCounter value={stage.value} />
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${stage.colorClass}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{
                          duration: 1,
                          delay: i * 0.15,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </GlowCard>

        <FadeIn delay={0.8}>
          <GlowCard className="mb-6">
            <h3 className="text-white font-bold text-sm mb-4">
              Timeline Reduction
            </h3>
            <div className="space-y-4">
              {DISCOVERY_TIMELINE.map((t, i) => (
                <div key={t.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300">{t.label}</span>
                    <span className="text-white font-semibold">
                      {t.years} years
                    </span>
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
            <p className="text-[12.5px] text-slate-500 mt-4">
              Illustrative figures for educational purposes — actual timelines
              vary widely by therapeutic area and regulatory pathway.
            </p>

            {liveMode && (
              <div className="mt-5 pt-5 border-t border-white/10">
                <PrimaryButton
                  onClick={explain}
                  disabled={liveLoading}
                  className="flex items-center gap-2 mb-3"
                >
                  <FiZap size={14} /> Ask Live AI to Explain This
                </PrimaryButton>
                {liveLoading && (
                  <LiveThinking label="Thinking with Phantom..." />
                )}
                {liveError && (
                  <AIErrorNote message={liveError} onRetry={explain} />
                )}
                {liveText && (
                  <FadeIn>
                    <LiveModeNote>
                      Live AI Mode — generated by Claude, not scripted
                    </LiveModeNote>
                    <p className="text-[13px] text-slate-200 leading-relaxed p-3 rounded-lg bg-ai-cyan/5 border border-ai-cyan/20">
                      {liveText}
                    </p>
                  </FadeIn>
                )}
              </div>
            )}
          </GlowCard>
        </FadeIn>

        {/* Real-world example — not illustrative, an actual documented case */}
        <FadeIn delay={1.0}>
          <GlowCard className="border-mint/25" glow="glow-mint">
            <div className="flex items-center gap-2 mb-1">
              <FiCheckCircle className="text-mint" size={16} />
              <div className="text-eyebrow !text-mint">
                Real-World Example — Not Illustrative
              </div>
            </div>
            <h3 className="text-white font-bold text-lg mb-3">
              Rentosertib (INS018_055) — Insilico Medicine
            </h3>
            <p className="text-[13.5px] text-slate-300 leading-relaxed mb-3">
              Rentosertib is a small-molecule drug for idiopathic pulmonary
              fibrosis (IPF) whose biological target (TNIK) and molecular
              structure were both identified using Insilico Medicine&apos;s
              generative AI platform, Pharma.AI. The program went from project
              start to a nominated drug candidate in roughly 18 months, and
              reached Phase 1 human trials in under 30 months — around half the
              typical timeline for this stage of drug development. Phase IIa
              results, published in <em>Nature Medicine</em> in June 2025,
              showed a dose-dependent improvement in lung function versus
              placebo, and the program advanced into Phase III trials in July
              2026.
            </p>
            <p className="text-[12.5px] text-slate-400 leading-relaxed mb-4">
              It is widely cited as the first case of a drug candidate whose
              target discovery, molecular design, and clinical validation were
              all AI-driven, reaching this stage of development.
            </p>
            <a
              href="https://www.nature.com/articles/s41591-025-03743-2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-mint hover:text-mint/80 transition-colors"
            >
              Verify — Nature Medicine, Phase IIa results (2025){" "}
              <FiExternalLink size={12} />
            </a>
          </GlowCard>
        </FadeIn>
      </main>
    </>
  );
}
