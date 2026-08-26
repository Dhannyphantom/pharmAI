"use client";
import { useState, useMemo } from "react";
import {
  FiHeart, FiBell, FiDollarSign, FiGlobe, FiCheck, FiX, FiClock,
  FiAlertTriangle, FiShield, FiZap, FiVolume2, FiCheckCircle,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { GlowCard, FadeIn, StaggerList, SegmentedTabs, ProgressRing, PrimaryButton, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import { getSignedInPatient, getPatientAnalysis } from "@/lib/patients";
import { getAdherenceLog, computeAdherence, DAY_LABELS } from "@/lib/adherenceData";
import { buildPatientSafetyAlerts } from "@/lib/patientFriendly";
import { computePaymentRisk, PAYMENT_RISK_STYLE } from "@/lib/paymentRisk";
import { LANGUAGES, getCannedMedicationTranslation, COMMON_PHRASES } from "@/lib/translations";
import { findDrugByName } from "@/lib/counselingData";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";

const TABS = [
  { value: "overview", label: "Overview", icon: FiHeart },
  { value: "adherence", label: "Adherence", icon: FiCheckCircle },
  { value: "reminders", label: "Reminders", icon: FiBell },
  { value: "safety", label: "Safety Alerts", icon: FiShield },
  { value: "billing", label: "Billing", icon: FiDollarSign },
  { value: "language", label: "Language & Instructions", icon: FiGlobe },
];

const ALERT_COLOR_STYLE = {
  danger: "border-danger/25 bg-danger/5",
  warn: "border-warn/25 bg-warn/5",
};

function deriveReminderTimes(frequencyText) {
  const f = (frequencyText || "").toLowerCase();
  if (f.includes("once")) return ["8:00 AM"];
  if (f.includes("twice")) return ["8:00 AM", "8:00 PM"];
  if (f.includes("three times") || f.includes("thrice") || f.includes("tds")) return ["8:00 AM", "2:00 PM", "8:00 PM"];
  if (f.includes("four times") || f.includes("qds")) return ["6:00 AM", "12:00 PM", "6:00 PM", "12:00 AM"];
  const everyMatch = f.match(/every\s+(\d+)\s*h/);
  if (everyMatch) {
    const interval = Math.max(1, parseInt(everyMatch[1], 10));
    const times = [];
    for (let h = 6; times.length < Math.round(24 / interval); h += interval) {
      const hour = h % 24;
      const period = hour >= 12 ? "PM" : "AM";
      let hh = hour % 12;
      if (hh === 0) hh = 12;
      times.push(`${hh}:00 ${period}`);
    }
    return times;
  }
  return ["As directed"];
}

const TRANSLATION_SYSTEM_PROMPT = (language) => `You are a medical translation assistant helping a patient understand their medication instructions. Translate the given English instruction into ${language}, using simple, everyday words a patient with no medical background would understand. Preserve the medical meaning exactly — do not add or remove any safety information. Respond with ONLY the translated text, no commentary, no English repeated back, no quotation marks.`;

export default function PatientPortalPage() {
  const { liveMode } = useApp();
  const patient = getSignedInPatient();
  const [tab, setTab] = useState("overview");
  const [log, setLog] = useState(() => (patient ? getAdherenceLog(patient.id) : {}));
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [translateDrug, setTranslateDrug] = useState(null);
  const [liveTranslation, setLiveTranslation] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  const adherence = useMemo(() => computeAdherence(log), [log]);

  if (!patient) {
    return (
      <>
        <NavBar />
        <main className="flex-1 flex items-center justify-center text-slate-400">No signed-in patient session found.</main>
      </>
    );
  }

  const analysis = getPatientAnalysis(patient);
  const safetyAlerts = buildPatientSafetyAlerts(analysis);
  const paymentRisk = computePaymentRisk(patient.billingHistory || []);
  const outstandingBills = (patient.billingHistory || []).filter((b) => b.status !== "Paid");

  const allMeds = [
    ...patient.currentMedications.map((m) => ({ drug: m.trim().split(/\s+/)[0], full: m, frequency: m })),
    ...patient.newPrescriptions.filter((p) => !p.consumable).map((p) => ({ drug: p.drug, full: `${p.drug} ${p.dose}`, frequency: p.frequency })),
  ];
  const translatableMeds = allMeds.filter((m) => findDrugByName(m.drug) || getCannedMedicationTranslation(m.drug, language));
  const activeTranslateDrug = translateDrug || translatableMeds[0]?.drug || null;

  function markTaken(med) {
    setLog((prev) => {
      const days = [...(prev[med] || [])];
      const idx = days.findIndex((d) => d === null);
      if (idx === -1) return prev;
      days[idx] = true;
      return { ...prev, [med]: days };
    });
  }

  const reminders = allMeds.map((m) => ({ ...m, times: deriveReminderTimes(m.frequency) }));
  const nextReminder = reminders.find((r) => r.times[0] !== "As directed");

  async function translateLive() {
    if (!activeTranslateDrug) return;
    const info = findDrugByName(activeTranslateDrug);
    const instruction = info?.howToTake || `Take ${activeTranslateDrug} exactly as your pharmacist instructed.`;
    setLiveLoading(true);
    setLiveError(null);
    setLiveTranslation(null);
    try {
      const text = await askAI(instruction, { system: TRANSLATION_SYSTEM_PROMPT(language), maxTokens: 220 });
      setLiveTranslation(text);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <GlowCard className="mb-6 border-mint/20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint/30 to-ai-cyan/30 flex items-center justify-center shrink-0">
              <FiHeart className="text-mint" size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome back, {patient.name}</h1>
              <p className="text-sm text-slate-400">Here's a simple view of your medicines, reminders, and account.</p>
            </div>
          </div>
        </GlowCard>

        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "overview" && (
          <div className="grid sm:grid-cols-2 gap-5">
            <FadeIn>
              <GlowCard className="flex items-center gap-5">
                <ProgressRing percent={adherence.overallPercent} size={84} stroke={8} color="#34D399" />
                <div>
                  <div className="text-sm font-bold text-white mb-1">Medicine Adherence</div>
                  <p className="text-[12.5px] text-slate-400">{adherence.taken} doses taken, {adherence.missed} missed this week.</p>
                </div>
              </GlowCard>
            </FadeIn>
            <FadeIn delay={0.05}>
              <GlowCard className={safetyAlerts.length > 0 ? "border-warn/25" : "border-mint/25"}>
                <div className="flex items-center gap-2 mb-1">
                  <FiShield className={safetyAlerts.length > 0 ? "text-warn" : "text-mint"} size={16} />
                  <span className="text-sm font-bold text-white">Safety Alerts</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums mb-1">{safetyAlerts.length}</p>
                <p className="text-[12.5px] text-slate-400">{safetyAlerts.length > 0 ? "Worth a chat with your care team." : "Nothing flagged right now."}</p>
              </GlowCard>
            </FadeIn>
            <FadeIn delay={0.1}>
              <GlowCard className={outstandingBills.length > 0 ? "border-warn/25" : ""}>
                <div className="flex items-center gap-2 mb-1">
                  <FiDollarSign className="text-warn" size={16} />
                  <span className="text-sm font-bold text-white">Outstanding Bills</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums mb-1">₦{paymentRisk.outstandingTotal.toLocaleString()}</p>
                <p className="text-[12.5px] text-slate-400">{outstandingBills.length > 0 ? `${outstandingBills.length} item(s) awaiting payment.` : "You're all paid up."}</p>
              </GlowCard>
            </FadeIn>
            <FadeIn delay={0.15}>
              <GlowCard>
                <div className="flex items-center gap-2 mb-1">
                  <FiBell className="text-ai-cyan" size={16} />
                  <span className="text-sm font-bold text-white">Next Reminder</span>
                </div>
                {nextReminder ? (
                  <>
                    <p className="text-white font-semibold text-sm mb-0.5">{nextReminder.drug} — {nextReminder.times[0]}</p>
                    <p className="text-[12.5px] text-slate-400">Reminders are {remindersEnabled ? "on" : "off"}.</p>
                  </>
                ) : (
                  <p className="text-[12.5px] text-slate-400">No timed reminders set up yet.</p>
                )}
              </GlowCard>
            </FadeIn>
          </div>
        )}

        {tab === "adherence" && (
          <FadeIn>
            <GlowCard className="mb-5 flex items-center gap-5">
              <ProgressRing percent={adherence.overallPercent} label="This Week" />
              <div>
                <p className="text-sm text-slate-300 mb-1">You've taken <span className="text-mint font-semibold">{adherence.taken}</span> of <span className="font-semibold text-white">{adherence.total}</span> doses due so far this week.</p>
                <p className="text-[12.5px] text-slate-500">Tap &ldquo;Mark as Taken&rdquo; on a medicine below once you've had your next due dose.</p>
              </div>
            </GlowCard>

            <div className="space-y-4">
              {Object.keys(log).map((med) => {
                const days = log[med];
                const nextIdx = days.findIndex((d) => d === null);
                return (
                  <GlowCard key={med}>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <span className="text-sm font-semibold text-white">{med}</span>
                      <button
                        onClick={() => markTaken(med)}
                        disabled={nextIdx === -1}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-mint/40 text-mint bg-mint/10 hover:bg-mint/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {nextIdx === -1 ? "All Logged This Week" : "Mark as Taken"}
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {days.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 uppercase">{DAY_LABELS[i]}</span>
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                            d === true ? "bg-mint/15 border-mint/40 text-mint" :
                            d === false ? "bg-danger/15 border-danger/40 text-danger" :
                            "bg-white/[0.03] border-white/10 text-slate-600"
                          }`}>
                            {d === true ? <FiCheck size={13} /> : d === false ? <FiX size={13} /> : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                );
              })}
              {Object.keys(log).length === 0 && (
                <p className="text-center text-slate-500 text-sm py-10">No adherence log set up for this patient yet.</p>
              )}
            </div>
          </FadeIn>
        )}

        {tab === "reminders" && (
          <FadeIn>
            <GlowCard className="mb-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <FiBell className="text-ai-cyan" size={18} />
                <div>
                  <div className="text-sm font-bold text-white">Smart Reminders</div>
                  <p className="text-[12px] text-slate-400">Suggested times based on how often each medicine is prescribed.</p>
                </div>
              </div>
              <button
                onClick={() => setRemindersEnabled((v) => !v)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors ${
                  remindersEnabled ? "border-ai-cyan/50 text-ai-cyan bg-ai-cyan/10" : "border-white/12 text-slate-400"
                }`}
              >
                <FiZap size={12} /> {remindersEnabled ? "Reminders On" : "Reminders Off"}
              </button>
            </GlowCard>

            <StaggerList
              items={reminders}
              renderItem={(r) => (
                <GlowCard className={!remindersEnabled ? "opacity-50" : ""}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{r.drug}</div>
                      <div className="text-[12px] text-slate-400">{r.frequency}</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.times.map((t) => (
                        <span key={t} className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-ai-cyan/10 border border-ai-cyan/25 text-ai-cyan">
                          <FiClock size={10} /> {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              )}
            />
          </FadeIn>
        )}

        {tab === "safety" && (
          <FadeIn>
            {safetyAlerts.length === 0 ? (
              <GlowCard className="border-mint/25 flex items-center gap-3">
                <FiCheckCircle className="text-mint shrink-0" size={20} />
                <p className="text-sm text-slate-300">Nothing has been flagged about your current medicines — keep taking them as instructed.</p>
              </GlowCard>
            ) : (
              <StaggerList
                items={safetyAlerts}
                renderItem={(a) => (
                  <GlowCard className={ALERT_COLOR_STYLE[a.color]}>
                    <div className="flex items-start gap-3">
                      <FiAlertTriangle className={a.color === "danger" ? "text-danger shrink-0 mt-0.5" : "text-warn shrink-0 mt-0.5"} size={16} />
                      <div>
                        <div className="text-sm font-semibold text-white mb-1">{a.title}</div>
                        <p className="text-[12.5px] text-slate-300 mb-1.5">{a.message}</p>
                        <p className={`text-[12px] font-semibold ${a.color === "danger" ? "text-danger" : "text-warn"}`}>→ {a.action}</p>
                      </div>
                    </div>
                  </GlowCard>
                )}
              />
            )}
            <p className="text-[11px] text-slate-500 mt-4">This is a simplified summary, not a diagnosis — always confirm anything here with your pharmacist or doctor.</p>
          </FadeIn>
        )}

        {tab === "billing" && (
          <FadeIn>
            <GlowCard className={`mb-5 ${PAYMENT_RISK_STYLE[paymentRisk.level]}`}>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                <span className="text-sm font-bold text-white">Account Summary</span>
                <span className="text-2xl font-bold tabular-nums">₦{paymentRisk.outstandingTotal.toLocaleString()}</span>
              </div>
              <p className="text-[12.5px]">
                {outstandingBills.length === 0
                  ? "You have no outstanding balance — thank you for keeping your account up to date."
                  : `You have ${outstandingBills.length} item(s) awaiting payment. Please visit the billing desk or ask about a payment plan or NHIS coverage if needed.`}
              </p>
            </GlowCard>

            {outstandingBills.length > 0 && (
              <div className="space-y-2">
                {outstandingBills.map((b, i) => (
                  <GlowCard key={i} className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-200">{b.item}</div>
                      <div className="text-[11.5px] text-slate-500">{b.unit} · {b.date}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-200 font-semibold tabular-nums">₦{b.amount.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === "Overdue" ? "text-danger bg-danger/10 border-danger/30" : "text-warn bg-warn/10 border-warn/30"
                      }`}>{b.status}</span>
                    </div>
                  </GlowCard>
                ))}
              </div>
            )}
          </FadeIn>
        )}

        {tab === "language" && (
          <FadeIn>
            <GlowCard className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <FiGlobe className="text-ai-violet" size={16} />
                <h3 className="text-white font-bold text-sm">Get Your Instructions In Your Language</h3>
              </div>
              <p className="text-[12px] text-slate-500 mb-4">
                {liveMode
                  ? "Live AI Mode is on — Claude translates your medicine instructions in real time."
                  : "Simulated Mode shows sample translations for a few common medicines. Switch on Live AI Mode to translate any medicine on your chart."}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Medicine</label>
                  <select
                    value={activeTranslateDrug || ""}
                    onChange={(e) => { setTranslateDrug(e.target.value); setLiveTranslation(null); }}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-ai-violet"
                  >
                    {allMeds.map((m) => <option key={m.drug} value={m.drug}>{m.drug}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Language</label>
                  <select
                    value={language}
                    onChange={(e) => { setLanguage(e.target.value); setLiveTranslation(null); }}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-ai-violet"
                  >
                    {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {liveMode ? (
                <>
                  <PrimaryButton onClick={translateLive} disabled={liveLoading || !activeTranslateDrug} className="flex items-center gap-2 mb-3">
                    <FiZap size={14} /> Translate With Live AI
                  </PrimaryButton>
                  {liveLoading && <LiveThinking label={`Translating into ${language}...`} />}
                  {liveError && <AIErrorNote message={liveError} onRetry={translateLive} />}
                  {liveTranslation && (
                    <FadeIn>
                      <LiveModeNote>Live AI Mode — generated by Claude, not scripted</LiveModeNote>
                      <div className="p-4 rounded-xl bg-ai-violet/5 border border-ai-violet/20 flex items-start justify-between gap-3">
                        <p className="text-[14px] text-slate-100 leading-relaxed">{liveTranslation}</p>
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined" && window.speechSynthesis) {
                              window.speechSynthesis.cancel();
                              window.speechSynthesis.speak(new SpeechSynthesisUtterance(liveTranslation));
                            }
                          }}
                          className="shrink-0 p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/25 transition-colors"
                          title="Read aloud"
                        >
                          <FiVolume2 size={14} />
                        </button>
                      </div>
                    </FadeIn>
                  )}
                </>
              ) : (
                (() => {
                  const canned = activeTranslateDrug ? getCannedMedicationTranslation(activeTranslateDrug, language) : null;
                  return canned ? (
                    <div className="p-4 rounded-xl bg-ai-violet/5 border border-ai-violet/20">
                      <p className="text-[11px] text-slate-500 mb-1.5">English: {canned.en}</p>
                      <p className="text-[14px] text-slate-100 leading-relaxed">{canned.translated}</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-[12.5px] text-slate-500">
                      No sample translation available for this medicine yet — switch on Live AI Mode to translate it in real time.
                    </div>
                  );
                })()
              )}
            </GlowCard>

            <GlowCard>
              <h3 className="text-white font-bold text-sm mb-3">Common Phrases — {language}</h3>
              <div className="space-y-2.5">
                {COMMON_PHRASES.map((p) => (
                  <div key={p.en} className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                    <p className="text-[11.5px] text-slate-500 mb-1">{p.en}</p>
                    <p className="text-[13px] text-slate-200">{p.translations[language]}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-3">Sample translations for demonstration — always confirm with a trained interpreter or native speaker before real clinical use.</p>
            </GlowCard>
          </FadeIn>
        )}
      </main>
    </>
  );
}
