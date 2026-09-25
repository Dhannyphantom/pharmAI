// Shared Web Speech API helper — text-to-speech (SpeechSynthesis) and
// speech-to-text (SpeechRecognition), used across Communication and the
// Patient Portal.
//
// IMPORTANT, READ BEFORE CHANGING: as of testing, no browser or OS ships a
// real synthesized voice for Hausa, Yoruba, or Igbo. If you just set
// `utterance.lang = "yo-NG"` and call speak(), the browser does NOT refuse —
// it silently substitutes its default voice (usually English) and reads the
// text phonetically through it. That produces audio that sounds like speech
// but is unintelligible as the target language, which is exactly the bug
// this file works around: instead of guessing, it checks whether a voice
// that actually matches the requested language is installed, and reports
// back so the caller can be honest with the user rather than playing
// mispronounced audio and calling it done.
//
// The one credible option for real Yoruba/Igbo/Hausa synthesis today is a
// specialist model (e.g. YarnGPT2, github.com/saheedniyi02/yarngpt) run
// behind your own inference endpoint — that's a backend/infra decision, not
// something this client-side helper can conjure on its own.

export const LANGUAGE_SPEECH_CODES = {
  English: "en-US",
  Hausa: "ha-NG",
  Yoruba: "yo-NG",
  Igbo: "ig-NG",
  "Nigerian Pidgin": "en-NG",
};

// Short prefix used to match installed voices — a device with a "yo-NG" or
// plain "yo" voice installed should match either way.
const LANGUAGE_PREFIXES = {
  English: "en",
  Hausa: "ha",
  Yoruba: "yo",
  Igbo: "ig",
  "Nigerian Pidgin": "en", // no dedicated Pidgin voice exists anywhere; this
                           // intentionally matches English voices, since an
                           // English voice reading Pidgin text is at least
                           // pronounced as real words, unlike the other three.
};

export function getSpeechLangCode(language) {
  return LANGUAGE_SPEECH_CODES[language] || "en-US";
}

export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

export function isSpeechRecognitionSupported() {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

let cachedVoices = [];
let voicesLoaded = false;

function loadVoices() {
  if (!isSpeechSynthesisSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    cachedVoices = voices;
    voicesLoaded = true;
  }
  return cachedVoices;
}

if (isSpeechSynthesisSupported()) {
  loadVoices();
  // Chrome loads voices asynchronously — the list is often empty on the
  // very first call, so refresh the cache once the browser reports it has
  // them ready.
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Returns the best installed voice for `language`, or null if this device
 * has no voice that actually speaks it. Never falls back to a mismatched
 * voice silently — that's the caller's decision to make, explicitly.
 */
export function findVoiceForLanguage(language = "English") {
  const voices = voicesLoaded ? cachedVoices : loadVoices();
  const prefix = (LANGUAGE_PREFIXES[language] || "en").toLowerCase();
  return voices.find((v) => v.lang?.toLowerCase().startsWith(prefix)) || null;
}

/**
 * True if this device has a real voice for `language`. For Hausa, Yoruba,
 * and Igbo this will almost always be false — that's accurate, not a bug.
 */
export function hasNativeVoice(language = "English") {
  return !!findVoiceForLanguage(language);
}

/**
 * Speak `text` in `language`. Returns { spoken: boolean, native: boolean }:
 * - native: true means a real voice for that language was found and used.
 * - native: false + spoken: true means it fell back to the closest
 *   available voice (only ever English) and the caller should tell the
 *   user this is an approximation, not silently play it as if correct.
 * - spoken: false means speech synthesis isn't supported at all here.
 */
export function speak(text, language = "English", { onStart, onEnd, allowFallback = true } = {}) {
  if (!isSpeechSynthesisSupported() || !text) return { spoken: false, native: false };

  const nativeVoice = findVoiceForLanguage(language);
  if (!nativeVoice && !allowFallback) return { spoken: false, native: false };

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getSpeechLangCode(language);
  if (nativeVoice) {
    utterance.voice = nativeVoice;
  } else {
    // No real voice for this language exists on this device — fall back to
    // English so at least the words are pronounced as real words, rather
    // than however the default voice guesses at unfamiliar text.
    const englishVoice = findVoiceForLanguage("English");
    if (englishVoice) utterance.voice = englishVoice;
    utterance.lang = "en-US";
  }
  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return { spoken: true, native: !!nativeVoice };
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}

/**
 * Creates a SpeechRecognition instance configured for the given language
 * name, or null if the browser doesn't support the API at all. Note:
 * Chrome's speech recognition is cloud-backed and does have Hausa support
 * in some builds — this is a different (better) situation than TTS output,
 * but still not guaranteed on every device. Callers must still handle
 * `onerror` and fall back accordingly.
 */
export function createRecognition(language = "English") {
  if (!isSpeechRecognitionSupported()) return null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = getSpeechLangCode(language);
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  return recognition;
}
