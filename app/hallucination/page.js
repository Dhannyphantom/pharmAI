"use client";
import { useState } from "react";
import { FiCpu, FiAlertOctagon, FiCheckCircle, FiUser, FiInfo } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, PrimaryButton, ProgressRing, FadeIn } from "@/components/ui";
import { HALLUCINATION_CASE as H } from "@/lib/miscData";
import { useApp } from "@/context/AppContext";

export default function HallucinationPage() {
  const [revealed, setRevealed] = useState(false);
  const { liveMode } = useApp();

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <PageHeader
          eyebrow="An Important Pause"
          title="Should We Trust This?"
          subtitle="This is the most important module in the whole demo. AI can be confidently, fluently wrong."
        />

        {liveMode && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-ai-violet/10 border border-ai-violet/25 text-[12px] text-slate-300">
            <FiInfo className="text-ai-violet shrink-0 mt-0.5" size={14} />
            <span>
              This module stays scripted even in Live AI Mode, on purpose. Its entire teaching point depends on
              showing one specific, guaranteed-wrong recommendation — a real live model call could happen to answer
              correctly and undercut the lesson. Every other module in this app supports Live AI Mode.
            </span>
          </div>
        )}

        <GlowCard className="mb-6">
          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">Patient Note</div>
          <p className="text-sm text-slate-300 mb-4">{H.patientNote}</p>
          <div className="p-4 rounded-xl bg-ai-cyan/5 border border-ai-cyan/25">
            <div className="flex items-center gap-2 text-ai-cyan font-semibold text-sm mb-2"><FiCpu /> AI Recommendation</div>
            <p className="text-white text-sm font-medium mb-3">{H.aiRecommendation}</p>
            <div className="flex items-center gap-3">
              <ProgressRing percent={H.aiConfidence} size={64} stroke={7} color="#22D3EE" />
              <span className="text-[12px] text-slate-400">The AI is highly confident. That doesn&apos;t make it right.</span>
            </div>
          </div>
        </GlowCard>

        {!revealed ? (
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-4">Ask the room: should we trust this recommendation?</p>
            <PrimaryButton onClick={() => setRevealed(true)}>Reveal Why This Is Wrong</PrimaryButton>
          </div>
        ) : (
          <FadeIn>
            <div className="space-y-4">
              <GlowCard className="border-danger/30">
                <div className="flex items-center gap-2 text-danger font-bold text-sm mb-2"><FiAlertOctagon /> Why the AI Is Wrong</div>
                <p className="text-[13px] text-slate-300 leading-relaxed">{H.whyWrong}</p>
              </GlowCard>
              <GlowCard className="border-mint/30">
                <div className="flex items-center gap-2 text-mint font-bold text-sm mb-2"><FiCheckCircle /> Correct Clinical Recommendation</div>
                <p className="text-[13px] text-slate-300 leading-relaxed">{H.correctRecommendation}</p>
              </GlowCard>
              <GlowCard className="border-ai-violet/30">
                <div className="flex items-center gap-2 text-ai-violet font-bold text-sm mb-2"><FiUser /> Clinical Judgement</div>
                <p className="text-[13px] text-slate-300 leading-relaxed">{H.clinicalJudgement}</p>
              </GlowCard>

              <div className="text-center pt-6">
                <p className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  AI assists pharmacists.<br /><span className="text-gradient">It does not replace pharmacists.</span>
                </p>
              </div>
            </div>
          </FadeIn>
        )}
      </main>
    </>
  );
}
