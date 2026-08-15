"use client";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FiUser, FiAlertTriangle, FiCopy, FiActivity, FiShield,
  FiCheckCircle, FiXCircle, FiPhoneCall, FiEye, FiDollarSign, FiCamera,
  FiHeart, FiPackage, FiTarget, FiPercent, FiClock, FiChevronDown, FiChevronUp,
  FiArrowRight, FiSend, FiFilter,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, StaggerList, SeverityPill, ProgressRing, GhostButton, PrimaryButton, BackButton } from "@/components/ui";
import { getPatientByPid, getPatientAnalysis } from "@/lib/patients";
import { getProcedureById } from "@/lib/surgicalData";
import { LMIS_STATUS_STYLE } from "@/lib/lmis";

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

const BILLING_UNITS = ["A&E", "NHIS Pharmacy", "In-Patient", "GOPD Pharmacy", "Paediatric", "Theatre", "Theatre Pharmacy", "O&G", "O&G Pharmacy", "Renal"];

export default function PatientWorkspacePage() {
  const { pid } = useParams();
  const patient = getPatientByPid(decodeURIComponent(pid));
  const [dispensed, setDispensed] = useState({});
  const [showBilling, setShowBilling] = useState(false);
  const [showCounselling, setShowCounselling] = useState(false);
  const [billingStatusFilter, setBillingStatusFilter] = useState("All");
  const [billingUnitFilter, setBillingUnitFilter] = useState("All");
  const [billingSort, setBillingSort] = useState("date-desc");

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

  const analysis = getPatientAnalysis(patient);
  const outstandingBills = patient.billingHistory.filter((b) => b.status !== "Paid");
  const actionMeta = patient.finalRecommendation ? ACTION_META[patient.finalRecommendation.action] : null;
  const ActionIcon = actionMeta?.icon;
  const procedure = analysis.theatreRequest ? getProcedureById(analysis.theatreRequest.procedureId) : null;

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <BackButton label="Back to patient search" fallbackHref="/attend" />

        {/* Patient header */}
        <GlowCard className="mb-6">
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
        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          <GlowCard>
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiActivity className="text-ai-cyan" /> Current Medications</h3>
            <ul className="space-y-1.5 text-[13px] text-slate-300">
              {patient.currentMedications.map((m) => <li key={m} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />{m}</li>)}
            </ul>
          </GlowCard>
          <GlowCard className="border-warn/20">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FiAlertTriangle className="text-warn" /> New Prescriptions — Pending Dispense</h3>
            <div className="space-y-2">
              {patient.newPrescriptions.map((rx, i) => {
                const done = dispensed[i];
                return (
                  <div key={i} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${done ? "bg-mint/5 border-mint/25" : "bg-warn/5 border-warn/20"}`}>
                    <div className="text-[13px]">
                      <div className="text-white font-medium flex items-center gap-2">
                        {rx.drug} {rx.dose}
                        {rx.consumable && <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 bg-white/10 border border-white/15 rounded-full px-1.5 py-0.5">Consumable</span>}
                      </div>
                      <div className="text-slate-400 text-[11.5px]">{rx.route && rx.route !== "N/A" ? `${rx.route}, ` : ""}{rx.frequency}</div>
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
                );
              })}
            </div>
          </GlowCard>
        </div>

        {/* Curated clinical AI analysis, where the case has one */}
        {patient.aiReport && (
          <FadeIn>
            <GlowCard className="mb-6">
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
        <FadeIn>
          <div className="grid sm:grid-cols-2 gap-5 mb-6">
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
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2"><FiActivity className="text-ai-violet" /> Interaction Cross-Check</h3>
              <p className="text-[11px] text-slate-500 mb-3">Every unique pair across current medications and new prescriptions — not just new-vs-current.</p>
              {analysis.interactions.length === 0 ? (
                <p className="text-[12.5px] text-slate-500">Not enough distinct medications to check.</p>
              ) : (
                <div className="space-y-2">
                  {analysis.interactions.map((it, i) => (
                    <div key={i} className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border text-[12.5px] ${it.severity === "Low" ? "bg-white/[0.02] border-white/10 text-slate-400" : "bg-warn/5 border-warn/20 text-slate-300"}`}>
                      <span className="flex items-center gap-2">
                        {it.pair}
                        {it.involvesNew && <span className="text-[9px] font-bold uppercase tracking-wide text-ai-cyan bg-ai-cyan/10 border border-ai-cyan/25 rounded-full px-1.5 py-0.5">New Rx</span>}
                      </span>
                      <SeverityPill level={it.severity} />
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>
          </div>
        </FadeIn>

        {(analysis.renal || analysis.relevantReports.length > 0 || analysis.relevantSignal) && (
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
            <GlowCard className="mb-6">
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
          <GlowCard className="mb-6 border-ai-violet/20">
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
            <GlowCard>
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
      </main>
    </>
  );
}
