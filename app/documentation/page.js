"use client";
import { useState, useMemo } from "react";
import {
  FiClipboard, FiPlus, FiSearch, FiZap, FiCopy, FiCheck, FiFileText, FiFilter, FiPackage, FiTag,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, StaggerList, PrimaryButton, GhostButton, SegmentedTabs, BackButton, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import {
  RECORD_TYPES, RECORD_TYPE_STYLE, SEED_RECORDS, buildTemplatedNote,
  DRUG_BRANDS, BRAND_STYLE, SEED_DISPENSING, computeBrandDistribution,
} from "@/lib/documentationData";
import { PATIENTS } from "@/lib/patients";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";

const TABS = [
  { value: "new", label: "Log New Entry", icon: FiPlus },
  { value: "dispensing", label: "Dispensing Log", icon: FiPackage },
  { value: "log", label: "Records Log", icon: FiClipboard },
];

const DRAFT_SYSTEM_PROMPT = `You are helping a hospital pharmacist convert short bullet-point notes into a single, properly worded documentation entry for a patient's pharmacy record.

Write in a clear, professional, factual clinical-documentation style (third person, past tense where appropriate). Do not invent facts, doses, or outcomes that were not in the bullet points — only rephrase and structure what was given. Keep it to one tight paragraph, under 120 words. Respond with ONLY the finished note text, no headers, no commentary, no markdown.`;

export default function DocumentationPage() {
  const { liveMode } = useApp();
  const [tab, setTab] = useState("new");
  const [records, setRecords] = useState(SEED_RECORDS);

  const [type, setType] = useState(RECORD_TYPES[0]);
  const [patientQuery, setPatientQuery] = useState("");
  const [bullets, setBullets] = useState("");
  const [draft, setDraft] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [copied, setCopied] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Dispensing Log state
  const [dispensingLog, setDispensingLog] = useState(SEED_DISPENSING);
  const [dPatientQuery, setDPatientQuery] = useState("");
  const [dDrug, setDDrug] = useState("");
  const [dQty, setDQty] = useState(1);
  const [dBrand, setDBrand] = useState(DRUG_BRANDS[0]);
  const [dBatch, setDBatch] = useState("");
  const [dBrandFilter, setDBrandFilter] = useState("All");
  const [dSearch, setDSearch] = useState("");

  const matchingPatients = useMemo(() => {
    const q = patientQuery.trim().toLowerCase();
    if (!q) return [];
    return PATIENTS.filter((p) => p.name.toLowerCase().includes(q) || p.pid.toLowerCase().includes(q)).slice(0, 5);
  }, [patientQuery]);

  const dMatchingPatients = useMemo(() => {
    const q = dPatientQuery.trim().toLowerCase();
    if (!q) return [];
    return PATIENTS.filter((p) => p.name.toLowerCase().includes(q) || p.pid.toLowerCase().includes(q)).slice(0, 5);
  }, [dPatientQuery]);

  const filteredRecords = useMemo(() => {
    let rows = [...records];
    if (typeFilter !== "All") rows = rows.filter((r) => r.type === typeFilter);
    const q = searchQuery.trim().toLowerCase();
    if (q) rows = rows.filter((r) => r.summary.toLowerCase().includes(q) || r.patient.toLowerCase().includes(q) || r.body.toLowerCase().includes(q));
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, typeFilter, searchQuery]);

  const filteredDispensing = useMemo(() => {
    let rows = [...dispensingLog];
    if (dBrandFilter !== "All") rows = rows.filter((r) => r.brand === dBrandFilter);
    const q = dSearch.trim().toLowerCase();
    if (q) rows = rows.filter((r) => r.drug.toLowerCase().includes(q) || r.patient.toLowerCase().includes(q) || r.batch.toLowerCase().includes(q));
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [dispensingLog, dBrandFilter, dSearch]);

  const brandDistribution = useMemo(() => computeBrandDistribution(dispensingLog), [dispensingLog]);
  const totalUnitsDispensed = useMemo(() => dispensingLog.reduce((s, r) => s + r.quantity, 0), [dispensingLog]);

  function runTemplated() {
    setLiveError(null);
    setDraft(buildTemplatedNote({ type, patient: patientQuery, bullets }));
  }

  async function runLiveDraft() {
    if (!bullets.trim()) return;
    setLiveError(null);
    setLiveLoading(true);
    setDraft(null);
    try {
      const text = await askAI(
        `Record type: ${type}\nPatient: ${patientQuery || "(not specified)"}\nBullet notes from the pharmacist:\n${bullets}`,
        { system: DRAFT_SYSTEM_PROMPT, maxTokens: 300 }
      );
      setDraft(text);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  function draftNote() {
    if (liveMode) runLiveDraft();
    else runTemplated();
  }

  function saveRecord() {
    if (!draft) return;
    const id = `REC-${1000 + records.length + 1}`;
    const summary = bullets.split("\n").map((l) => l.trim()).filter(Boolean)[0] || `${type} logged`;
    setRecords((r) => [
      { id, type, patient: patientQuery || "Unspecified", pharmacist: "You", date: new Date().toISOString().slice(0, 10), summary, body: draft },
      ...r,
    ]);
    setBullets("");
    setDraft(null);
    setPatientQuery("");
    setTab("log");
  }

  function copyDraft() {
    if (!draft || typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function logDispensing() {
    if (!dDrug.trim() || !dPatientQuery.trim() || !dQty) return;
    const id = `DSP-${500 + dispensingLog.length + 1}`;
    setDispensingLog((d) => [
      { id, date: new Date().toISOString().slice(0, 10), patient: dPatientQuery, drug: dDrug.trim(), quantity: Number(dQty), brand: dBrand, batch: dBatch.trim() || "—", pharmacist: "You" },
      ...d,
    ]);
    setDDrug("");
    setDQty(1);
    setDBatch("");
    setDPatientQuery("");
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="Pharmacy Operations"
          title="Documentation & Records"
          subtitle={
            liveMode
              ? "Live AI Mode is on — jot down a few bullet points and Claude expands them into a properly worded record."
              : "Turn a few quick bullet points into a structured record, and log every dispensed item with its brand — no more free-hand notes or brand mix-ups at the end of a busy shift."
          }
        />

        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "new" && (
          <FadeIn>
            <GlowCard className="mb-6">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Record Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ai-cyan"
                  >
                    {RECORD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Patient (optional)</label>
                  <input
                    type="text"
                    value={patientQuery}
                    onChange={(e) => setPatientQuery(e.target.value)}
                    placeholder="Search name or PID..."
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
                  />
                  {matchingPatients.length > 0 && (
                    <div className="absolute z-20 mt-1.5 w-full glass-strong border border-white/12 rounded-xl p-1.5">
                      {matchingPatients.map((p) => (
                        <button
                          key={p.pid}
                          onClick={() => setPatientQuery(`${p.name} (${p.pid})`)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 transition-colors"
                        >
                          {p.name} <span className="text-slate-500 font-mono text-[11px]">{p.pid}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Quick Notes (one point per line)</label>
              <textarea
                value={bullets}
                onChange={(e) => setBullets(e.target.value)}
                rows={4}
                placeholder={"e.g.\nWarfarin + ciprofloxacin flagged\nCalled Dr. Musa, switched to nitrofurantoin\nINR recheck booked for Friday"}
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan mb-4"
              />
              <PrimaryButton onClick={draftNote} disabled={liveLoading || !bullets.trim()} className="flex items-center gap-2">
                {liveMode && <FiZap size={14} />} {liveMode ? "Draft With Live AI" : "Generate Structured Note"}
              </PrimaryButton>
            </GlowCard>

            {liveLoading && <GlowCard className="mb-6"><LiveThinking label="Drafting documentation with Claude..." /></GlowCard>}
            {liveError && <GlowCard className="mb-6"><AIErrorNote message={liveError} onRetry={runLiveDraft} /></GlowCard>}

            {draft && (
              <FadeIn>
                {liveMode && <LiveModeNote>Live AI Mode — generated by Claude, not scripted</LiveModeNote>}
                <GlowCard className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-white"><FiFileText className="text-ai-cyan" size={15} /> Drafted Record</div>
                    <button onClick={copyDraft} className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5 transition-colors">
                      {copied ? <FiCheck size={12} className="text-mint" /> : <FiCopy size={12} />} {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[13.5px] text-slate-200 leading-relaxed whitespace-pre-line p-3 rounded-lg bg-white/[0.03] border border-white/10">{draft}</p>
                </GlowCard>
                <div className="flex justify-end gap-3">
                  <GhostButton onClick={() => setDraft(null)}>Discard</GhostButton>
                  <PrimaryButton onClick={saveRecord}>Save to Records Log</PrimaryButton>
                </div>
              </FadeIn>
            )}
          </FadeIn>
        )}

        {tab === "dispensing" && (
          <FadeIn>
            <GlowCard className="mb-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiPackage className="text-mint" /> Log a Dispensed Item</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Patient</label>
                  <input
                    type="text"
                    value={dPatientQuery}
                    onChange={(e) => setDPatientQuery(e.target.value)}
                    placeholder="Search name or PID..."
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                  />
                  {dMatchingPatients.length > 0 && (
                    <div className="absolute z-20 mt-1.5 w-full glass-strong border border-white/12 rounded-xl p-1.5">
                      {dMatchingPatients.map((p) => (
                        <button
                          key={p.pid}
                          onClick={() => setDPatientQuery(`${p.name} (${p.pid})`)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 transition-colors"
                        >
                          {p.name} <span className="text-slate-500 font-mono text-[11px]">{p.pid}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Medicine</label>
                  <input
                    type="text"
                    value={dDrug}
                    onChange={(e) => setDDrug(e.target.value)}
                    placeholder="e.g. Amoxicillin 500mg"
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={dQty}
                    onChange={(e) => setDQty(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-mint"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Brand / Manufacturer (MOU)</label>
                  <select
                    value={dBrand}
                    onChange={(e) => setDBrand(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-mint"
                  >
                    {DRUG_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Batch / Lot (optional)</label>
                  <input
                    type="text"
                    value={dBatch}
                    onChange={(e) => setDBatch(e.target.value)}
                    placeholder="e.g. AMX-2402"
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                  />
                </div>
              </div>
              <PrimaryButton onClick={logDispensing} disabled={!dDrug.trim() || !dPatientQuery.trim()} className="flex items-center gap-2">
                <FiPlus size={14} /> Log Dispensing
              </PrimaryButton>
            </GlowCard>

            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              <GlowCard>
                <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Total Units Dispensed</div>
                <div className="text-3xl font-bold text-white tabular-nums">{totalUnitsDispensed}</div>
              </GlowCard>
              <GlowCard>
                <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5"><FiTag size={11} /> Brand Distribution (MOU)</div>
                <div className="flex flex-wrap gap-1.5">
                  {brandDistribution.map((b) => (
                    <span key={b.brand} className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${BRAND_STYLE[b.brand]}`}>
                      {b.brand}: {b.quantity}
                    </span>
                  ))}
                </div>
              </GlowCard>
            </div>

            <GlowCard className="mb-5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/12 flex-1 min-w-[180px]">
                  <FiSearch className="text-slate-400 shrink-0" size={14} />
                  <input
                    type="text"
                    value={dSearch}
                    onChange={(e) => setDSearch(e.target.value)}
                    placeholder="Search medicine, patient, or batch..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><FiFilter size={12} /> Brand:</div>
                <select
                  value={dBrandFilter}
                  onChange={(e) => setDBrandFilter(e.target.value)}
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-2.5 py-2 text-[12px] text-slate-200 focus:outline-none focus:border-mint"
                >
                  <option value="All">All brands</option>
                  {DRUG_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </GlowCard>

            <GlowCard className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                    <th className="pb-2 pr-3">Date</th>
                    <th className="pb-2 pr-3">Patient</th>
                    <th className="pb-2 pr-3">Medicine</th>
                    <th className="pb-2 pr-3">Qty</th>
                    <th className="pb-2 pr-3">Brand (MOU)</th>
                    <th className="pb-2 pr-3">Batch</th>
                    <th className="pb-2">Pharmacist</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDispensing.map((r) => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="py-2.5 pr-3 text-slate-400 tabular-nums whitespace-nowrap">{r.date}</td>
                      <td className="py-2.5 pr-3 text-slate-200">{r.patient}</td>
                      <td className="py-2.5 pr-3 text-slate-200 font-medium whitespace-nowrap">{r.drug}</td>
                      <td className="py-2.5 pr-3 text-slate-300 tabular-nums">{r.quantity}</td>
                      <td className="py-2.5 pr-3"><span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap ${BRAND_STYLE[r.brand]}`}>{r.brand}</span></td>
                      <td className="py-2.5 pr-3 text-slate-500 font-mono text-xs">{r.batch}</td>
                      <td className="py-2.5 text-slate-400">{r.pharmacist}</td>
                    </tr>
                  ))}
                  {filteredDispensing.length === 0 && (
                    <tr><td colSpan={7} className="py-6 text-center text-slate-500">No dispensing records match this search/filter.</td></tr>
                  )}
                </tbody>
              </table>
            </GlowCard>
          </FadeIn>
        )}

        {tab === "log" && (
          <FadeIn>
            <GlowCard className="mb-5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/12 flex-1 min-w-[180px]">
                  <FiSearch className="text-slate-400 shrink-0" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search records..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500"><FiFilter size={12} /> Type:</div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-2.5 py-2 text-[12px] text-slate-200 focus:outline-none focus:border-ai-cyan"
                >
                  <option value="All">All types</option>
                  {RECORD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </GlowCard>

            <StaggerList
              items={filteredRecords}
              renderItem={(r) => (
                <GlowCard>
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${RECORD_TYPE_STYLE[r.type]}`}>{r.type}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{r.id}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{r.date} · {r.pharmacist}</span>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">{r.patient}</div>
                  <p className="text-[12.5px] text-slate-300 leading-relaxed">{r.body}</p>
                </GlowCard>
              )}
            />
            {filteredRecords.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-10">No records match this search/filter.</p>
            )}
          </FadeIn>
        )}
      </main>
    </>
  );
}
