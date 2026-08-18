"use client";
import { useState } from "react";
import {
  FiClipboard, FiDollarSign, FiFileText, FiZap, FiCheck, FiAlertTriangle,
  FiPlus, FiAlertOctagon, FiArrowRight, FiStar,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, SegmentedTabs, PrimaryButton, GhostButton, LevelBar, Modal, BackButton, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import { PROCEDURES, PAYMENT_TRACKER, getProcedureById } from "@/lib/surgicalData";
import { THEATRE_REQUESTS as INITIAL_REQUESTS, STATUS_ORDER } from "@/lib/theatreData";
import { useApp } from "@/context/AppContext";
import { askAIJson } from "@/lib/aiClient";

const TABS = [
  { value: "board", label: "Request Board", icon: FiClipboard },
  { value: "request", label: "Digital Request System", icon: FiFileText },
  { value: "payment", label: "NHIS / Payment Tracker", icon: FiDollarSign },
];

const STATUS_STYLE = {
  Pending: "border-white/15 text-slate-300",
  Preparing: "border-ai-cyan/40 text-ai-cyan bg-ai-cyan/5",
  Issued: "border-mint/40 text-mint bg-mint/5",
};

const REQUEST_SYSTEM_PROMPT = `You are a structured-request validation AI for a hospital O&G/theatre pharmacy education demo. Given a digital supply request (department, procedure, requested items), check it for missing or unclear information and any mismatch against a standard checklist for that procedure.

Respond with STRICT JSON ONLY — no markdown, no code fences, no commentary — matching EXACTLY this shape:
{
  "missingFields": ["<string>", ...],
  "mismatches": ["<short description of an item that seems mismatched or unusual for this procedure>", ...],
  "readyToSubmit": true | false,
  "note": "<one short sentence summary>"
}`;

export default function TheatrePage() {
  const [tab, setTab] = useState("board");

  // Request board state
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const activeRequest = requests.find((r) => r.id === activeRequestId) || null;
  const activeProcedure = activeRequest ? getProcedureById(activeRequest.procedureId) : null;

  // Digital request form state
  const [department, setDepartment] = useState("");
  const [reqProcedure, setReqProcedure] = useState("");
  const [reqItems, setReqItems] = useState("");
  const [auditLog, setAuditLog] = useState([]);
  const [liveResult, setLiveResult] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();

  function advance(id) {
    setRequests((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const idx = STATUS_ORDER.indexOf(r.status);
        const next = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 1)];
        return { ...r, status: next };
      })
    );
  }

  function advanceActiveAndClose() {
    if (activeRequest) advance(activeRequest.id);
    setActiveRequestId(null);
  }

  function simulatedValidate() {
    const missingFields = [];
    if (!department.trim()) missingFields.push("Requesting department");
    if (!reqProcedure.trim()) missingFields.push("Procedure name");
    if (!reqItems.trim()) missingFields.push("Requested items");

    const procedure = PROCEDURES.find((p) => p.name.toLowerCase() === reqProcedure.trim().toLowerCase());
    const standardNames = procedure ? procedure.checklist.map((c) => c.item.toLowerCase()) : [];
    const requestedNames = reqItems.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    const mismatches = procedure
      ? requestedNames
          .filter((r) => !standardNames.some((s) => s.includes(r.toLowerCase()) || r.toLowerCase().includes(s)))
          .map((r) => `"${r}" is not part of the standard checklist for ${procedure.name}`)
      : [];

    const result = {
      missingFields,
      mismatches,
      readyToSubmit: missingFields.length === 0,
      note: missingFields.length
        ? "Complete the missing fields before submitting."
        : mismatches.length
        ? "Request is complete but contains unusual items — confirm before submitting."
        : "Request is complete and matches the standard checklist.",
    };
    setLiveResult(result);
    return result;
  }

  async function liveValidate() {
    setLiveError(null);
    setLiveLoading(true);
    setLiveResult(null);
    try {
      const procedure = PROCEDURES.find((p) => p.name.toLowerCase() === reqProcedure.trim().toLowerCase());
      const json = await askAIJson(
        `Department: ${department || "(blank)"}\nProcedure: ${reqProcedure || "(blank)"}\nRequested items: ${reqItems || "(blank)"}\nStandard checklist for reference: ${JSON.stringify(procedure?.checklist || "unknown procedure")}`,
        { system: REQUEST_SYSTEM_PROMPT, maxTokens: 400 }
      );
      setLiveResult(json);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  function validate() {
    if (liveMode) liveValidate();
    else simulatedValidate();
  }

  function submitRequest() {
    const result = liveMode ? liveResult : simulatedValidate();
    if (!result || !result.readyToSubmit) return;
    setAuditLog((log) => [
      { id: `DOC-${1000 + log.length}`, department, procedure: reqProcedure, items: reqItems, time: "just now" },
      ...log,
    ]);
    setDepartment("");
    setReqProcedure("");
    setReqItems("");
    setLiveResult(null);
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="Theatre Pharmacy"
          title="Theatre — Supply, Requests & Documentation"
          subtitle="A live OR–pharmacy status board with per-case complication planning, a digital request system, and an NHIS payment tracker."
        />

        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "board" && (
          <div className="grid md:grid-cols-3 gap-5 mb-4">
            {STATUS_ORDER.map((status) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">{status}</h3>
                  <span className="text-[11px] text-slate-500 tabular-nums">{requests.filter((r) => r.status === status).length}</span>
                </div>
                <div className="space-y-3">
                  {requests.filter((r) => r.status === status).map((r) => (
                    <FadeIn key={r.id}>
                      <GlowCard
                        interactive
                        onClick={() => setActiveRequestId(r.id)}
                        className={`border ${STATUS_STYLE[r.status]}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[11px] text-slate-500">{r.id}</span>
                          {r.urgency === "Emergency" && (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-danger bg-danger/10 border border-danger/30 rounded-full px-2 py-0.5">
                              <FiAlertOctagon size={10} /> Emergency
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-white mb-0.5">{r.procedure}</div>
                        <div className="text-[11px] text-slate-400 mb-2">{r.department}</div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{r.requestedAt}</span>
                          <span className="flex items-center gap-1 text-ai-cyan font-semibold">View checklist <FiArrowRight size={11} /></span>
                        </div>
                      </GlowCard>
                    </FadeIn>
                  ))}
                  {requests.filter((r) => r.status === status).length === 0 && (
                    <div className="text-[12px] text-slate-600 border border-dashed border-white/10 rounded-xl p-4 text-center">Empty</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "request" && (
          <FadeIn>
            <GlowCard className="mb-6">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiFileText className="text-ai-violet" /> New Digital Request</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Requesting Department</label>
                  <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. O&G Theatre" className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Procedure</label>
                  <input value={reqProcedure} onChange={(e) => setReqProcedure(e.target.value)} placeholder="e.g. Elective Caesarean Section" className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan" />
                </div>
              </div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Requested Items (comma separated)</label>
              <textarea value={reqItems} onChange={(e) => setReqItems(e.target.value)} rows={3} placeholder="e.g. Spinal anaesthesia set, Oxytocin 10 IU, Sterile gauze packs" className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan mb-4" />
              <div className="flex gap-3">
                <PrimaryButton onClick={validate} disabled={liveLoading} className="flex items-center gap-2">
                  {liveMode && <FiZap size={14} />} Validate Request
                </PrimaryButton>
                <GhostButton onClick={submitRequest} disabled={!liveResult?.readyToSubmit} className="flex items-center gap-2">
                  <FiPlus size={14} /> Submit & Log
                </GhostButton>
              </div>
            </GlowCard>

            {liveLoading && <GlowCard className="mb-6"><LiveThinking label="Validating with Claude..." /></GlowCard>}
            {liveError && <GlowCard className="mb-6"><AIErrorNote message={liveError} onRetry={liveValidate} /></GlowCard>}

            {liveResult && (
              <FadeIn>
                {liveMode && <LiveModeNote>Live AI Mode — generated by Claude, not scripted</LiveModeNote>}
                <GlowCard className={`mb-6 ${liveResult.readyToSubmit ? "border-mint/25" : "border-warn/25"}`}>
                  <p className="text-sm text-white font-medium mb-3">{liveResult.note}</p>
                  {liveResult.missingFields?.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[11px] uppercase tracking-wide text-warn mb-1.5">Missing Fields</div>
                      {liveResult.missingFields.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-[13px] text-slate-300"><FiAlertTriangle className="text-warn shrink-0" size={12} /> {f}</div>
                      ))}
                    </div>
                  )}
                  {liveResult.mismatches?.length > 0 && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-danger mb-1.5">Possible Mismatches</div>
                      {liveResult.mismatches.map((m) => (
                        <div key={m} className="flex items-center gap-2 text-[13px] text-slate-300"><FiAlertTriangle className="text-danger shrink-0" size={12} /> {m}</div>
                      ))}
                    </div>
                  )}
                </GlowCard>
              </FadeIn>
            )}

            <GlowCard>
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiFileText className="text-mint" /> Automated Documentation Log</h3>
              {auditLog.length === 0 ? (
                <p className="text-slate-500 text-sm">Submitted requests are automatically logged here for audit purposes.</p>
              ) : (
                <div className="space-y-2">
                  {auditLog.map((entry) => (
                    <div key={entry.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-[12.5px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-slate-400">{entry.id}</span>
                        <span className="text-slate-500">{entry.time}</span>
                      </div>
                      <div className="text-slate-200">{entry.department} — {entry.procedure}</div>
                      <div className="text-slate-400">{entry.items}</div>
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>
          </FadeIn>
        )}

        {tab === "payment" && (
          <FadeIn>
            <GlowCard>
              <h3 className="text-white font-bold text-sm mb-5 flex items-center gap-2"><FiDollarSign className="text-warn" /> NHIS / Payment Tracker</h3>
              <div className="space-y-4">
                {PAYMENT_TRACKER.map((row) => (
                  <div key={row.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <span className="text-sm font-semibold text-white">{row.item}</span>
                      <span className="text-[11px] text-slate-500">{row.procedure}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] text-slate-400 mb-2 tabular-nums">
                      <div><div className="text-white font-semibold text-sm">{row.supplied}</div>Supplied</div>
                      <div><div className="text-white font-semibold text-sm">{row.billed}</div>Billed</div>
                      <div><div className="text-mint font-semibold text-sm">{row.paid}</div>Paid</div>
                      <div><div className={`font-semibold text-sm ${row.outstanding > 0 ? "text-danger" : "text-slate-300"}`}>{row.outstanding}</div>Outstanding</div>
                    </div>
                    <LevelBar percent={(row.paid / row.billed) * 100} color={row.outstanding > 0 ? "var(--color-warn)" : "var(--color-mint)"} />
                  </div>
                ))}
              </div>
            </GlowCard>
          </FadeIn>
        )}
      </main>

      {/* Procedure checklist modal — the important bit: standard items vs
          likely-complication items, with justification and common-case flag. */}
      <Modal
        open={!!activeRequest}
        onClose={() => setActiveRequestId(null)}
        eyebrow={activeRequest ? `${activeRequest.id} · ${activeRequest.department}` : ""}
        title={activeProcedure?.name}
        wide
      >
        {activeRequest && activeProcedure && (
          <div>
            {activeRequest.urgency === "Emergency" && (
              <div className="flex items-center gap-2 text-[12px] font-semibold text-danger bg-danger/10 border border-danger/25 rounded-lg px-3 py-2 mb-4">
                <FiAlertOctagon size={13} /> Emergency case — prioritize preparation
              </div>
            )}

            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wide text-ai-cyan mb-2.5 flex items-center gap-1.5">
                <FiCheck size={13} /> Standard Items to Prepare
              </h4>
              <div className="space-y-1.5">
                {activeProcedure.checklist.map((c) => (
                  <div key={c.item} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-sm">
                    <span className="text-slate-200">{c.item}</span>
                    <span className="text-slate-500 text-xs tabular-nums">×{c.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-warn mb-1 flex items-center gap-1.5">
                <FiAlertTriangle size={13} /> Also Prepare For — Possible Complications
              </h4>
              <p className="text-[11.5px] text-slate-500 mb-2.5">Not routinely dispensed, but worth having ready given how often these arise for this procedure.</p>
              <div className="space-y-1.5">
                {activeProcedure.complicationItems.map((c) => (
                  <div key={c.item} className={`px-3 py-2.5 rounded-lg border text-sm ${c.common ? "bg-warn/5 border-warn/25" : "bg-white/[0.02] border-white/10"}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-slate-200 font-medium">{c.item}</span>
                      {c.common && (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-warn bg-warn/15 border border-warn/30 rounded-full px-1.5 py-0.5">
                          <FiStar size={9} /> Common
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-400 leading-relaxed">{c.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {activeRequest.status !== "Issued" && (
              <div className="flex justify-end mt-6 pt-4 border-t border-white/10">
                <PrimaryButton onClick={advanceActiveAndClose} className="flex items-center gap-2">
                  Advance to {STATUS_ORDER[STATUS_ORDER.indexOf(activeRequest.status) + 1]} <FiArrowRight size={14} />
                </PrimaryButton>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
