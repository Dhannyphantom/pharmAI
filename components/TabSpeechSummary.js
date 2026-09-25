"use client";
import { useState } from "react";
import { FiVolume2, FiVolumeX, FiZap } from "react-icons/fi";
import { speak, stopSpeaking, isSpeechSynthesisSupported, hasNativeVoice } from "@/lib/speech";
import { askAI } from "@/lib/aiClient";

const SUMMARY_TRANSLATION_PROMPT = (language) => `You are a medical translation assistant helping a patient understand a short spoken summary of one section of their pharmacy portal. Translate the given English summary into ${language}, using simple, everyday words a patient with no medical background would understand. Preserve the meaning exactly — do not add or remove information, and do not add any extra commentary. Respond with ONLY the translated text, no quotation marks.`;

/**
 * Renders a "Listen" pill that reads a plain-English summary of the
 * current tab aloud. If Live AI Mode is on and the patient's selected
 * language isn't English, the summary is translated live first.
 *
 * Honesty note: no browser ships a real voice for Hausa, Yoruba, or Igbo,
 * so translating the text doesn't actually get you audio in that language
 * — it gets read by a substitute (usually English) voice. Rather than
 * hide that, this shows the translated text on-screen either way and only
 * claims "in {language}" in the button label when a real voice for that
 * language actually exists on this device.
 */
export default function TabSpeechSummary({ summaryText, language = "English", liveMode }) {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [translatedText, setTranslatedText] = useState(null);
  const supported = isSpeechSynthesisSupported();

  if (!supported || !summaryText) return null;

  const nativeVoiceAvailable = language === "English" || hasNativeVoice(language);

  async function handlePlay() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setError(null);

    if (language === "English" || !liveMode) {
      speak(summaryText, "English", { onEnd: () => setSpeaking(false) });
      setSpeaking(true);
      return;
    }

    setLoading(true);
    try {
      const translated = await askAI(summaryText, {
        system: SUMMARY_TRANSLATION_PROMPT(language),
        maxTokens: 320,
      });
      setTranslatedText(translated);
      // Even without a native voice, play the translated text through the
      // closest available voice and show the text on-screen — better than
      // silence, as long as it isn't presented as accurate pronunciation.
      speak(translated, language, { onEnd: () => setSpeaking(false) });
      setSpeaking(true);
    } catch (e) {
      setError(e.message);
      speak(summaryText, "English", { onEnd: () => setSpeaking(false) });
      setSpeaking(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <div className="flex items-center flex-wrap gap-2">
        <button
          onClick={handlePlay}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-full border border-ai-cyan/40 text-ai-cyan bg-ai-cyan/10 hover:bg-ai-cyan/20 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <FiZap size={12} className="animate-pulse" />
          ) : speaking ? (
            <FiVolumeX size={12} />
          ) : (
            <FiVolume2 size={12} />
          )}
          {loading
            ? "Translating..."
            : speaking
              ? "Stop"
              : liveMode && language !== "English"
                ? nativeVoiceAvailable
                  ? `Listen in ${language}`
                  : `Translate to ${language}`
                : "Listen"}
        </button>
        {!liveMode && language !== "English" && (
          <span className="text-[11px] text-slate-500">Switch on Live AI Mode to translate this into {language}.</span>
        )}
        {liveMode && language !== "English" && !nativeVoiceAvailable && (
          <span className="text-[11px] text-warn">No {language} voice is available on this device — shown as text, read in an approximate voice.</span>
        )}
        {error && <span className="text-[11px] text-danger">Couldn&apos;t translate — played in English instead.</span>}
      </div>
      {translatedText && !nativeVoiceAvailable && (
        <p className="text-[12.5px] text-slate-300 p-2.5 rounded-lg bg-white/[0.03] border border-white/10">{translatedText}</p>
      )}
    </div>
  );
}
