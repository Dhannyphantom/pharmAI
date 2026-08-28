"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckCircle,
  FiXCircle,
  FiPhoneCall,
  FiCpu,
  FiUser,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import {
  PageHeader,
  GlowCard,
  PrimaryButton,
  GhostButton,
  FadeIn,
  LiveThinking,
  AIErrorNote,
  LiveModeNote,
} from "@/components/ui";
import ConfettiBurst from "@/components/ConfettiBurst";
import {
  pickRandomChallengeQuestions,
  shuffleArray,
} from "@/lib/challengeData";
import { useApp } from "@/context/AppContext";
import { askAIJson } from "@/lib/aiClient";

const SESSION_LENGTH = 5;

const OPTIONS = [
  {
    value: "YES",
    label: "Yes, Dispense",
    icon: FiCheckCircle,
    color: "border-mint/40 text-mint hover:bg-mint/10",
  },
  {
    value: "NO",
    label: "No, Do Not Dispense",
    icon: FiXCircle,
    color: "border-danger/40 text-danger hover:bg-danger/10",
  },
  {
    value: "CONSULT DOCTOR",
    label: "Consult Doctor",
    icon: FiPhoneCall,
    color: "border-warn/40 text-warn hover:bg-warn/10",
  },
];

const CHALLENGE_SYSTEM_PROMPT = `You are generating one "would you dispense this?" challenge question for a live pharmacy-education quiz.

Given a prescription scenario written by the presenter, respond with STRICT JSON ONLY — no markdown, no code fences, no commentary — matching EXACTLY this shape:
{
  "prescription": "<restate or lightly clean up the scenario as a single clear sentence>",
  "correctAnswer": "YES" | "NO" | "CONSULT DOCTOR",
  "aiDetected": "<what an AI safety check would flag, or note that nothing was detected>",
  "pharmacistReasoning": "<how a pharmacist reasons through this — 2-3 sentences>"
}
Base this on sound, real pharmacology and standard practice. Make the scenario genuinely tricky — the kind of case a rushed clinician could plausibly get wrong — rather than an obvious textbook contraindication.`;

export default function ChallengePage() {
  const [sessionQuestions, setSessionQuestions] = useState(() =>
    pickRandomChallengeQuestions(SESSION_LENGTH),
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const { score, addScore, resetScore, liveMode } = useApp();

  const [customPrompt, setCustomPrompt] = useState("");
  const [liveQuestion, setLiveQuestion] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  const current =
    liveMode && liveQuestion ? liveQuestion : sessionQuestions[index];
  const isCorrect = answer === current.correctAnswer;

  // Randomise the on-screen order of the answer buttons per question, so the
  // correct answer's position isn't a learnable pattern either.
  const shuffledOptions = useMemo(() => shuffleArray(OPTIONS), [current]);

  async function generateLiveQuestion() {
    if (!customPrompt.trim()) return;
    setLiveLoading(true);
    setLiveError(null);
    setAnswer(null);
    setRevealed(false);
    try {
      const json = await askAIJson(
        `Prescription scenario: ${customPrompt.trim()}`,
        { system: CHALLENGE_SYSTEM_PROMPT, maxTokens: 500 },
      );
      setLiveQuestion(json);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  function choose(value) {
    if (revealed) return;
    setAnswer(value);
    setRevealed(true);
    addScore(value === current.correctAnswer);
  }

  function next() {
    if (liveMode) {
      setLiveQuestion(null);
      setCustomPrompt("");
      setAnswer(null);
      setRevealed(false);
      return;
    }
    if (index + 1 < sessionQuestions.length) {
      setIndex(index + 1);
      setAnswer(null);
      setRevealed(false);
    }
  }

  function restart() {
    setSessionQuestions(pickRandomChallengeQuestions(SESSION_LENGTH));
    setIndex(0);
    setAnswer(null);
    setRevealed(false);
    setLiveQuestion(null);
    setCustomPrompt("");
    resetScore();
  }

  const finished =
    !liveMode && revealed && index === sessionQuestions.length - 1;

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <PageHeader
          eyebrow="Audience Challenge"
          title="AI vs Pharmacist"
          subtitle={
            liveMode
              ? "Live AI Mode is on — type any prescription scenario and Claude generates a fresh challenge question in real time."
              : `Would you dispense this prescription? ${SESSION_LENGTH} random tricky scenarios each round, drawn from a larger pool — choose an answer, then see what the AI detected and how a pharmacist reasons through it.`
          }
        />

        {liveMode && (
          <GlowCard className="mb-6">
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Describe a prescription scenario
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Sertraline 50mg for a patient already taking tramadol for chronic back pain"
              rows={2}
              className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan mb-3"
            />
            <PrimaryButton
              onClick={generateLiveQuestion}
              disabled={liveLoading || !customPrompt.trim()}
              className="flex items-center gap-2"
            >
              <FiZap size={14} /> Generate Live Challenge
            </PrimaryButton>
          </GlowCard>
        )}

        {liveMode && liveLoading && (
          <GlowCard className="mb-6">
            <LiveThinking label="Generating challenge with Phantom..." />
          </GlowCard>
        )}
        {liveMode && liveError && (
          <GlowCard className="mb-6">
            <AIErrorNote message={liveError} onRetry={generateLiveQuestion} />
          </GlowCard>
        )}

        {(!liveMode || liveQuestion) && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-slate-400">
                {liveMode
                  ? "Live Custom Question"
                  : `Question ${index + 1} of ${sessionQuestions.length}`}
              </div>
              <div className="glass rounded-full px-4 py-1.5 text-sm font-semibold text-white">
                Score: <span className="text-ai-cyan">{score.correct}</span> /{" "}
                {score.total}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={liveMode ? "live" : current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {liveMode && (
                  <LiveModeNote>
                    Live AI Mode — generated by Claude, not scripted
                  </LiveModeNote>
                )}
                <GlowCard className="mb-5">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                    Prescription
                  </div>
                  <p className="text-white text-base sm:text-lg font-medium leading-relaxed">
                    {current.prescription}
                  </p>
                </GlowCard>

                {!revealed && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    {shuffledOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => choose(opt.value)}
                        className={`flex flex-col items-center gap-2 p-5 rounded-xl border bg-white/[0.02] transition ${opt.color}`}
                      >
                        <opt.icon size={22} />
                        <span className="text-sm font-semibold">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {revealed && (
                  <FadeIn>
                    <GlowCard
                      className={
                        isCorrect ? "border-mint/30" : "border-danger/30"
                      }
                      glow={isCorrect ? "glow-mint" : "glow-danger"}
                    >
                      <div
                        className={`flex items-center gap-2 font-bold mb-4 ${isCorrect ? "text-mint" : "text-danger"}`}
                      >
                        {isCorrect ? <FiCheckCircle /> : <FiXCircle />}
                        {isCorrect
                          ? "Correct — matches expert consensus"
                          : `Not quite — correct answer was "${current.correctAnswer}"`}
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-ai-cyan/5 border border-ai-cyan/20">
                          <div className="flex items-center gap-2 text-ai-cyan font-semibold text-sm mb-1.5">
                            <FiCpu size={14} /> What AI Detected
                          </div>
                          <p className="text-[13px] text-slate-300 leading-relaxed">
                            {current.aiDetected}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-ai-violet/5 border border-ai-violet/20">
                          <div className="flex items-center gap-2 text-ai-violet font-semibold text-sm mb-1.5">
                            <FiUser size={14} /> Pharmacist Reasoning
                          </div>
                          <p className="text-[13px] text-slate-300 leading-relaxed">
                            {current.pharmacistReasoning}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6 gap-3">
                        {liveMode ? (
                          <PrimaryButton onClick={next}>
                            Ask Another Question
                          </PrimaryButton>
                        ) : !finished ? (
                          <PrimaryButton onClick={next}>
                            Next Prescription
                          </PrimaryButton>
                        ) : (
                          <GhostButton
                            onClick={restart}
                            className="flex items-center gap-2"
                          >
                            <FiRefreshCw size={14} /> Restart Challenge
                          </GhostButton>
                        )}
                      </div>
                    </GlowCard>
                    {finished && isCorrect && (
                      <ConfettiBurst trigger={finished} />
                    )}
                  </FadeIn>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {liveMode && !liveQuestion && !liveLoading && !liveError && (
          <div className="text-center text-slate-500 text-sm py-10">
            Describe a prescription scenario above to generate a live challenge
            question.
          </div>
        )}
      </main>
    </>
  );
}
