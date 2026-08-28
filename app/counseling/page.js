"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiInfo,
  FiClock,
  FiAlertOctagon,
  FiHeart,
  FiPackage,
  FiEye,
  FiActivity,
  FiZap,
  FiUser,
  FiBookOpen,
  FiShield,
  FiLayers,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import {
  PageHeader,
  GlowCard,
  FadeIn,
  LiveThinking,
  AIErrorNote,
  LiveModeNote,
  PrimaryButton,
  SegmentedTabs,
  BackButton,
} from "@/components/ui";
import { COUNSELING_DRUGS } from "@/lib/counselingData";
import { useApp } from "@/context/AppContext";
import { askAIJson } from "@/lib/aiClient";

const PATIENT_SECTIONS = [
  {
    key: "explanation",
    label: "What This Medicine Does",
    icon: FiInfo,
    single: true,
  },
  { key: "howToTake", label: "How To Take It", icon: FiClock, single: true },
  {
    key: "commonSideEffects",
    label: "Common Side Effects",
    icon: FiActivity,
    list: true,
  },
  {
    key: "seriousSideEffects",
    label: "Serious Side Effects — Seek Help",
    icon: FiAlertOctagon,
    list: true,
    danger: true,
  },
  {
    key: "lifestyleAdvice",
    label: "Lifestyle Advice",
    icon: FiHeart,
    list: true,
  },
  {
    key: "missedDose",
    label: "If You Miss A Dose",
    icon: FiClock,
    single: true,
  },
  { key: "storage", label: "Storage", icon: FiPackage, single: true },
  { key: "monitoring", label: "Monitoring", icon: FiEye, single: true },
];

const CLINICAL_FIELDS = [
  { key: "drugClass", label: "Drug Class", icon: FiLayers },
  { key: "strengths", label: "Strengths & Formulations", icon: FiPackage },
  { key: "adultDosing", label: "Adult Dosing", icon: FiActivity },
  {
    key: "contraindications",
    label: "Contraindications",
    icon: FiShield,
    danger: true,
  },
  {
    key: "keyInteractions",
    label: "Key Interactions",
    icon: FiShield,
    danger: true,
  },
];

const VIEW_TABS = [
  { value: "patient", label: "Patient Counselling", icon: FiUser },
  { value: "clinical", label: "Clinical Reference", icon: FiBookOpen },
];

const COUNSELING_SYSTEM_PROMPT = `You are a patient-counselling and clinical-reference content generator for a pharmacy education demo. Given a medication name, produce both a patient-friendly counselling card and a clinician-facing reference summary.

Respond with STRICT JSON ONLY — no markdown, no code fences, no commentary — matching EXACTLY this shape:
{
  "name": "<medication name, properly capitalised>",
  "explanation": "<plain-language explanation of what it does>",
  "howToTake": "<how to take it>",
  "commonSideEffects": ["<string>", ...],
  "seriousSideEffects": ["<string>", ...],
  "lifestyleAdvice": ["<string>", ...],
  "missedDose": "<what to do if a dose is missed>",
  "storage": "<storage instructions>",
  "monitoring": "<what monitoring, if any, is typically involved>",
  "clinical": {
    "drugClass": "<therapeutic class>",
    "strengths": "<common strengths/formulations available>",
    "adultDosing": "<typical adult dosing>",
    "contraindications": "<key contraindications>",
    "keyInteractions": "<key drug interactions>"
  }
}
Use warm, friendly, patient-facing language for the top-level fields (7th-grade reading level), and precise clinical language for the "clinical" object. Base clinical content on sound, real pharmacology.`;

export default function CounselingPage() {
  const [view, setView] = useState("patient");
  const [selected, setSelected] = useState(null);
  const [customDrug, setCustomDrug] = useState("");
  const [liveCard, setLiveCard] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();

  async function generateLive(name) {
    if (!name.trim()) return;
    setSelected(null);
    setLiveLoading(true);
    setLiveError(null);
    setLiveCard(null);
    try {
      const json = await askAIJson(`Medication name: ${name.trim()}`, {
        system: COUNSELING_SYSTEM_PROMPT,
        maxTokens: 900,
      });
      setLiveCard(json);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  const staticDrug = selected
    ? COUNSELING_DRUGS.find((x) => x.id === selected)
    : null;
  const displayed = liveMode ? liveCard : staticDrug;

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="Patient Counselling & Drug Reference"
          title="Select a Medication"
          subtitle={
            liveMode
              ? "Live AI Mode is on — type any medication name and Claude generates both the counselling card and clinical reference in real time."
              : "PharmAI generates a patient-friendly explanation and a clinical reference for each medicine — always reviewed by a pharmacist before it reaches a patient."
          }
        />

        {liveMode && (
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <input
              type="text"
              value={customDrug}
              onChange={(e) => setCustomDrug(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateLive(customDrug)}
              placeholder="Type any medication name, e.g. Amlodipine, Sertraline, Rivaroxaban..."
              className="flex-1 bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
            />
            <PrimaryButton
              onClick={() => generateLive(customDrug)}
              disabled={liveLoading || !customDrug.trim()}
              className="flex items-center gap-2 justify-center"
            >
              <FiZap size={14} /> Generate Live
            </PrimaryButton>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {COUNSELING_DRUGS.map((d) => (
            <button
              key={d.id}
              onClick={() =>
                liveMode
                  ? generateLive(d.name)
                  : setSelected(d.id === selected ? null : d.id)
              }
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                (liveMode ? false : selected === d.id)
                  ? "bg-gradient-to-r from-hospital-blue to-ai-violet text-white border-transparent glow-blue"
                  : "border-white/12 text-slate-300 hover:border-white/25 hover:bg-white/5"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {liveMode && liveLoading && (
          <GlowCard>
            <LiveThinking label="Generating counselling card with Phantom..." />
          </GlowCard>
        )}
        {liveMode && liveError && (
          <GlowCard>
            <AIErrorNote message={liveError} />
          </GlowCard>
        )}

        <AnimatePresence mode="wait">
          {displayed && (
            <motion.div
              key={displayed.name || displayed.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              {liveMode ? (
                <LiveModeNote>
                  Live AI Mode — this card was generated live by Claude, not
                  scripted
                </LiveModeNote>
              ) : (
                <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase text-ai-cyan bg-ai-cyan/10 border border-ai-cyan/25 rounded-full px-3 py-1.5">
                  ✨ AI Generated Draft — Must Be Reviewed By a Pharmacist
                  Before Use
                </div>
              )}
              <h2 className="text-2xl font-bold text-white mb-5">
                {displayed.name}
              </h2>

              <SegmentedTabs
                tabs={VIEW_TABS}
                active={view}
                onChange={setView}
              />

              {view === "patient" && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {PATIENT_SECTIONS.map((s, i) => {
                    const Icon = s.icon;
                    const content = displayed[s.key];
                    if (content == null) return null;
                    return (
                      <FadeIn
                        key={s.key}
                        delay={i * 0.06}
                        className={
                          s.single && s.key === "explanation"
                            ? "sm:col-span-2"
                            : ""
                        }
                      >
                        <GlowCard
                          className={
                            s.danger ? "border-danger/30 bg-danger/5" : ""
                          }
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon
                              className={
                                s.danger ? "text-danger" : "text-ai-cyan"
                              }
                              size={16}
                            />
                            <h3
                              className={`text-sm font-bold ${s.danger ? "text-danger" : "text-white"}`}
                            >
                              {s.label}
                            </h3>
                          </div>
                          {Array.isArray(content) ? (
                            <ul className="text-[13px] text-slate-300 space-y-1 list-disc list-inside">
                              {content.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[13px] text-slate-300 leading-relaxed">
                              {content}
                            </p>
                          )}
                        </GlowCard>
                      </FadeIn>
                    );
                  })}
                </div>
              )}

              {view === "clinical" && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {!displayed.clinical ? (
                    <div className="sm:col-span-2 text-slate-500 text-sm py-8 text-center">
                      No clinical reference available for this entry.
                    </div>
                  ) : (
                    CLINICAL_FIELDS.map((f, i) => {
                      const Icon = f.icon;
                      const content = displayed.clinical[f.key];
                      if (!content) return null;
                      return (
                        <FadeIn
                          key={f.key}
                          delay={i * 0.06}
                          className={
                            f.key === "drugClass" ? "sm:col-span-2" : ""
                          }
                        >
                          <GlowCard
                            className={
                              f.danger ? "border-danger/30 bg-danger/5" : ""
                            }
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Icon
                                className={
                                  f.danger ? "text-danger" : "text-ai-violet"
                                }
                                size={16}
                              />
                              <h3
                                className={`text-sm font-bold ${f.danger ? "text-danger" : "text-white"}`}
                              >
                                {f.label}
                              </h3>
                            </div>
                            <p className="text-[13px] text-slate-300 leading-relaxed">
                              {content}
                            </p>
                          </GlowCard>
                        </FadeIn>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!displayed && !liveLoading && !liveError && (
          <div className="text-center text-slate-500 text-sm py-16">
            {liveMode
              ? "Type a medication above, or pick a quick preset, to generate its counselling card live."
              : "Select a medication above to generate its counselling card."}
          </div>
        )}
      </main>
    </>
  );
}
