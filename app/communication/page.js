"use client";
import { useState } from "react";
import {
  FiSend, FiGlobe, FiVolume2, FiZap, FiTrash2, FiUser, FiUserCheck, FiMic, FiMicOff,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, PrimaryButton, BackButton, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import { LANGUAGES, COMMON_PHRASES, getCannedPhraseTranslation, getRandomPatientReply } from "@/lib/translations";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";

const TRANSLATION_SYSTEM_PROMPT = (language) => `You are helping a hospital pharmacist communicate with a patient across a language barrier. Translate the pharmacist's message into ${language}, using simple everyday words a patient would understand. Preserve the medical meaning exactly. Respond with ONLY the translated text, no commentary, no quotation marks.`;

export default function CommunicationPage() {
  const { liveMode } = useApp();
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [listening, setListening] = useState(false);
  const [lastReplyEn, setLastReplyEn] = useState(null);

  function speak(text) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInputText("");
    setLiveError(null);

    const canned = getCannedPhraseTranslation(trimmed, language);
    if (canned) {
      setMessages((m) => [...m, { role: "pharmacist", en: trimmed, translated: canned }]);
      return;
    }

    if (!liveMode) {
      setMessages((m) => [...m, { role: "pharmacist", en: trimmed, translated: null, noMatch: true }]);
      return;
    }

    setLiveLoading(true);
    try {
      const translated = await askAI(trimmed, { system: TRANSLATION_SYSTEM_PROMPT(language), maxTokens: 200 });
      setMessages((m) => [...m, { role: "pharmacist", en: trimmed, translated }]);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  function insertPhrase(phrase) {
    send(phrase.en);
  }

  // Simulates listening to the patient speak in their own language and
  // converting it to English for the pharmacist. Real browser speech
  // recognition doesn't reliably support Hausa/Yoruba/Igbo/Pidgin, so this
  // demonstrates the intended patient-to-English flow with a realistic
  // "listening" pause and a representative example reply rather than
  // actual microphone capture.
  async function simulateListen() {
    setListening(true);
    await new Promise((resolve) => setTimeout(resolve, 1600));
    const reply = getRandomPatientReply(language, lastReplyEn);
    setLastReplyEn(reply.en);
    setMessages((m) => [...m, { role: "patient", original: reply.original, english: reply.en }]);
    setListening(false);
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="Communication"
          title="Patient Communication — Bridging Language Barriers"
          subtitle={
            liveMode
              ? "Live AI Mode is on — type any counselling message and Claude translates it in real time."
              : "Type a message or tap a common phrase below. Common phrases translate instantly; switch on Live AI Mode to translate anything else."
          }
        />

        <div className="flex items-center gap-3 mb-6">
          <FiGlobe className="text-ai-violet shrink-0" size={16} />
          <span className="text-sm text-slate-300">Translating into:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/[0.04] border border-white/12 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-ai-violet"
          >
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors">
              <FiTrash2 size={12} /> Clear
            </button>
          )}
        </div>

        <GlowCard className="mb-5">
          <h3 className="text-white font-bold text-sm mb-3">Common Phrases — Tap to Translate & Send</h3>
          <div className="flex flex-wrap gap-2">
            {COMMON_PHRASES.map((p) => (
              <button
                key={p.en}
                onClick={() => insertPhrase(p)}
                className="text-[12px] px-3 py-2 rounded-xl border border-white/12 text-slate-300 hover:border-ai-violet/40 hover:bg-ai-violet/5 transition-colors text-left"
              >
                {p.en}
              </button>
            ))}
          </div>
        </GlowCard>

        <GlowCard className="mb-5 p-0 overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto p-5 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-10">Type a message below, tap a common phrase above, or simulate listening to the patient to begin.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className="space-y-1.5">
                {m.role === "pharmacist" ? (
                  <>
                    <div className="flex justify-end">
                      <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-gradient-to-r from-hospital-blue to-ai-violet text-white text-[13px] leading-relaxed flex items-center gap-2">
                        <FiUserCheck size={12} className="shrink-0 opacity-70" /> {m.en}
                      </div>
                    </div>
                    {m.translated && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white/[0.04] border border-white/10 text-slate-200 text-[13px] leading-relaxed flex items-start gap-2">
                          <FiUser size={12} className="shrink-0 mt-0.5 opacity-60" />
                          <span>{m.translated}</span>
                          <button onClick={() => speak(m.translated)} className="shrink-0 text-slate-500 hover:text-white transition-colors" title="Read aloud">
                            <FiVolume2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                    {m.noMatch && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-warn/10 border border-warn/25 text-warn text-[12.5px]">
                          No sample translation for this exact phrase — switch on Live AI Mode to translate it.
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] space-y-1.5">
                      <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-mint/10 border border-mint/25 text-slate-200 text-[13px] leading-relaxed flex items-center gap-2">
                        <FiMic size={12} className="shrink-0 text-mint" /> {m.original}
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-[12.5px] flex items-center gap-2">
                        <span className="text-[9.5px] font-bold uppercase tracking-wide text-mint shrink-0">English</span> {m.english}
                        <button onClick={() => speak(m.english)} className="ml-auto shrink-0 text-slate-500 hover:text-white transition-colors" title="Read aloud">
                          <FiVolume2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {liveLoading && <LiveThinking label={`Translating into ${language}...`} />}
          </div>
        </GlowCard>

        {liveError && <div className="mb-4"><AIErrorNote message={liveError} /></div>}
        {liveMode && messages.some((m) => m.role === "pharmacist" && m.translated) && (
          <div className="mb-4"><LiveModeNote>Live AI Mode — translations generated by Claude, not scripted</LiveModeNote></div>
        )}

        {/* Patient's Response — simulated listening from the patient's
            language into English, since real speech recognition for these
            languages isn't reliably available in the browser. */}
        <GlowCard className="mb-5 border-mint/20">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`relative w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                listening ? "border-danger/50 text-danger bg-danger/10 pulse-ring" : "border-mint/40 text-mint bg-mint/10"
              }`}>
                {listening ? <FiMicOff size={16} /> : <FiMic size={16} />}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Patient's Response</div>
                <p className="text-[12px] text-slate-400">Simulates listening to the patient speak in {language} and converting it to English.</p>
              </div>
            </div>
            <PrimaryButton onClick={simulateListen} disabled={listening} className="flex items-center gap-2 shrink-0">
              <FiMic size={14} /> {listening ? "Listening..." : "Simulate Listening"}
            </PrimaryButton>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Real-time speech recognition for Hausa, Yoruba, Igbo, and Pidgin isn't reliably supported in the browser yet — this uses a representative example reply to demonstrate the intended patient-to-English flow.</p>
        </GlowCard>

        <GlowCard>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(inputText)}
              placeholder="Type what you'd like to tell the patient..."
              className="flex-1 bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-violet"
            />
            <PrimaryButton onClick={() => send(inputText)} disabled={!inputText.trim() || liveLoading} className="flex items-center gap-2">
              {liveMode ? <FiZap size={14} /> : <FiSend size={14} />} Send
            </PrimaryButton>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Sample and AI-generated translations are illustrative — for high-stakes conversations, use a qualified interpreter or a trained bilingual colleague.</p>
        </GlowCard>
      </main>
    </>
  );
}
