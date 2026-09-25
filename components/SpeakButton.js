"use client";
import { useEffect, useState } from "react";
import { FiVolume2, FiVolumeX, FiAlertCircle } from "react-icons/fi";
import { speak, stopSpeaking, isSpeechSynthesisSupported, hasNativeVoice } from "@/lib/speech";

/**
 * Small inline "read aloud" toggle. Renders nothing if the browser has no
 * speech synthesis support, or if there's no text to read.
 *
 * If this device has no real voice for `language` (true today for Hausa,
 * Yoruba, and Igbo on essentially every browser), it still offers to play
 * an English-voice approximation but marks it clearly rather than
 * pretending the audio is in the target language.
 *
 *   <SpeakButton text="Take with food." language="Yoruba" />
 */
export default function SpeakButton({ text, language = "English", size = 13, className = "", title }) {
  const [speaking, setSpeaking] = useState(false);
  const [native, setNative] = useState(true);
  const supported = isSpeechSynthesisSupported();

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  if (!supported || !text) return null;

  function toggle() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const result = speak(text, language, { onEnd: () => setSpeaking(false) });
    if (result.spoken) {
      setNative(result.native);
      setSpeaking(true);
    }
  }

  const noNativeVoice = language !== "English" && !hasNativeVoice(language);

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        title={title || (speaking ? "Stop" : noNativeVoice ? `No ${language} voice on this device — plays an approximation` : "Read aloud")}
        className={`shrink-0 text-slate-400 hover:text-white transition-colors ${className}`}
      >
        {speaking ? <FiVolumeX size={size} /> : <FiVolume2 size={size} />}
      </button>
      {noNativeVoice && (
        <FiAlertCircle size={size - 2} className="shrink-0 text-warn" title={`No real ${language} voice available on this device`} />
      )}
    </span>
  );
}
