"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiAlertTriangle,
  FiShield,
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiPhoneCall,
  FiEye,
  FiTarget,
  FiPercent,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import {
  GlowCard,
  PrimaryButton,
  GhostButton,
  SeverityPill,
  ProgressRing,
  FadeIn,
  StaggerList,
  LiveThinking,
  AIErrorNote,
  LiveModeNote,
} from "@/components/ui";
import CountdownTimer from "@/components/CountdownTimer";
import ScanningSequence from "@/components/ScanningSequence";
import ConfettiBurst from "@/components/ConfettiBurst";
import { getCaseById } from "@/lib/cases";
import { useApp } from "@/context/AppContext";
import { askAIJson } from "@/lib/aiClient";

const SCAN_STEPS = [
  "Analyzing prescription...",
  "Checking allergies...",
  "Checking interactions...",
  "Checking renal function...",
  "Checking liver function...",
  "Checking duplicate therapy...",
  "Checking monitoring requirements...",
];

const ACTION_META = {
  Dispense: {
    icon: FiCheckCircle,
    color: "text-mint",
    glow: "glow-mint",
    bg: "bg-mint/10 border-mint/30",
  },
  "Dispense With Monitoring": {
    icon: FiEye,
    color: "text-ai-cyan",
    glow: "glow-cyan",
    bg: "bg-ai-cyan/10 border-ai-cyan/30",
  },
  "Consult Prescriber": {
    icon: FiPhoneCall,
    color: "text-warn",
    glow: "glow-blue",
    bg: "bg-warn/10 border-warn/30",
  },
  "Do Not Dispense": {
    icon: FiXCircle,
    color: "text-danger",
    glow: "glow-danger",
    bg: "bg-danger/10 border-danger/30",
  },
};

const REPORT_SYSTEM_PROMPT = `You are a clinical pharmacy AI assistant inside an educational simulation used to teach pharmacy interns. Given a patient's chart (JSON), analyze the new prescription against their history for interactions, contraindications, dosing issues, and monitoring needs.

Respond with STRICT JSON ONLY — no markdown, no code fences, no commentary before or after — matching EXACTLY this shape:
{
  "riskScore": <number 0-100>,
  "priority": "High" | "Medium" | "Low",
  "confidence": <number 0-100>,
  "interactions": [{"drugs": "<string>", "severity": "Low" | "Moderate" | "Major", "mechanism": "<string>", "recommendation": "<string>"}],
  "alternatives": ["<string>", ...],
  "monitoring": ["<string>", ...],
  "counsellingPoints": ["<string>", ...],
  "finalAction": "Dispense" | "Dispense With Monitoring" | "Consult Prescriber" | "Do Not Dispense",
  "finalReasoning": "<string>"
}

Base your analysis on sound, real pharmacology. This is for a pharmacy education demo, not real patient care — do not add disclaimers inside the JSON fields themselves.`;

export default function AssessCase() {
  const { id } = useParams();
  const router = useRouter();
  const patientCase = getCaseById(id);
  const { liveMode } = useApp();
  const [stage, setStage] = useState("chart"); // chart -> scanning -> report -> recommendation
  const [celebrate, setCelebrate] = useState(false);
  const [liveReport, setLiveReport] = useState(null);
  const [liveError, setLiveError] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);

  if (!patientCase) {
    return (
      <>
        <NavBar />
        <main className="flex-1 flex items-center justify-center text-slate-400">
          Case not found.
        </main>
      </>
    );
  }

  const c = patientCase;
  const report = liveMode && liveReport ? liveReport : c.aiReport;
  const finalAction =
    liveMode && liveReport
      ? liveReport.finalAction
      : c.finalRecommendation.action;
  const finalReasoning =
    liveMode && liveReport
      ? liveReport.finalReasoning
      : c.finalRecommendation.reasoning;
  const actionMeta =
    ACTION_META[finalAction] || ACTION_META["Consult Prescriber"];
  const ActionIcon = actionMeta.icon;

  async function runLiveAnalysis() {
    setLiveError(null);
    setLiveLoading(true);
    try {
      const chartSummary = {
        name: c.name,
        age: c.age,
        sex: c.sex,
        weight: c.weight,
        height: c.height,
        diagnosis: c.diagnosis,
        pastMedicalHistory: c.pastMedicalHistory,
        currentMedications: c.currentMedications,
        newPrescription: c.newPrescription,
        allergies: c.allergies,
        pregnancyStatus: c.pregnancyStatus,
        vitals: c.vitals,
        labs: c.labs,
        clinicalNotes: c.clinicalNotes,
      };
      const json = await askAIJson(JSON.stringify(chartSummary), {
        system: REPORT_SYSTEM_PROMPT,
        maxTokens: 1200,
      });
      setLiveReport(json);
      setStage("report");
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  function handleReveal() {
    if (liveMode) {
      setStage("scanning");
      runLiveAnalysis();
    } else {
      setStage("scanning");
    }
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/cases")}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 mb-6"
        >
          <FiArrowLeft size={13} /> Back to case library
        </button>

        {/* Patient banner - always visible */}
        <GlowCard className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold tracking-widest text-ai-cyan uppercase mb-1">
                Patient Chart
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {c.name}
              </h1>
              <p className="text-sm text-slate-400">
                {c.age} yrs • {c.sex} • {c.weight} • {c.height}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                Diagnosis
              </div>
              <div className="text-sm text-slate-200 font-medium max-w-xs">
                {c.diagnosis}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-5 text-sm">
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">
                Past Medical History
              </div>
              <ul className="text-slate-300 space-y-0.5 list-disc list-inside text-[13px]">
                {c.pastMedicalHistory.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">
                Current Medications
              </div>
              <ul className="text-slate-300 space-y-0.5 list-disc list-inside text-[13px]">
                {c.currentMedications.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-warn/10 border border-warn/25">
            <div className="text-[11px] font-semibold text-warn uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <FiAlertTriangle size={12} /> New Prescription
            </div>
            <div className="text-sm text-white font-medium">
              {c.newPrescription.drug} {c.newPrescription.dose} —{" "}
              {c.newPrescription.route}, {c.newPrescription.frequency}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-5 text-[13px]">
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">
                Vitals
              </div>
              {Object.entries(c.vitals).map(([k, v]) => (
                <div key={k} className="flex justify-between text-slate-300">
                  <span className="text-slate-500">{k.toUpperCase()}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">
                Labs
              </div>
              {Object.entries(c.labs).map(([k, v]) => (
                <div key={k} className="flex justify-between text-slate-300">
                  <span className="text-slate-500">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">
                Allergies & Status
              </div>
              <div className="text-slate-300">{c.allergies}</div>
              <div className="text-slate-300 mt-1">{c.pregnancyStatus}</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-3 mb-1">
                Clinical Notes
              </div>
              <div className="text-slate-400 text-[12.5px] leading-relaxed">
                {c.clinicalNotes}
              </div>
            </div>
          </div>
        </GlowCard>

        {/* STAGE: chart -> ask audience */}
        {stage === "chart" && (
          <GlowCard className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <CountdownTimer seconds={30} onComplete={() => {}} />
            <PrimaryButton onClick={handleReveal}>
              Reveal AI Analysis
            </PrimaryButton>
          </GlowCard>
        )}

        {/* STAGE: scanning */}
        {stage === "scanning" && !liveMode && (
          <GlowCard glow="glow-cyan">
            <ScanningSequence
              steps={SCAN_STEPS}
              onComplete={() => setStage("report")}
            />
          </GlowCard>
        )}

        {stage === "scanning" && liveMode && (
          <GlowCard glow="glow-cyan">
            {liveLoading && (
              <LiveThinking label="Analyzing live with Phantom..." />
            )}
            {liveError && (
              <AIErrorNote message={liveError} onRetry={runLiveAnalysis} />
            )}
            {!liveLoading && !liveError && (
              <div className="text-center py-6">
                <PrimaryButton onClick={runLiveAnalysis}>
                  Retry Live Analysis
                </PrimaryButton>
              </div>
            )}
          </GlowCard>
        )}

        {/* STAGE: report */}
        {stage === "report" && (
          <div className="space-y-5">
            {liveMode && liveReport && (
              <LiveModeNote>
                Live AI Mode — this report was generated live by Claude, not
                scripted
              </LiveModeNote>
            )}
            <GlowCard>
              <div className="flex flex-wrap items-center gap-8 justify-around">
                <ProgressRing
                  percent={report.riskScore}
                  color="#EF4444"
                  label="Risk Score"
                />
                <ProgressRing
                  percent={report.confidence}
                  color="#22D3EE"
                  label="AI Confidence"
                />
                <div className="flex flex-col items-center gap-2">
                  <FiTarget className="text-warn" size={28} />
                  <SeverityPill
                    level={
                      report.priority === "High"
                        ? "High"
                        : report.priority === "Medium"
                          ? "Moderate"
                          : "Low"
                    }
                  />
                  <span className="text-[11px] text-slate-400">
                    Priority Level
                  </span>
                </div>
              </div>
            </GlowCard>

            <FadeIn>
              <GlowCard>
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FiAlertTriangle className="text-danger" /> Medication
                  Interactions
                </h3>
                <StaggerList
                  items={report.interactions}
                  renderItem={(it) => (
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white text-sm">
                          {it.drugs}
                        </span>
                        <SeverityPill level={it.severity} />
                      </div>
                      <p className="text-[13px] text-slate-300 mb-2">
                        {it.mechanism}
                      </p>
                      <p className="text-[13px] text-ai-cyan">
                        → {it.recommendation}
                      </p>
                    </div>
                  )}
                />
              </GlowCard>
            </FadeIn>

            <div className="grid sm:grid-cols-2 gap-5">
              <FadeIn delay={0.1}>
                <GlowCard className="h-full">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <FiShield className="text-mint" /> Alternative Options
                  </h3>
                  <StaggerList
                    items={report.alternatives}
                    startDelay={0.2}
                    renderItem={(alt) => (
                      <div className="text-[13px] text-slate-300 p-3 rounded-lg bg-mint/5 border border-mint/15">
                        {alt}
                      </div>
                    )}
                  />
                </GlowCard>
              </FadeIn>
              <FadeIn delay={0.2}>
                <GlowCard className="h-full">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <FiActivity className="text-ai-cyan" /> Monitoring
                    Parameters
                  </h3>
                  <StaggerList
                    items={report.monitoring}
                    startDelay={0.3}
                    renderItem={(m) => (
                      <div className="text-[13px] text-slate-300 p-3 rounded-lg bg-ai-cyan/5 border border-ai-cyan/15">
                        {m}
                      </div>
                    )}
                  />
                </GlowCard>
              </FadeIn>
            </div>

            <FadeIn delay={0.3}>
              <GlowCard>
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <FiPercent className="text-ai-violet" /> Counselling Points
                </h3>
                <StaggerList
                  items={report.counsellingPoints}
                  startDelay={0.4}
                  renderItem={(p) => (
                    <div className="text-[13px] text-slate-300 p-3 rounded-lg bg-ai-violet/5 border border-ai-violet/15">
                      {p}
                    </div>
                  )}
                />
              </GlowCard>
            </FadeIn>

            <div className="flex justify-end">
              <PrimaryButton
                onClick={() => {
                  setStage("recommendation");
                  setCelebrate(true);
                }}
              >
                Show Final Recommendation
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* STAGE: recommendation */}
        {stage === "recommendation" && (
          <FadeIn>
            <GlowCard glow={actionMeta.glow} className="text-center">
              <div
                className={`w-16 h-16 mx-auto rounded-2xl border flex items-center justify-center mb-4 ${actionMeta.bg}`}
              >
                <ActionIcon className={actionMeta.color} size={28} />
              </div>
              <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">
                Final Recommendation
              </div>
              <h2
                className={`text-2xl sm:text-3xl font-bold mb-4 ${actionMeta.color}`}
              >
                {finalAction}
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
                {finalReasoning}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <GhostButton
                  onClick={() => {
                    setStage("chart");
                    setLiveReport(null);
                    setLiveError(null);
                  }}
                >
                  Review Again
                </GhostButton>
                <PrimaryButton onClick={() => router.push("/cases")}>
                  Next Patient
                </PrimaryButton>
              </div>
            </GlowCard>
            <ConfettiBurst trigger={celebrate} />
          </FadeIn>
        )}
      </main>
    </>
  );
}
