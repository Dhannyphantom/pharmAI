"use client";
import { useState, useEffect, useRef } from "react";
import {
  FiMessageCircle, FiSend, FiMic, FiMicOff, FiRotateCcw, FiArrowLeft,
  FiUser, FiThumbsUp, FiZap, FiAlertTriangle, FiVolume2,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, BackButton, PrimaryButton, GhostButton, LiveThinking, AIErrorNote } from "@/components/ui";
import { TRAINING_SCENARIOS, COACH_STYLE } from "@/lib/trainingData";
import { useApp } from "@/context/AppContext";
import { askAIJson } from "@/lib/aiClient";

function buildSystemPrompt(scenario) {
  return `${scenario.persona}

You are also, in the same response, acting as a pharmacy-education AI coach observing a pharmacy student practising patient counselling with you (the patient). After staying in character to reply as the patient, separately evaluate the student's most recent message as a coach.

Respond with STRICT JSON ONLY — no markdown, no code fences, no commentary — matching EXACTLY this shape:
{
  "patientReply": "<your in-character reply as the patient, 1-3 sentences>",
  "coach": { "type": "praise" | "tip" | "correction", "text": "<one short, specific coaching sentence about the student's last message>" }
}
Use "correction" when the student said something clinically wrong or missed something important, "tip" for a good message that could still be improved, and "praise" for a strong message. Be specific and concise — this is for a pharmacy education demo.`;
}

const COACH_ICON = { praise: FiThumbsUp, tip: FiZap, correction: FiAlertTriangle };
const COACH_BADGE_STYLE = {
  praise: "bg-mint/10 border-mint/25 text-mint",
  tip: "bg-ai-cyan/10 border-ai-cyan/25 text-ai-cyan",
  correction: "bg-warn/10 border-warn/25 text-warn",
};

export default function TrainingPage() {
  const { liveMode } = useApp();
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [audioMode, setAudioMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setSpeechSupported(typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function selectScenario(s) {
    setScenario(s);
    setMessages(liveMode ? [{ speaker: "patient", text: s.openingLine }] : []);
    setScriptIndex(0);
    setInputText("");
    setLiveError(null);
  }

  function restart() {
    if (!scenario) return;
    setMessages(liveMode ? [{ speaker: "patient", text: scenario.openingLine }] : []);
    setScriptIndex(0);
    setLiveError(null);
  }

  function playNext() {
    if (!scenario || scriptIndex >= scenario.scriptedSession.length) return;
    setMessages((m) => [...m, scenario.scriptedSession[scriptIndex]]);
    setScriptIndex((i) => i + 1);
  }

  function speak(text) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  async function sendLive(text) {
    if (!text.trim() || !scenario) return;
    const studentMsg = { speaker: "student", text: text.trim() };
    setMessages((m) => [...m, studentMsg]);
    setInputText("");
    setLiveLoading(true);
    setLiveError(null);
    try {
      const transcript = messages
        .filter((m) => m.speaker !== "coach")
        .map((m) => `${m.speaker === "patient" ? scenario.patientName : "Student"}: ${m.text}`)
        .join("\n");
      const prompt = `Conversation so far:\n${transcript}\n\nStudent: ${text.trim()}`;
      const json = await askAIJson(prompt, { system: buildSystemPrompt(scenario), maxTokens: 400 });
      setMessages((m) => [...m, { speaker: "patient", text: json.patientReply }, { speaker: "coach", type: json.coach?.type || "tip", text: json.coach?.text || "" }]);
      if (audioMode) speak(json.patientReply);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      sendLive(transcript);
    };
    recognition.start();
  }

  const stats = messages.reduce(
    (acc, m) => {
      if (m.speaker === "coach") acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    },
    { praise: 0, tip: 0, correction: 0 }
  );

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="Pharmacy Training"
          title="Counselling Practice — Virtual Patient"
          subtitle={
            liveMode
              ? "Live AI Mode — chat or talk with the virtual patient in real time. Claude plays the patient and coaches your counselling as you go."
              : "Simulated Mode — step through a worked example session to see how the coaching works. Switch on Live AI Mode for a free-form conversation."
          }
        />

        {!scenario && (
          <div className="grid sm:grid-cols-2 gap-4">
            {TRAINING_SCENARIOS.map((s, i) => (
              <FadeIn key={s.id} delay={i * 0.08}>
                <GlowCard interactive className="h-full cursor-pointer" onClick={() => selectScenario(s)}>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hospital-blue/30 to-ai-violet/30 flex items-center justify-center shrink-0">
                      <FiUser className="text-ai-cyan" size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{s.patientName}</div>
                      <div className="text-[11px] text-slate-500">{s.age} yrs</div>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-300 font-medium mb-1.5">{s.condition}</p>
                  <p className="text-[12px] text-slate-500 leading-relaxed">{s.briefing}</p>
                </GlowCard>
              </FadeIn>
            ))}
          </div>
        )}

        {scenario && (
          <FadeIn>
            <button onClick={() => setScenario(null)} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 mb-4">
              <FiArrowLeft size={12} /> Choose a different patient
            </button>

            <GlowCard className="mb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hospital-blue/30 to-ai-violet/30 flex items-center justify-center shrink-0">
                    <FiUser className="text-ai-cyan" size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{scenario.patientName} <span className="text-slate-500 font-normal">· {scenario.age} yrs</span></div>
                    <div className="text-[11.5px] text-slate-400">{scenario.condition}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                    <span className="flex items-center gap-1 text-mint bg-mint/10 border border-mint/25 rounded-full px-2 py-1"><FiThumbsUp size={10} /> {stats.praise}</span>
                    <span className="flex items-center gap-1 text-ai-cyan bg-ai-cyan/10 border border-ai-cyan/25 rounded-full px-2 py-1"><FiZap size={10} /> {stats.tip}</span>
                    <span className="flex items-center gap-1 text-warn bg-warn/10 border border-warn/25 rounded-full px-2 py-1"><FiAlertTriangle size={10} /> {stats.correction}</span>
                  </div>
                  <GhostButton onClick={restart} className="!px-2.5 !py-1.5 text-xs flex items-center gap-1.5"><FiRotateCcw size={12} /> Restart</GhostButton>
                </div>
              </div>
            </GlowCard>

            {/* Transcript */}
            <GlowCard className="mb-4 p-0 overflow-hidden">
              <div ref={scrollRef} className="max-h-[420px] overflow-y-auto p-5 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-slate-500 text-sm py-10">Click &ldquo;Next&rdquo; below to begin the session.</p>
                )}
                {messages.map((m, i) => {
                  if (m.speaker === "coach") {
                    const style = COACH_STYLE[m.type] || COACH_STYLE.tip;
                    const badgeCls = COACH_BADGE_STYLE[m.type] || COACH_BADGE_STYLE.tip;
                    const Icon = COACH_ICON[m.type] || FiZap;
                    return (
                      <div key={i} className={`flex items-start gap-2 ml-8 p-2.5 rounded-lg border text-[12px] ${badgeCls}`}>
                        <Icon className="shrink-0 mt-0.5" size={13} />
                        <div>
                          <span className="font-bold uppercase tracking-wide text-[10px]">Coach — {style.label}</span>
                          <p className="text-slate-300 mt-0.5">{m.text}</p>
                        </div>
                      </div>
                    );
                  }
                  const isStudent = m.speaker === "student";
                  return (
                    <div key={i} className={`flex ${isStudent ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                        isStudent ? "bg-gradient-to-r from-hospital-blue to-ai-violet text-white rounded-br-sm" : "bg-white/[0.04] border border-white/10 text-slate-200 rounded-bl-sm"
                      }`}>
                        {!isStudent && <div className="text-[10px] font-bold uppercase tracking-wide text-ai-cyan mb-0.5">{scenario.patientName}</div>}
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                {liveLoading && <LiveThinking label={`${scenario.patientName} is responding...`} />}
              </div>
            </GlowCard>

            {liveError && <div className="mb-4"><AIErrorNote message={liveError} /></div>}

            {/* Input row */}
            {liveMode ? (
              <GlowCard>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setAudioMode((a) => !a)}
                    disabled={!speechSupported}
                    title={speechSupported ? "Toggle audio mode" : "Speech recognition not supported in this browser"}
                    className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 ${
                      audioMode ? "border-ai-cyan/50 text-ai-cyan bg-ai-cyan/10" : "border-white/12 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FiVolume2 size={12} /> {audioMode ? "Audio Mode On" : "Switch to Audio"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendLive(inputText)}
                    placeholder="Type your response to the patient..."
                    disabled={liveLoading}
                    className="flex-1 bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan disabled:opacity-50"
                  />
                  {audioMode && speechSupported && (
                    <button
                      onClick={startListening}
                      disabled={liveLoading || listening}
                      className={`shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
                        listening ? "border-danger/50 text-danger bg-danger/10 pulse-ring relative" : "border-ai-cyan/40 text-ai-cyan bg-ai-cyan/10 hover:bg-ai-cyan/20"
                      }`}
                    >
                      {listening ? <FiMicOff size={16} /> : <FiMic size={16} />}
                    </button>
                  )}
                  <PrimaryButton onClick={() => sendLive(inputText)} disabled={liveLoading || !inputText.trim()} className="flex items-center gap-2">
                    <FiSend size={14} /> Send
                  </PrimaryButton>
                </div>
              </GlowCard>
            ) : (
              <div className="flex justify-center">
                <PrimaryButton
                  onClick={playNext}
                  disabled={scriptIndex >= scenario.scriptedSession.length}
                  className="flex items-center gap-2"
                >
                  <FiMessageCircle size={14} />
                  {scriptIndex >= scenario.scriptedSession.length ? "Session Complete" : "Next"}
                </PrimaryButton>
              </div>
            )}
          </FadeIn>
        )}
      </main>
    </>
  );
}
