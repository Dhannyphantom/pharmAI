"use client";
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FiUser, FiAlertTriangle, FiCopy, FiActivity, FiShield,
  FiCheckCircle, FiXCircle, FiPhoneCall, FiEye, FiDollarSign, FiCamera,
  FiHeart, FiPackage, FiTarget, FiPercent, FiClock, FiChevronDown, FiChevronUp,
  FiArrowRight, FiSend, FiFilter, FiPlus, FiZap, FiHome, FiRepeat, FiRotateCcw,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, StaggerList, SeverityPill, ProgressRing, GhostButton, PrimaryButton, BackButton, LiveModeNote, AIErrorNote } from "@/components/ui";
import { getPatientByPid, getPatientAnalysis, allMedications } from "@/lib/patients";
import { getProcedureById } from "@/lib/surgicalData";
import { LMIS_STATUS_STYLE } from "@/lib/lmis";
import { getRecommendedAdditions } from "@/lib/prescriptionRecommendations";
import { computePaymentRisk, PAYMENT_RISK_STYLE } from "@/lib/paymentRisk";
import { interpretABG, getAcidBaseInterventions } from "@/lib/acidBase";
import { getAlternatives } from "@/lib/drugAlternatives";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";
import SectionNav from "@/components/SectionNav";

const ACTION_META = {
  Dispense: { icon: FiCheckCircle, color: "text-mint", bg: "bg-mint/10 border-mint/30" },
  "Dispense With Monitoring": { icon: FiEye, color: "text-ai-cyan", bg: "bg-ai-cyan/10 border-ai-cyan/30" },
  "Consult Prescriber": { icon: FiPhoneCall, color: "text-warn", bg: "bg-warn/10 border-warn/30" },
  "Do Not Dispense": { icon: FiXCircle, color: "text-danger", bg: "bg-danger/10 border-danger/30" },
};

const RENAL_BAND_STYLE = {
  normal: "text-mint bg-mint/10 border-mint/30",
  moderate: "text-warn bg-warn/10 border-warn/30",
  severe: "text-danger bg-danger/10 border-danger/30",
  failure: "text-danger bg-danger/20 border-danger/40",
};

const ABG_SEVERITY_PILL = {
  None: "Low",
  Mild: "Low",
  Moderate: "Moderate",
  Severe: "High",
};

const BILLING_UNITS = ["A&E", "NHIS Pharmacy", "In-Patient", "GOPD Pharmacy", "Paediatric", "Theatre", "Theatre Pharmacy", "O&G", "O&G Pharmacy", "Renal"];

export default function PatientWorkspacePage() {
  const { pid } = useParams();
  const { liveMode } = useApp();
  const patient = getPatientByPid(decodeURIComponent(pid));
  const [dispensed, setDispensed] = useState({});
  const [prescriptions, setPrescriptions] = useState(patient?.newPrescriptions || []);
  const [showBilling, setShowBilling] = useState(false);
  const [showCounselling, setShowCounselling] = useState(false);
  const [billingStatusFilter, setBillingStatusFilter] = useState("All");
  const [billingUnitFilter, setBillingUnitFilter] = useState("All");
  const [billingSort, setBillingSort] = useState("date-desc");
  const [reminderText, setReminderText] = useState(null);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderError, setReminderError] = useState(null);

  const paymentRisk = useMemo(() => computePaymentRisk(patient?.billingHistory || []), [patient]);

  async function draftReminder() {
    setReminderError(null);
    setReminderLoading(true);
    setReminderText(null);
    const outstanding = (patient.billingHistory || []).filter((b) => b.status !== "Paid");
    if (!liveMode) {
      // Simulated Mode — scripted template, no API call.
      setTimeout(() => {
        setReminderText(
          `Dear ${patient.name}, this is a reminder that ${outstanding.length} item(s) totaling ₦${paymentRisk.outstandingTotal.toLocaleString()} on your pharmacy account remain unpaid. Please settle this at your earliest convenience, or speak with our billing desk if you need a payment plan or NHIS coverage confirmed. Thank you.`
        );
        setReminderLoading(false);
      }, 500);
      return;
    }
    try {
      const text = await askAI(
        `Patient: ${patient.name}\nOutstanding items: ${outstanding.map((b) => `${b.item} (₦${b.amount}, ${b.status})`).join("; ")}\nTotal outstanding: ₦${paymentRisk.outstandingTotal}\nPayment risk level: ${paymentRisk.level}`,
        {
          system: "You are drafting a short, polite payment reminder message from a hospital pharmacy billing desk to a patient, for a pharmacy education demo. Under 80 words. Firm but courteous — no threats, mention the option of a payment plan or NHIS coverage check. Plain text, no markdown.",
          maxTokens: 200,
        }
      );
      setReminderText(text);
    } catch (e) {
      setReminderError(e.message);
    } finally {
      setReminderLoading(false);
    }
  }

  // Reset local prescription state if the person navigates from one patient
  // straight to another without a full page reload.
  useEffect(() => {
    setPrescriptions(patient?.newPrescriptions || []);
    setDispensed({});
  }, [patient?.pid]);

  const recommendedAdditions = useMemo(() => getRecommendedAdditions(prescriptions), [prescriptions]);

  function addRecommended(rec) {
    setPrescriptions((rx) => [
      ...rx,
      { drug: rec.item, dose: "", route: "N/A", frequency: "As needed for administration", dispensed: false, consumable: true, recommended: true },
    ]);
  }

  // Replace a prescription in-place with a suggested alternative (e.g. when
  // an interaction check flags it), keeping the original on hand so it can
  // be undone. Adding, rather than replacing, leaves the original
  // prescription untouched and appends the alternative as a new item —
  // useful when the pharmacist wants the prescriber to choose between them.
  function replacePrescriptionWithAlternative(index, alt) {
    setPrescriptions((rx) => rx.map((r, i) => {
      if (i !== index) return r;
      const original = r.swappedFrom || { drug: r.drug, dose: r.dose, route: r.route, frequency: r.frequency };
      return {
        drug: alt.drug,
        dose: alt.dose,
        route: alt.route,
        frequency: alt.frequency,
        dispensed: false,
        swappedFrom: original,
        swapRationale: alt.rationale,
      };
    }));
  }

  function addAlternativePrescription(alt) {
    setPrescriptions((rx) => [...rx, { ...alt, dispensed: false, isAlternative: true }]);
  }

  function undoSwap(index) {
    setPrescriptions((rx) => rx.map((r, i) => (i === index && r.swappedFrom ? { ...r.swappedFrom, dispensed: false } : r)));
  }

  const filteredBilling = useMemo(() => {
    let rows = [...(patient?.billingHistory || [])];
    if (billingStatusFilter !== "All") rows = rows.filter((b) => b.status === billingStatusFilter);
    if (billingUnitFilter !== "All") rows = rows.filter((b) => b.unit === billingUnitFilter);
    rows.sort((a, b) => {
      switch (billingSort) {
        case "date-asc": return a.date.localeCompare(b.date);
        case "price-desc": return b.amount - a.amount;
        case "price-asc": return a.amount - b.amount;
        case "unit": return a.unit.localeCompare(b.unit);
        case "date-desc":
        default: return b.date.localeCompare(a.date);
      }
    });
    return rows;
  }, [patient, billingStatusFilter, billingUnitFilter, billingSort]);

  if (!patient) {
    return (
      <>
        <NavBar />
        <main className="flex-1 flex items-center justify-center text-slate-400">Patient not found.</main>
      </>
    );
  }

  // Recomputed against the live `prescriptions` state (not the static
  // patient record) so interaction/duplicate/dose checks react immediately
  // when a prescription is added, replaced, or swapped for an alternative.
  const patientForAnalysis = { ...patient, newPrescriptions: prescriptions };
  const analysis = getPatientAnalysis(patientForAnalysis);
  const outstandingBills = patient.billingHistory.filter((b) => b.status !== "Paid");
  const actionMeta = patient.finalRecommendation ? ACTION_META[patient.finalRecommendation.action] : null;
  const ActionIcon = actionMeta?.icon;
  const procedure = analysis.theatreRequest ? getProcedureById(analysis.theatreRequest.procedureId) : null;

  // Drug name → inventory record, so each prescription row in Medications
  // can show unit stock, central stock, and auto-reorder status inline
  // without repeating the full lookup/LMIS logic used for the bottom
  // Inventory nudge section.
  const inventoryByDrug = Object.fromEntries(analysis.inventoryFlags.map((f) => [f.drug.toLowerCase(), f]));
  const REORDER_TRIGGER_STATUSES = ["Below Reorder Level", "Below Safety Stock", "Stockout"];

  const abgInterpretation = patient.abg ? interpretABG(patient.abg) : null;
  const abgInterventions = abgInterpretation ? getAcidBaseInterventions(abgInterpretation, allMedications(patient)) : [];

  // Quick Jump sections — only include entries for content that actually
  // exists on this patient's chart. Billing/Counselling are collapsed by
  // default, so their nav items expand the panel (onActivate) before
  // scrolling to it.
  const sections = [
    { id: "overview", label: "Overview", icon: FiUser },
    { id: "medications", label: "Medications", icon: FiActivity },
    ...(patient.aiReport ? [{ id: "clinical-analysis", label: "AI Analysis", icon: FiZap }] : []),
    { id: "checks", label: "Cross-Checks", icon: FiCopy },
    ...((analysis.renal || analysis.relevantReports.length > 0 || analysis.relevantSignal)
      ? [{ id: "renal-pv", label: "Renal & ADR", icon: FiTarget }]
      : []),
    ...(abgInterpretation ? [{ id: "acid-base", label: "Acid-Base", icon: FiActivity }] : []),
    { id: "billing", label: "Billing", icon: FiDollarSign, onActivate: () => setShowBilling(true) },
    { id: "counselling", label: "Counselling", icon: FiHeart, onActivate: () => setShowCounselling(true) },
    { id: "theatre", label: "Theatre", icon: FiActivity },
    ...(analysis.inventoryFlags.length > 0 ? [{ id: "inventory", label: "Inventory", icon: FiPackage }] : []),
  ];

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <BackButton label="Back to patient search" fallbackHref="/attend" />

        <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-8 lg:items-start">
          <SectionNav sections={sections} />
          <div className="min-w-0">

        {/* Patient header */}
        <GlowCard id="overview" className="mb-6 scroll-mt-28">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-hospital-blue/30 to-ai-violet/30 flex items-center justify-center shrink-0">
                <FiUser className="text-ai-cyan" size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">{patient.name}</h1>
                  <span className="font-mono text-[11px] text-slate-500">{patient.pid}</span>
                </div>
                <p className="text-sm text-slate-400">{patient.age} yrs · {patient.sex} · {patient.weight} · {patient.height} · {patient.ward}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide">Diagnosis</div>
              <div className="text-sm text-slate-200 font-medium max-w-xs">{patient.diagnosis}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-[13px]">
            {patient.vitals && (
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Vitals</div>
                {Object.entries(patient.vitals).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-300"><span className="text-slate-500">{k.toUpperCase()}</span><span>{v}</span></div>
                ))}
              </div>
            )}
            {patient.labs && (
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Labs</div>
                {Object.entries(patient.labs).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-300"><span className="text-slate-500">{k}</span><span>{v}</span></div>
                ))}
              </div>
            )}
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-1">Allergies & Status</div>
              <div className="text-slate-300">{patient.allergies}</div>
              {patient.pregnancyStatus && <div className="text-slate-300 mt-1">{patient.pregnancyStatus}</div>}
              {patient.clinicalNotes && (
                <>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-3 mb-1">Clinical Notes</div>
                  <div className="text-slate-400 text-[12.5px] leading-relaxed">{patient.clinicalNotes}</div>
                </>
              )}
            </div>
          </div>
        </GlowCard>

        {/* Medications */}
        <div id="medications" className="grid sm:grid-cols-2 gap-5 mb-6 scroll-mt-28">
          <GlowCard>
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiActivity className="text-ai-cyan" /> Current Medications</h3>
            <ul className="space-y-1.5 text-[13px] text-slate-300">
              {patient.currentMedications.map((m) => <li key={m} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />{m}</li>)}
            </ul>
          </GlowCard>
          <GlowCard className="border-warn/20">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiAlertTriangle className="text-warn" /> New Prescriptions — Pending Dispense</h3>
            <div className="space-y-2">
              {prescriptions.map((rx, i) => {
                const done = dispensed[i];
                const stockInfo = inventoryByDrug[rx.drug.toLowerCase()];
                const reorderTriggered = stockInfo?.unitLmis && REORDER_TRIGGER_STATUSES.includes(stockInfo.unitLmis.status);
                return (
                  <div key={i} className={`p-3 rounded-xl border ${done ? "bg-mint/5 border-mint/25" : rx.swappedFrom ? "bg-mint/5 border-mint/25" : rx.isAlternative ? "bg-ai-violet/5 border-ai-violet/20" : rx.recommended ? "bg-ai-cyan/5 border-ai-cyan/20" : "bg-warn/5 border-warn/20"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[13px] min-w-0">
                        <div className="text-white font-medium flex items-center gap-2 flex-wrap">
                          {rx.drug} {rx.dose}
                          {rx.consumable && <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 bg-white/10 border border-white/15 rounded-full px-1.5 py-0.5">Consumable</span>}
                          {rx.recommended && <span className="text-[9px] font-bold uppercase tracking-wide text-ai-cyan bg-ai-cyan/10 border border-ai-cyan/25 rounded-full px-1.5 py-0.5">AI Recommended</span>}
                          {rx.swappedFrom && <span className="text-[9px] font-bold uppercase tracking-wide text-mint bg-mint/10 border border-mint/25 rounded-full px-1.5 py-0.5 flex items-center gap-1"><FiRepeat size={9} /> Swapped</span>}
                          {rx.isAlternative && <span className="text-[9px] font-bold uppercase tracking-wide text-ai-violet bg-ai-violet/10 border border-ai-violet/25 rounded-full px-1.5 py-0.5">Alternative</span>}
                        </div>
                        <div className="text-slate-400 text-[11.5px]">{rx.route && rx.route !== "N/A" ? `${rx.route}, ` : ""}{rx.frequency}</div>
                        {rx.swappedFrom && (
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-mint">
                            <FiRepeat size={10} className="shrink-0" />
                            <span>Replaced {rx.swappedFrom.drug} {rx.swappedFrom.dose} due to an interaction</span>
                            <button onClick={() => undoSwap(i)} className="flex items-center gap-1 text-slate-400 hover:text-white underline underline-offset-2 transition-colors">
                              <FiRotateCcw size={10} /> Undo
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setDispensed((d) => ({ ...d, [i]: !d[i] }))}
                        className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                          done ? "border-mint/40 text-mint bg-mint/10" : "border-white/15 text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        {done ? "Issued ✓" : rx.consumable ? "Mark Issued" : "Mark Dispensed"}
                      </button>
                    </div>

                    {/* Compact stock strip — unit stock, central stock, and
                        whether this item would trigger an automatic reorder,
                        right where the pharmacist is deciding whether to
                        dispense. Full LMIS detail still lives in the
                        Inventory section below for anything needing it. */}
                    {stockInfo && (stockInfo.unit || stockInfo.central) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/10">
                        {stockInfo.unit && stockInfo.unitLmis && (
                          <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-full border ${LMIS_STATUS_STYLE[stockInfo.unitLmis.status]}`}>
                            <FiHome size={10} /> Unit: {stockInfo.unit.stock}
                          </span>
                        )}
                        {stockInfo.central && stockInfo.centralLmis && (
                          <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-full border ${LMIS_STATUS_STYLE[stockInfo.centralLmis.status]}`}>
                            <FiPackage size={10} /> Central: {stockInfo.central.qty}
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-full border ${
                          reorderTriggered ? "text-warn bg-warn/10 border-warn/30" : "text-mint bg-mint/10 border-mint/30"
                        }`}>
                          <FiZap size={10} /> {reorderTriggered ? "Auto-Reorder Triggered" : "Reorder Not Needed"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {recommendedAdditions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ai-cyan mb-2.5">
                  <FiZap size={12} /> Recommended Additions
                </div>
                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  These aren&apos;t on the prescription, but this chart implies they&apos;ll be needed to actually administer it.
                </p>
                <div className="space-y-2">
                  {recommendedAdditions.map((rec) => (
                    <div key={rec.item} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-ai-cyan/5 border border-ai-cyan/20">
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-white">{rec.item}</div>
                        <p className="text-[11.5px] text-slate-400 leading-relaxed mt-0.5">{rec.reason}</p>
                      </div>
                      <button
                        onClick={() => addRecommended(rec)}
                        className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-ai-cyan/40 text-ai-cyan bg-ai-cyan/10 hover:bg-ai-cyan/20 transition-colors"
                      >
                        <FiPlus size={11} /> Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlowCard>
        </div>

        {/* Curated clinical AI analysis, where the case has one */}
        {patient.aiReport && (
          <FadeIn>
            <GlowCard id="clinical-analysis" className="mb-6 scroll-mt-28">
              <div className="text-eyebrow mb-3">Clinical AI Analysis</div>
              <div className="flex flex-wrap items-center gap-8 justify-around mb-5">
                <ProgressRing percent={patient.aiReport.riskScore} color="#EF4444" label="Risk Score" />
                <ProgressRing percent={patient.aiReport.confidence} color="#22D3EE" label="AI Confidence" />
                <div className="flex flex-col items-center gap-2">
                  <FiTarget className="text-warn" size={26} />
                  <SeverityPill level={patient.aiReport.priority === "High" ? "High" : patient.aiReport.priority === "Medium" ? "Moderate" : "Low"} />
                  <span className="text-[11px] text-slate-400">Priority Level</span>
                </div>
              </div>

              <h4 className="text-white font-bold text-sm mb-2.5 flex items-center gap-2"><FiAlertTriangle className="text-danger" size={15} /> Medication Interactions</h4>
              <StaggerList
                items={patient.aiReport.interactions}
                gap="gap-2.5 mb-4"
                renderItem={(it) => (
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-white text-sm">{it.drugs}</span>
                      <SeverityPill level={it.severity} />
                    </div>
                    <p className="text-[12.5px] text-slate-300 mb-1.5">{it.mechanism}</p>
                    <p className="text-[12.5px] text-ai-cyan">→ {it.recommendation}</p>
                    <InteractionAlternatives
                      pairString={it.drugs}
                      prescriptions={prescriptions}
                      onAdd={addAlternativePrescription}
                      onReplace={replacePrescriptionWithAlternative}
                    />
                  </div>
                )}
              />

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><FiShield className="text-mint" size={15} /> Alternatives</h4>
                  <StaggerList items={patient.aiReport.alternatives} gap="gap-1.5" renderItem={(a) => <div className="text-[12.5px] text-slate-300 p-2.5 rounded-lg bg-mint/5 border border-mint/15">{a}</div>} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><FiPercent className="text-ai-violet" size={15} /> Counselling Points</h4>
                  <StaggerList items={patient.aiReport.counsellingPoints} gap="gap-1.5" renderItem={(p) => <div className="text-[12.5px] text-slate-300 p-2.5 rounded-lg bg-ai-violet/5 border border-ai-violet/15">{p}</div>} />
                </div>
              </div>

              {actionMeta && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${actionMeta.bg}`}>
                  <ActionIcon className={actionMeta.color} size={22} />
                  <div>
                    <div className={`text-sm font-bold ${actionMeta.color}`}>{patient.finalRecommendation.action}</div>
                    <p className="text-[12.5px] text-slate-300 mt-0.5">{patient.finalRecommendation.reasoning}</p>
                  </div>
                </div>
              )}
            </GlowCard>
          </FadeIn>
        )}

        {/* Automated cross-checks — always run */}
        <div id="checks" className="scroll-mt-28">
        <FadeIn>
          <div className="grid sm:grid-cols-2 gap-5 mb-5">
            <GlowCard>
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiCopy className="text-ai-cyan" /> Duplicate Prescription Check</h3>
              {analysis.duplicateResults.length === 0 ? (
                <p className="text-[12.5px] text-mint flex items-center gap-2"><FiCheckCircle size={13} /> No duplicate or overlapping therapy detected.</p>
              ) : (
                <div className="space-y-2">
                  {analysis.duplicateResults.map((r, i) => (
                    <div key={i}>
                      {r.duplicates.map((d, j) => (
                        <div key={j} className="flex items-start gap-2 p-2.5 rounded-lg bg-warn/5 border border-warn/20 text-[12.5px] text-slate-300 mb-1.5">
                          <FiAlertTriangle className="text-warn shrink-0 mt-0.5" size={12} /> {d.drug} — {d.reason}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>

            <GlowCard>
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiTarget className="text-warn" /> Dose Accuracy Check</h3>
              {analysis.doseChecks.length === 0 ? (
                <p className="text-[12.5px] text-slate-500">No new prescriptions matched against the local dosing reference.</p>
              ) : (
                <div className="space-y-2">
                  {analysis.doseChecks.map((d, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border text-[12.5px] ${
                      d.status === "ok" ? "bg-mint/5 border-mint/20 text-slate-300" : "bg-danger/5 border-danger/25 text-slate-300"
                    }`}>
                      {d.status === "ok" ? <FiCheckCircle className="text-mint shrink-0 mt-0.5" size={12} /> : <FiAlertTriangle className="text-danger shrink-0 mt-0.5" size={12} />}
                      <span><span className="font-medium text-white">{d.drug} {d.dose}</span> — {d.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>
          </div>

          <div className="mb-6">
            <GlowCard>
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2"><FiActivity className="text-ai-violet" /> Interaction Cross-Check</h3>
              <p className="text-[11px] text-slate-500 mb-3">Every unique pair across current medications and new prescriptions — not just new-vs-current.</p>
              {analysis.interactions.length === 0 ? (
                <p className="text-[12.5px] text-slate-500">Not enough distinct medications to check.</p>
              ) : (
                <div className="space-y-2">
                  {analysis.interactions.map((it, i) => (
                    <div key={i} className={`p-2.5 rounded-lg border text-[12.5px] ${it.severity === "Low" ? "bg-white/[0.02] border-white/10 text-slate-400" : "bg-warn/5 border-warn/20 text-slate-300"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2">
                          {it.pair}
                          {it.involvesNew && <span className="text-[9px] font-bold uppercase tracking-wide text-ai-cyan bg-ai-cyan/10 border border-ai-cyan/25 rounded-full px-1.5 py-0.5">New Rx</span>}
                        </span>
                        <SeverityPill level={it.severity} />
                      </div>
                      {it.severity !== "Low" && (
                        <InteractionAlternatives
                          pairString={it.pair}
                          prescriptions={prescriptions}
                          onAdd={addAlternativePrescription}
                          onReplace={replacePrescriptionWithAlternative}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>
          </div>
        </FadeIn>
        </div>

        {(analysis.renal || analysis.relevantReports.length > 0 || analysis.relevantSignal) && (
          <div id="renal-pv" className="scroll-mt-28">
          <FadeIn>
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              {analysis.renal && (
                <GlowCard>
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiTarget className="text-ai-cyan" /> Renal Function & Dosing</h3>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-2xl font-bold text-white tabular-nums">{analysis.renal.chartCrcl} <span className="text-sm font-normal text-slate-400">mL/min</span></div>
                      {analysis.renal.calculatedCrcl !== null && (
                        <div className="text-[11px] text-slate-500">Cockcroft-Gault recalculation: {analysis.renal.calculatedCrcl} mL/min</div>
                      )}
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${RENAL_BAND_STYLE[analysis.renal.band.key]}`}>
                      {analysis.renal.band.band}
                    </span>
                  </div>
                  {analysis.renal.recommendations.length === 0 ? (
                    <p className="text-[12px] text-slate-500">No medications on this chart require renal dose banding from the reference table.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {analysis.renal.recommendations.map((r) => (
                        <div key={r.drug} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 text-[12.5px]">
                          <span className="text-white font-medium">{r.drug}: </span>
                          <span className="text-slate-300">{r.advice}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </GlowCard>
              )}

              {(analysis.relevantReports.length > 0 || analysis.relevantSignal) && (
                <GlowCard className="border-danger/20">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiAlertTriangle className="text-danger" /> Pharmacovigilance — Relevant to This Patient</h3>
                  {analysis.relevantSignal && (
                    <div className="p-3 rounded-xl bg-danger/10 border border-danger/25 mb-2.5 text-[12.5px]">
                      <div className="font-semibold text-danger mb-1">{analysis.relevantSignal.reportCount} recent reports · {analysis.relevantSignal.drug}</div>
                      <p className="text-slate-300">{analysis.relevantSignal.narrative}</p>
                    </div>
                  )}
                  {analysis.relevantReports.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-[12.5px] text-slate-300 py-1.5 border-b border-white/5 last:border-0">
                      <span>{r.drug} — {r.reaction}</span>
                      <span className="text-slate-500">{r.date}</span>
                    </div>
                  ))}
                </GlowCard>
              )}
            </div>
          </FadeIn>
          </div>
        )}

        {abgInterpretation && (
          <div id="acid-base" className="scroll-mt-28">
          <FadeIn>
            <GlowCard className="mb-6 border-ai-cyan/20">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2"><FiActivity className="text-ai-cyan" /> Acid-Base Disturbance Profile</h3>
                <SeverityPill level={ABG_SEVERITY_PILL[abgInterpretation.severity] || "Low"} />
              </div>

              <div className="grid sm:grid-cols-4 gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-0.5">pH</div>
                  <div className="text-lg font-bold text-white tabular-nums">{patient.abg.pH}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-0.5">pCO₂</div>
                  <div className="text-lg font-bold text-white tabular-nums">{patient.abg.pco2} <span className="text-[10px] font-normal text-slate-500">mmHg</span></div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-0.5">HCO₃⁻</div>
                  <div className="text-lg font-bold text-white tabular-nums">{patient.abg.hco3} <span className="text-[10px] font-normal text-slate-500">mEq/L</span></div>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-0.5">Lactate</div>
                  <div className="text-lg font-bold text-white tabular-nums">{patient.abg.lactate} <span className="text-[10px] font-normal text-slate-500">mmol/L</span></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-ai-cyan/5 border border-ai-cyan/20 mb-4">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <span className="text-sm font-bold text-white">{abgInterpretation.primaryDisorder}</span>
                  <span className="text-[11px] text-slate-400">{abgInterpretation.compensation}</span>
                </div>
                <p className="text-[12.5px] text-slate-300 leading-relaxed">{abgInterpretation.explanation}</p>
                {patient.abg.note && <p className="text-[11.5px] text-ai-cyan mt-2">→ {patient.abg.note}</p>}
              </div>

              <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><FiTarget className="text-warn" size={15} /> How This Affects the Treatment Plan — Suggested Interventions</h4>
              <StaggerList
                items={abgInterventions}
                gap="gap-1.5"
                renderItem={(txt) => <div className="text-[12.5px] text-slate-300 p-2.5 rounded-lg bg-warn/5 border border-warn/15">{txt}</div>}
              />
            </GlowCard>
          </FadeIn>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <GhostButton onClick={() => setShowBilling((v) => !v)} className="flex items-center gap-2">
            <FiDollarSign size={14} /> Billing History {outstandingBills.length > 0 && <span className="ml-1 text-[10px] font-bold text-warn bg-warn/15 rounded-full px-1.5 py-0.5">{outstandingBills.length} pending</span>}
            {showBilling ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
          </GhostButton>
          <GhostButton onClick={() => setShowCounselling((v) => !v)} className="flex items-center gap-2">
            <FiHeart size={14} /> Counselling Tips {showCounselling ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
          </GhostButton>
          <Link href="/scanner">
            <GhostButton className="flex items-center gap-2"><FiCamera size={14} /> Scan Prescription</GhostButton>
          </Link>
          <Link href="/theatre">
            <GhostButton className="flex items-center gap-2"><FiActivity size={14} /> Theatre</GhostButton>
          </Link>
        </div>

        {showBilling && (
          <FadeIn>
            <GlowCard id="billing" className="mb-4 border-ai-cyan/20 scroll-mt-28">
              <div className="flex items-center gap-2 mb-3">
                <FiZap className="text-ai-cyan" size={15} />
                <h3 className="text-white font-bold text-sm">AI Payment Risk</h3>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl font-bold text-white tabular-nums">{paymentRisk.score}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${PAYMENT_RISK_STYLE[paymentRisk.level]}`}>{paymentRisk.level} Risk</span>
                  </div>
                  <p className="text-[12px] text-slate-500">Outstanding: <span className="text-slate-300 tabular-nums">₦{paymentRisk.outstandingTotal.toLocaleString()}</span></p>
                </div>
                <div className="w-full sm:w-auto sm:max-w-xs">
                  <ul className="space-y-1">
                    {paymentRisk.factors.map((f) => (
                      <li key={f} className="text-[11.5px] text-slate-400 flex items-start gap-1.5"><span className="mt-1 w-1 h-1 rounded-full bg-slate-500 shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className={`p-3 rounded-lg border text-[12.5px] mb-3 ${PAYMENT_RISK_STYLE[paymentRisk.level]}`}>
                {paymentRisk.recommendation}
              </div>
              {paymentRisk.level !== "Low" && (
                <>
                  <GhostButton onClick={draftReminder} disabled={reminderLoading} className="flex items-center gap-2 text-xs">
                    {liveMode && <FiZap size={12} />} {reminderLoading ? "Drafting..." : "Draft Payment Reminder"}
                  </GhostButton>
                  {reminderError && <div className="mt-2"><AIErrorNote message={reminderError} onRetry={draftReminder} /></div>}
                  {reminderText && (
                    <FadeIn>
                      {liveMode && <div className="mt-2"><LiveModeNote>Live AI Mode — generated by Claude, not scripted</LiveModeNote></div>}
                      <p className="mt-2 text-[12.5px] text-slate-300 leading-relaxed p-3 rounded-lg bg-white/[0.03] border border-white/10 whitespace-pre-line">{reminderText}</p>
                    </FadeIn>
                  )}
                </>
              )}
            </GlowCard>

            <GlowCard className="mb-6">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiDollarSign className="text-warn" /> Billing History</h3>

              <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mr-1"><FiFilter size={12} /> Filter:</div>
                <select value={billingStatusFilter} onChange={(e) => setBillingStatusFilter(e.target.value)} className="bg-white/[0.04] border border-white/12 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-200 focus:outline-none focus:border-ai-cyan">
                  <option value="All">All statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <select value={billingUnitFilter} onChange={(e) => setBillingUnitFilter(e.target.value)} className="bg-white/[0.04] border border-white/12 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-200 focus:outline-none focus:border-ai-cyan">
                  <option value="All">All units</option>
                  {BILLING_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 ml-2">Sort:</div>
                <select value={billingSort} onChange={(e) => setBillingSort(e.target.value)} className="bg-white/[0.04] border border-white/12 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-200 focus:outline-none focus:border-ai-cyan">
                  <option value="date-desc">Newest first</option>
                  <option value="date-asc">Oldest first</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="unit">Unit A–Z</option>
                </select>
              </div>

              <div className="space-y-2">
                {filteredBilling.map((b, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10 text-[12.5px]">
                    <div className="flex items-center gap-3">
                      <FiClock className="text-slate-500 shrink-0" size={12} />
                      <div>
                        <div className="text-slate-200">{b.item}</div>
                        <div className="text-slate-500 text-[11px]">{b.unit} · {b.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-300 tabular-nums">₦{b.amount.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === "Paid" ? "text-mint bg-mint/10 border-mint/30" : b.status === "Overdue" ? "text-danger bg-danger/10 border-danger/30" : "text-warn bg-warn/10 border-warn/30"
                      }`}>{b.status}</span>
                    </div>
                  </div>
                ))}
                {filteredBilling.length === 0 && (
                  <p className="text-[12.5px] text-slate-500 text-center py-6">No billing records match this filter.</p>
                )}
              </div>
              {outstandingBills.length > 0 && (
                <p className="text-[11.5px] text-warn mt-3">{outstandingBills.length} item(s) pending or overdue payment — confirm before dispensing where applicable.</p>
              )}
            </GlowCard>
          </FadeIn>
        )}

        {showCounselling && (
          <FadeIn>
            <GlowCard id="counselling" className="mb-6 scroll-mt-28">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiHeart className="text-mint" /> Quick Counselling Tips</h3>
              {analysis.counsellingTips.length === 0 ? (
                <p className="text-[12.5px] text-slate-500">No local counselling reference for this patient&apos;s medications — open the full Counselling module for a Live AI card.</p>
              ) : (
                <div className="space-y-3">
                  {analysis.counsellingTips.map((d) => (
                    <div key={d.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                      <div className="text-sm font-semibold text-white mb-1">{d.name}</div>
                      <p className="text-[12.5px] text-slate-300 mb-1">{d.howToTake}</p>
                      <p className="text-[12px] text-danger">⚠ {d.seriousSideEffects[0]}</p>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/counseling" className="inline-flex items-center gap-1.5 text-[12.5px] text-ai-cyan font-semibold mt-3">
                Open full Patient Counselling module <FiArrowRight size={12} />
              </Link>
            </GlowCard>
          </FadeIn>
        )}

        {/* Theatre linkage */}
        <FadeIn>
          <GlowCard id="theatre" className="mb-6 border-ai-violet/20 scroll-mt-28">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiActivity className="text-ai-violet" /> Theatre</h3>
            {analysis.theatreRequest ? (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-sm text-white font-medium">{procedure?.name || analysis.theatreRequest.procedure}</div>
                  <div className="text-[12px] text-slate-400">Request {analysis.theatreRequest.id} · Status: {analysis.theatreRequest.status}</div>
                </div>
                <Link href="/theatre">
                  <PrimaryButton className="flex items-center gap-2 text-xs px-4 py-2.5">Prepare in Theatre Dashboard <FiArrowRight size={13} /></PrimaryButton>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-[12.5px] text-slate-500">No theatre procedure currently scheduled for this patient.</p>
                <Link href="/theatre">
                  <GhostButton className="flex items-center gap-2 text-xs">Open Theatre Dashboard <FiArrowRight size={12} /></GhostButton>
                </Link>
              </div>
            )}
          </GlowCard>
        </FadeIn>

        {/* Inventory nudge */}
        {analysis.inventoryFlags.length > 0 && (
          <FadeIn>
            <GlowCard id="inventory" className="scroll-mt-28">
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2"><FiPackage className="text-warn" /> Unit vs Central Stock — This Patient&apos;s Medications</h3>
              <p className="text-[11px] text-slate-500 mb-4">AMC, ROL, and months-of-stock (MOS) at both the unit and central store, with a recommendation for each.</p>
              <div className="space-y-3">
                {analysis.inventoryFlags.map((f) => (
                  <div key={f.drug} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                    <div className="text-sm font-semibold text-white mb-2.5">{f.drug}</div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {f.unit && f.unitLmis && (
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase tracking-wide text-slate-500">Unit Stock</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${LMIS_STATUS_STYLE[f.unitLmis.status]}`}>{f.unitLmis.status}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-400 tabular-nums mb-1.5">
                            <div><span className="text-white font-semibold text-[13px]">{f.unit.stock}</span><br />Stock</div>
                            <div><span className="text-slate-200 font-semibold text-[13px]">{f.unit.amc}</span><br />AMC</div>
                            <div><span className="text-slate-200 font-semibold text-[13px]">{f.unitLmis.mos ?? "—"}</span><br />MOS</div>
                          </div>
                          <p className="text-[11.5px] text-slate-400 leading-relaxed">{f.unitLmis.recommendation}</p>
                        </div>
                      )}
                      {f.central && f.centralLmis && (
                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase tracking-wide text-slate-500">Central Store</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${LMIS_STATUS_STYLE[f.centralLmis.status]}`}>{f.centralLmis.status}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-400 tabular-nums mb-1.5">
                            <div><span className="text-white font-semibold text-[13px]">{f.central.qty}</span><br />Stock</div>
                            <div><span className="text-slate-200 font-semibold text-[13px]">{f.central.amc}</span><br />AMC</div>
                            <div><span className="text-slate-200 font-semibold text-[13px]">{f.centralLmis.mos ?? "—"}</span><br />MOS</div>
                          </div>
                          <p className="text-[11.5px] text-slate-400 leading-relaxed">{f.centralLmis.recommendation}</p>
                        </div>
                      )}
                    </div>
                    {f.unitLmis && ["Below Reorder Level", "Below Safety Stock", "Stockout"].includes(f.unitLmis.status) && (
                      <Link href="/inventory">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-warn bg-warn/10 border border-warn/25 rounded-full px-3 py-1.5 mt-2.5 hover:bg-warn/20 transition-colors">
                          <FiSend size={11} /> Send Requisition to Bulk Store
                        </span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </GlowCard>
          </FadeIn>
        )}

          </div>
        </div>
      </main>
    </>
  );
}

// Shown inline under a flagged interaction, wherever one of the two drugs
// in the pair matches a current (non-consumable) prescription. Suggests
// alternatives for that drug — "Add" appends the alternative as a separate
// new prescription without touching the original (useful when the
// prescriber should choose), "Replace" swaps it in place and keeps the
// original on hand so the swap can be undone from the Medications list.
function InteractionAlternatives({ pairString, prescriptions, onAdd, onReplace }) {
  const [drugA, drugB] = pairString.split("+").map((s) => s.trim());
  const targets = [drugA, drugB]
    .filter(Boolean)
    .map((name) => {
      const idx = prescriptions.findIndex((rx) => !rx.consumable && rx.drug.toLowerCase() === name.toLowerCase());
      return idx >= 0 ? { idx, name, alts: getAlternatives(name) } : null;
    })
    .filter((t) => t && t.alts.length > 0);

  if (targets.length === 0) return null;

  return (
    <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2.5">
      {targets.map((t) => (
        <div key={t.name}>
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Alternatives for {t.name}</div>
          <div className="space-y-1.5">
            {t.alts.map((alt) => (
              <div key={alt.drug} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/10">
                <div className="min-w-0">
                  <div className="text-[12px] font-medium text-white">
                    {alt.drug} {alt.dose} <span className="text-slate-400 font-normal">— {alt.route}, {alt.frequency}</span>
                  </div>
                  <div className="text-[10.5px] text-slate-500">{alt.rationale}</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => onAdd(alt)}
                    className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-ai-cyan/40 text-ai-cyan hover:bg-ai-cyan/10 transition-colors whitespace-nowrap"
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => onReplace(t.idx, alt)}
                    className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-mint/40 text-mint hover:bg-mint/10 transition-colors whitespace-nowrap"
                  >
                    <FiRepeat size={10} /> Replace
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
