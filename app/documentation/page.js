"use client";
import { useState, useMemo } from "react";
import {
  FiClipboard,
  FiPlus,
  FiSearch,
  FiZap,
  FiCopy,
  FiCheck,
  FiFileText,
  FiFilter,
  FiPackage,
  FiTag,
  FiTruck,
  FiAlertTriangle,
  FiClock,
  FiLink,
  FiX,
  FiActivity,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import {
  PageHeader,
  GlowCard,
  FadeIn,
  StaggerList,
  PrimaryButton,
  GhostButton,
  SegmentedTabs,
  BackButton,
  LiveThinking,
  AIErrorNote,
  LiveModeNote,
} from "@/components/ui";
import {
  RECORD_TYPES,
  RECORD_TYPE_STYLE,
  SEED_RECORDS,
  buildTemplatedNote,
} from "@/lib/documentationData";
import {
  DRUG_BRANDS,
  BRAND_STYLE,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_STYLE,
  DISPENSING_UNITS,
  STAFF_LIST,
  suggestBrand,
  computeTransactionTotal,
  flattenToItemRows,
  filterTransactions,
  sortTransactions,
  sortItemRows,
  computeBrandDistribution,
  SEED_TRANSACTIONS,
  nextTransactionId,
} from "@/lib/dispensingData";
import {
  MOVEMENT_TYPES,
  DESTINATIONS,
  SOURCES_FOR_RECEIVING,
  SEED_MOVEMENTS,
  filterMovements,
  sortMovements,
  nextMovementId,
} from "@/lib/issuanceData";
import { runReconciliationChecks } from "@/lib/reconciliation";
import { buildAuditEntry } from "@/lib/auditTrail";
import { estimateUnitPrice } from "@/lib/pricing";
import { PATIENTS } from "@/lib/patients";
import { REQUISITIONS } from "@/lib/bulkStoreData";
import { THEATRE_REQUESTS } from "@/lib/theatreData";
import { INVENTORY_ITEMS } from "@/lib/miscData";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";

const TABS = [
  { value: "dispensing", label: "Dispensing Log", icon: FiPackage },
  { value: "issuance", label: "Issuance & Receiving", icon: FiTruck },
  { value: "trace", label: "Traceability", icon: FiSearch },
  { value: "reconciliation", label: "Reconciliation", icon: FiAlertTriangle },
  { value: "audit", label: "Audit Trail", icon: FiClock },
  { value: "notes", label: "Clinical Note", icon: FiPlus },
  { value: "log", label: "Records Log", icon: FiClipboard },
];

const NOTE_DRAFT_SYSTEM_PROMPT = `You are helping a hospital pharmacist convert short bullet-point notes into a single, properly worded documentation entry for a patient's pharmacy record.

Write in a clear, professional, factual clinical-documentation style (third person, past tense where appropriate). Do not invent facts, doses, or outcomes that were not in the bullet points — only rephrase and structure what was given. Keep it to one tight paragraph, under 120 words. Respond with ONLY the finished note text, no headers, no commentary, no markdown.`;

const DISPENSING_NL_SYSTEM_PROMPT = `You are a pharmacy documentation analyst AI in an education demo. Given a JSON array of dispensing transactions (each with patient, unit, staff, payment status, and line items carrying drug/quantity/brand) and a natural-language question, answer directly and concisely (under 90 words) using only the data provided. Plain text, no markdown, no JSON.`;

const DISPENSING_SUMMARY_SYSTEM_PROMPT = `You are a pharmacy operations AI in an education demo, briefing a pharmacy manager. Given a JSON array of dispensing transactions for a selected period/filter and its totals, write a concise (under 100 words) plain-language summary: total transactions, total value, the leading brand by volume, and anything needing attention (e.g. unpaid transactions). No markdown, no JSON.`;

const RECONCILIATION_EXPLAIN_PROMPT = `You are a pharmacy documentation reconciliation assistant in an education demo. Given a JSON array of already-flagged discrepancies, write a concise (under 100 words) prioritized plain-language briefing for a pharmacy manager on what to review first and why. Do not invent new issues beyond what's listed. No markdown, no JSON.`;

export default function DocumentationPage() {
  const { liveMode } = useApp();
  const [tab, setTab] = useState("dispensing");

  const [auditTrail, setAuditTrail] = useState([]);

  const [transactions, setTransactions] = useState(SEED_TRANSACTIONS);
  const [dispView, setDispView] = useState("transaction");
  const [dispFilters, setDispFilters] = useState({
    dateFrom: "",
    dateTo: "",
    patient: "",
    drug: "",
    brand: "All",
    unit: "All",
    staff: "All",
    paymentStatus: "All",
    batch: "",
  });
  const [dispSort, setDispSort] = useState("date-desc");
  const [draftPatientQuery, setDraftPatientQuery] = useState("");
  const [draftUnit, setDraftUnit] = useState(DISPENSING_UNITS[0]);
  const [draftPaymentStatus, setDraftPaymentStatus] = useState(
    PAYMENT_STATUSES[0],
  );
  const [draftBillingRef, setDraftBillingRef] = useState("");
  const [draftItems, setDraftItems] = useState([]);
  const [dispNlQuery, setDispNlQuery] = useState("");
  const [dispNlAnswer, setDispNlAnswer] = useState(null);
  const [dispSummary, setDispSummary] = useState(null);
  const [dispAiLoading, setDispAiLoading] = useState(false);
  const [dispAiError, setDispAiError] = useState(null);

  const [movements, setMovements] = useState(SEED_MOVEMENTS);
  const [movFilters, setMovFilters] = useState({
    dateFrom: "",
    dateTo: "",
    type: "All",
    brand: "All",
    destination: "All",
    item: "",
  });
  const [movSort, setMovSort] = useState("date-desc");
  const [movType, setMovType] = useState(MOVEMENT_TYPES[0]);
  const [movItem, setMovItem] = useState("");
  const [movQty, setMovQty] = useState(1);
  const [movBrand, setMovBrand] = useState(DRUG_BRANDS[0]);
  const [movBatch, setMovBatch] = useState("");
  const [movExpiry, setMovExpiry] = useState("");
  const [movUnitCost, setMovUnitCost] = useState("");
  const [movSource, setMovSource] = useState(SOURCES_FOR_RECEIVING[0]);
  const [movDestination, setMovDestination] = useState(DESTINATIONS[0]);
  const [movAuth, setMovAuth] = useState("");
  const [movNotes, setMovNotes] = useState("");

  const [traceQuery, setTraceQuery] = useState("");

  const [reconExplain, setReconExplain] = useState(null);
  const [reconLoading, setReconLoading] = useState(false);
  const [reconError, setReconError] = useState(null);

  const [records, setRecords] = useState(SEED_RECORDS);
  const [noteType, setNoteType] = useState(RECORD_TYPES[0]);
  const [notePatientQuery, setNotePatientQuery] = useState("");
  const [noteBullets, setNoteBullets] = useState("");
  const [noteDraft, setNoteDraft] = useState(null);
  const [noteLiveLoading, setNoteLiveLoading] = useState(false);
  const [noteLiveError, setNoteLiveError] = useState(null);
  const [noteCopied, setNoteCopied] = useState(false);
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logTypeFilter, setLogTypeFilter] = useState("All");

  const draftMatchingPatients = useMemo(() => {
    const q = draftPatientQuery.trim().toLowerCase();
    if (!q) return [];
    return PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.pid.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [draftPatientQuery]);

  const noteMatchingPatients = useMemo(() => {
    const q = notePatientQuery.trim().toLowerCase();
    if (!q) return [];
    return PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.pid.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [notePatientQuery]);

  const filteredTxns = useMemo(
    () =>
      sortTransactions(filterTransactions(transactions, dispFilters), dispSort),
    [transactions, dispFilters, dispSort],
  );
  const itemRows = useMemo(
    () => sortItemRows(flattenToItemRows(filteredTxns), dispSort),
    [filteredTxns, dispSort],
  );
  const brandDistribution = useMemo(
    () => computeBrandDistribution(filteredTxns),
    [filteredTxns],
  );
  const dispTotalValue = useMemo(
    () => filteredTxns.reduce((s, t) => s + computeTransactionTotal(t), 0),
    [filteredTxns],
  );
  const dispTotalUnpaid = useMemo(
    () =>
      filteredTxns
        .filter((t) => t.paymentStatus !== "Paid")
        .reduce(
          (s, t) =>
            s +
            computeTransactionTotal(t) *
              (t.paymentStatus === "Partial" ? 0.5 : 1),
          0,
        ),
    [filteredTxns],
  );

  const filteredMovements = useMemo(
    () => sortMovements(filterMovements(movements, movFilters), movSort),
    [movements, movFilters, movSort],
  );

  const reconciliationFlags = useMemo(
    () =>
      runReconciliationChecks({ transactions, movements, patients: PATIENTS }),
    [transactions, movements],
  );

  const filteredRecords = useMemo(() => {
    let rows = [...records];
    if (logTypeFilter !== "All")
      rows = rows.filter((r) => r.type === logTypeFilter);
    const q = logSearchQuery.trim().toLowerCase();
    if (q)
      rows = rows.filter(
        (r) =>
          r.summary.toLowerCase().includes(q) ||
          r.patient.toLowerCase().includes(q) ||
          r.body.toLowerCase().includes(q),
      );
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, logTypeFilter, logSearchQuery]);

  const traceResults = useMemo(() => {
    const q = traceQuery.trim().toLowerCase();
    if (!q) return null;
    const txnMatches = transactions.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.patient.toLowerCase().includes(q) ||
        t.pid.toLowerCase().includes(q) ||
        t.staff.toLowerCase().includes(q) ||
        t.unit.toLowerCase().includes(q) ||
        t.items.some(
          (it) =>
            it.drug.toLowerCase().includes(q) ||
            it.brand.toLowerCase().includes(q),
        ),
    );
    const movMatches = movements.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.item.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.destination.toLowerCase().includes(q) ||
        m.staff.toLowerCase().includes(q) ||
        (m.authorization || "").toLowerCase().includes(q),
    );
    const reqMatches = REQUISITIONS.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.item.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q),
    );
    const theatreMatches = THEATRE_REQUESTS.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.procedure.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q),
    );
    const auditMatches = auditTrail.filter(
      (a) =>
        a.refId.toLowerCase().includes(q) || a.action.toLowerCase().includes(q),
    );

    const exactTxn = transactions.find((t) => t.id.toLowerCase() === q);
    let timeline = null;
    if (exactTxn) {
      const patient = PATIENTS.find((p) => p.pid === exactTxn.pid);
      const relatedBilling = patient?.billingHistory?.find((b) =>
        exactTxn.items.some((it) =>
          b.item.toLowerCase().includes(it.drug.split(" ")[0].toLowerCase()),
        ),
      );
      const relatedAudit = auditTrail.filter((a) => a.refId === exactTxn.id);
      timeline = {
        txn: exactTxn,
        billing: relatedBilling || null,
        audit: relatedAudit,
      };
    }
    return {
      txnMatches,
      movMatches,
      reqMatches,
      theatreMatches,
      auditMatches,
      timeline,
    };
  }, [traceQuery, transactions, movements, auditTrail]);

  function addDraftItem() {
    setDraftItems((items) => [
      ...items,
      {
        drug: "",
        quantity: 1,
        brand: suggestBrand(""),
        batch: "",
        unitPrice: "",
      },
    ]);
  }
  function updateDraftItem(idx, patch) {
    setDraftItems((items) =>
      items.map((it, i) => {
        if (i !== idx) return it;
        const next = { ...it, ...patch };
        if (patch.drug !== undefined) {
          next.brand = suggestBrand(patch.drug);
          next.unitPrice = estimateUnitPrice(patch.drug);
        }
        return next;
      }),
    );
  }
  function removeDraftItem(idx) {
    setDraftItems((items) => items.filter((_, i) => i !== idx));
  }

  function logTransaction() {
    if (
      !draftPatientQuery.trim() ||
      draftItems.length === 0 ||
      draftItems.some((it) => !it.drug.trim())
    )
      return;
    const matched = PATIENTS.find(
      (p) => `${p.name} (${p.pid})` === draftPatientQuery,
    );
    const id = nextTransactionId(transactions);
    const newTxn = {
      id,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      patient: matched?.name || draftPatientQuery,
      pid: matched?.pid || "—",
      unit: draftUnit,
      staff: "You",
      paymentStatus: draftPaymentStatus,
      billingRef: draftBillingRef.trim() || "—",
      items: draftItems.map((it) => ({
        drug: it.drug.trim(),
        quantity: Number(it.quantity) || 1,
        unit: "units",
        brand: it.brand,
        batch: it.batch.trim() || "—",
        unitPrice: Number(it.unitPrice) || estimateUnitPrice(it.drug),
      })),
    };
    setTransactions((t) => [newTxn, ...t]);
    setAuditTrail((a) => [
      buildAuditEntry({
        action: "Dispensing Logged",
        refId: id,
        details: `${newTxn.items.length} item(s) dispensed to ${newTxn.patient} at ${newTxn.unit} — payment status: ${newTxn.paymentStatus}.`,
      }),
      ...a,
    ]);
    setDraftPatientQuery("");
    setDraftUnit(DISPENSING_UNITS[0]);
    setDraftPaymentStatus(PAYMENT_STATUSES[0]);
    setDraftBillingRef("");
    setDraftItems([]);
  }

  async function runDispensingNlQuery() {
    if (!dispNlQuery.trim()) return;
    setDispAiError(null);
    setDispAiLoading(true);
    setDispNlAnswer(null);
    setDispSummary(null);
    try {
      const text = await askAI(
        `Filtered dispensing transactions (JSON): ${JSON.stringify(filteredTxns)}\n\nQuestion: ${dispNlQuery.trim()}`,
        { system: DISPENSING_NL_SYSTEM_PROMPT, maxTokens: 220 },
      );
      setDispNlAnswer(text);
    } catch (e) {
      setDispAiError(e.message);
    } finally {
      setDispAiLoading(false);
    }
  }

  async function runDispensingSummary() {
    setDispAiError(null);
    setDispAiLoading(true);
    setDispSummary(null);
    setDispNlAnswer(null);
    try {
      const text = await askAI(
        `Filtered dispensing transactions (JSON): ${JSON.stringify(filteredTxns)}\nTotal value: ₦${dispTotalValue}\nTotal outstanding: ₦${Math.round(dispTotalUnpaid)}`,
        { system: DISPENSING_SUMMARY_SYSTEM_PROMPT, maxTokens: 220 },
      );
      setDispSummary(text);
    } catch (e) {
      setDispAiError(e.message);
    } finally {
      setDispAiLoading(false);
    }
  }

  function onMovItemChange(value) {
    setMovItem(value);
    setMovBrand(suggestBrand(value));
    setMovUnitCost(String(estimateUnitPrice(value)));
  }

  function logMovement() {
    if (!movItem.trim() || !movQty) return;
    const id = nextMovementId(movements);
    const newMov = {
      id,
      date: new Date().toISOString().slice(0, 10),
      type: movType,
      item: movItem.trim(),
      quantity: Number(movQty) || 1,
      unitOfMeasure: "units",
      brand: movBrand,
      batch: movBatch.trim() || "—",
      expiry: movExpiry.trim() || "—",
      unitCost: Number(movUnitCost) || estimateUnitPrice(movItem),
      source: movType === "Issuance" ? "Bulk Store" : movSource,
      destination: movDestination,
      staff: "You",
      authorization: movAuth.trim() || "—",
      notes: movNotes.trim(),
    };
    setMovements((m) => [newMov, ...m]);
    setAuditTrail((a) => [
      buildAuditEntry({
        action: `${movType} Logged`,
        refId: id,
        details: `${newMov.quantity} unit(s) of ${newMov.item} — ${newMov.source} → ${newMov.destination}.`,
      }),
      ...a,
    ]);
    setMovItem("");
    setMovQty(1);
    setMovBatch("");
    setMovExpiry("");
    setMovUnitCost("");
    setMovAuth("");
    setMovNotes("");
  }

  async function explainReconciliation() {
    setReconError(null);
    setReconLoading(true);
    setReconExplain(null);
    try {
      const text = await askAI(
        `Flagged discrepancies (JSON): ${JSON.stringify(reconciliationFlags)}`,
        { system: RECONCILIATION_EXPLAIN_PROMPT, maxTokens: 220 },
      );
      setReconExplain(text);
    } catch (e) {
      setReconError(e.message);
    } finally {
      setReconLoading(false);
    }
  }

  function runTemplatedNote() {
    setNoteLiveError(null);
    setNoteDraft(
      buildTemplatedNote({
        type: noteType,
        patient: notePatientQuery,
        bullets: noteBullets,
      }),
    );
  }

  async function runLiveNoteDraft() {
    if (!noteBullets.trim()) return;
    setNoteLiveError(null);
    setNoteLiveLoading(true);
    setNoteDraft(null);
    try {
      const text = await askAI(
        `Record type: ${noteType}\nPatient: ${notePatientQuery || "(not specified)"}\nBullet notes from the pharmacist:\n${noteBullets}`,
        { system: NOTE_DRAFT_SYSTEM_PROMPT, maxTokens: 300 },
      );
      setNoteDraft(text);
    } catch (e) {
      setNoteLiveError(e.message);
    } finally {
      setNoteLiveLoading(false);
    }
  }

  function draftNote() {
    if (liveMode) runLiveNoteDraft();
    else runTemplatedNote();
  }

  function saveNote() {
    if (!noteDraft) return;
    const id = `REC-${1000 + records.length + 1}`;
    const summary =
      noteBullets
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)[0] || `${noteType} logged`;
    setRecords((r) => [
      {
        id,
        type: noteType,
        patient: notePatientQuery || "Unspecified",
        pharmacist: "You",
        date: new Date().toISOString().slice(0, 10),
        summary,
        body: noteDraft,
      },
      ...r,
    ]);
    setAuditTrail((a) => [
      buildAuditEntry({
        action: "Clinical Note Logged",
        refId: id,
        details: summary,
      }),
      ...a,
    ]);
    setNoteBullets("");
    setNoteDraft(null);
    setNotePatientQuery("");
    setTab("log");
  }

  function copyNoteDraft() {
    if (!noteDraft || typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(noteDraft);
    setNoteCopied(true);
    setTimeout(() => setNoteCopied(false), 1500);
  }

  const draftRunningTotal = draftItems.reduce(
    (s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0,
  );

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="Pharmacy Operations"
          title="Documentation & Records"
          subtitle="Document once — dispensing, stock movements, and notes automatically flow into the audit trail, traceability search, and reconciliation checks below, instead of being re-entered by hand in a separate register."
        />

        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "dispensing" && (
          <FadeIn>
            <GlowCard className="mb-6">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <FiPackage className="text-mint" /> Log a Dispensing Transaction
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="relative sm:col-span-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Patient
                  </label>
                  <input
                    type="text"
                    value={draftPatientQuery}
                    onChange={(e) => setDraftPatientQuery(e.target.value)}
                    placeholder="Search name or PID..."
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                  />
                  {draftPatientQuery.trim() &&
                    draftMatchingPatients.length > 0 && (
                      <div className="absolute z-20 mt-1.5 w-full glass-strong border border-white/12 rounded-xl p-1.5">
                        {draftMatchingPatients.map((p) => (
                          <button
                            key={p.pid}
                            onClick={() =>
                              setDraftPatientQuery(`${p.name} (${p.pid})`)
                            }
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 transition-colors"
                          >
                            {p.name}{" "}
                            <span className="text-slate-500 font-mono text-[11px]">
                              {p.pid}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Unit
                  </label>
                  <select
                    value={draftUnit}
                    onChange={(e) => setDraftUnit(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-mint"
                  >
                    {DISPENSING_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={draftPaymentStatus}
                    onChange={(e) => setDraftPaymentStatus(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-mint"
                  >
                    {PAYMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                  Billing Reference (optional)
                </label>
                <input
                  type="text"
                  value={draftBillingRef}
                  onChange={(e) => setDraftBillingRef(e.target.value)}
                  placeholder="e.g. RCT-2214"
                  className="w-full sm:w-64 bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                />
              </div>

              <div className="space-y-3 mb-3">
                {draftItems.map((it, idx) => (
                  <div
                    key={idx}
                    className="grid sm:grid-cols-[2fr_0.7fr_1.2fr_1fr_1fr_auto] gap-2 items-end p-3 rounded-xl bg-white/[0.02] border border-white/10"
                  >
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                        Medicine
                      </label>
                      <input
                        list="drug-options"
                        type="text"
                        value={it.drug}
                        onChange={(e) =>
                          updateDraftItem(idx, { drug: e.target.value })
                        }
                        placeholder="e.g. Amoxicillin 500mg"
                        className="w-full bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={(e) =>
                          updateDraftItem(idx, { quantity: e.target.value })
                        }
                        className="w-full bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-mint"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                        <FiZap size={9} className="text-ai-cyan" /> Brand (MOU)
                      </label>
                      <select
                        value={it.brand}
                        onChange={(e) =>
                          updateDraftItem(idx, { brand: e.target.value })
                        }
                        className="w-full bg-white/[0.04] border border-ai-cyan/25 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-ai-cyan"
                      >
                        {DRUG_BRANDS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                        Batch
                      </label>
                      <input
                        type="text"
                        value={it.batch}
                        onChange={(e) =>
                          updateDraftItem(idx, { batch: e.target.value })
                        }
                        placeholder="optional"
                        className="w-full bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                        Unit Price (₦)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={it.unitPrice}
                        onChange={(e) =>
                          updateDraftItem(idx, { unitPrice: e.target.value })
                        }
                        className="w-full bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-mint"
                      />
                    </div>
                    <button
                      onClick={() => removeDraftItem(idx)}
                      className="shrink-0 p-2.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                {draftItems.length === 0 && (
                  <p className="text-[12.5px] text-slate-500 py-2">
                    Add at least one item to log this transaction.
                  </p>
                )}
              </div>
              <datalist id="drug-options">
                {INVENTORY_ITEMS.map((i) => (
                  <option key={i.name} value={i.name} />
                ))}
              </datalist>

              <div className="flex flex-wrap items-center gap-3 mb-2">
                <GhostButton
                  onClick={addDraftItem}
                  className="flex items-center gap-2 text-xs"
                >
                  <FiPlus size={13} /> Add Item
                </GhostButton>
                {draftItems.length > 0 && (
                  <span className="text-[12px] text-slate-400">
                    Running total:{" "}
                    <span className="text-white font-semibold tabular-nums">
                      ₦{draftRunningTotal.toLocaleString()}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Brand defaults to an AI-suggested MOU based on typical stock
                availability for that medicine — switch it with the dropdown any
                time, per item.
              </p>

              <PrimaryButton
                onClick={logTransaction}
                disabled={!draftPatientQuery.trim() || draftItems.length === 0}
                className="flex items-center gap-2"
              >
                <FiPackage size={14} /> Log Dispensing Transaction
              </PrimaryButton>
            </GlowCard>

            <GlowCard className="mb-5">
              <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-500">
                <FiFilter size={12} /> Filters
              </div>
              <div className="grid sm:grid-cols-4 gap-3 mb-3">
                <input
                  type="date"
                  value={dispFilters.dateFrom}
                  onChange={(e) =>
                    setDispFilters((f) => ({ ...f, dateFrom: e.target.value }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                />
                <input
                  type="date"
                  value={dispFilters.dateTo}
                  onChange={(e) =>
                    setDispFilters((f) => ({ ...f, dateTo: e.target.value }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                />
                <input
                  type="text"
                  value={dispFilters.patient}
                  onChange={(e) =>
                    setDispFilters((f) => ({ ...f, patient: e.target.value }))
                  }
                  placeholder="Patient / PID"
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
                />
                <input
                  type="text"
                  value={dispFilters.drug}
                  onChange={(e) =>
                    setDispFilters((f) => ({ ...f, drug: e.target.value }))
                  }
                  placeholder="Drug / item"
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
                />
              </div>
              <div className="grid sm:grid-cols-5 gap-3">
                <select
                  value={dispFilters.brand}
                  onChange={(e) =>
                    setDispFilters((f) => ({ ...f, brand: e.target.value }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                >
                  <option value="All">All brands</option>
                  {DRUG_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <select
                  value={dispFilters.unit}
                  onChange={(e) =>
                    setDispFilters((f) => ({ ...f, unit: e.target.value }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                >
                  <option value="All">All units</option>
                  {DISPENSING_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <select
                  value={dispFilters.staff}
                  onChange={(e) =>
                    setDispFilters((f) => ({ ...f, staff: e.target.value }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                >
                  <option value="All">All staff</option>
                  {STAFF_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="You">You</option>
                </select>
                <select
                  value={dispFilters.paymentStatus}
                  onChange={(e) =>
                    setDispFilters((f) => ({
                      ...f,
                      paymentStatus: e.target.value,
                    }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                >
                  <option value="All">All payment statuses</option>
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={dispFilters.batch}
                  onChange={(e) =>
                    setDispFilters((f) => ({ ...f, batch: e.target.value }))
                  }
                  placeholder="Batch"
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
                />
              </div>
            </GlowCard>

            <GlowCard className="mb-5 border-ai-violet/20">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <FiTag className="text-ai-violet" /> MOU / Brand Distribution
                </h3>
                <span className="text-[11px] text-slate-500">
                  Reflects the filters above · {filteredTxns.length}{" "}
                  transaction(s)
                </span>
              </div>
              {brandDistribution.length === 0 ? (
                <p className="text-[12.5px] text-slate-500">
                  No transactions match the current filters.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                        <th className="pb-2 pr-3">Brand (MOU)</th>
                        <th className="pb-2 pr-3">Txns</th>
                        <th className="pb-2 pr-3">Items</th>
                        <th className="pb-2 pr-3">Qty</th>
                        <th className="pb-2 pr-3">Value</th>
                        <th className="pb-2 pr-3">Paid</th>
                        <th className="pb-2 pr-3">Unpaid</th>
                        <th className="pb-2 pr-3">Unpaid Txns</th>
                        <th className="pb-2">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandDistribution.map((b) => (
                        <tr key={b.brand} className="border-b border-white/5">
                          <td className="py-2.5 pr-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${BRAND_STYLE[b.brand]}`}
                            >
                              {b.brand}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-slate-300 tabular-nums">
                            {b.transactions}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-300 tabular-nums">
                            {b.items}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-300 tabular-nums">
                            {b.quantity}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-200 tabular-nums">
                            ₦{b.value.toLocaleString()}
                          </td>
                          <td className="py-2.5 pr-3 text-mint tabular-nums">
                            ₦{b.paid.toLocaleString()}
                          </td>
                          <td className="py-2.5 pr-3 text-danger tabular-nums">
                            ₦{b.unpaid.toLocaleString()}
                          </td>
                          <td className="py-2.5 pr-3 text-warn tabular-nums">
                            {b.unpaidTransactions}
                          </td>
                          <td className="py-2.5 text-slate-300 tabular-nums">
                            {b.percentOfTotal}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlowCard>

            <GlowCard className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <FiZap className="text-ai-cyan" size={15} />
                <h3 className="text-white font-bold text-sm">
                  Ask AI About This Data
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="text"
                  value={dispNlQuery}
                  onChange={(e) => setDispNlQuery(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && liveMode && runDispensingNlQuery()
                  }
                  placeholder="e.g. Show unpaid Ceftriaxone dispensing this month"
                  className="flex-1 bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
                />
                <PrimaryButton
                  onClick={runDispensingNlQuery}
                  disabled={!liveMode || dispAiLoading || !dispNlQuery.trim()}
                  className="flex items-center gap-2 justify-center whitespace-nowrap"
                >
                  Ask
                </PrimaryButton>
                <GhostButton
                  onClick={runDispensingSummary}
                  disabled={!liveMode || dispAiLoading}
                  className="flex items-center gap-2 justify-center whitespace-nowrap"
                >
                  Summarize Filtered Data
                </GhostButton>
              </div>
              {!liveMode && (
                <p className="text-[11.5px] text-slate-500">
                  Switch on Live AI Mode to ask natural-language questions or
                  generate a summary of the filtered data.
                </p>
              )}
              {dispAiLoading && (
                <LiveThinking label="Analyzing dispensing data with Phantom..." />
              )}
              {dispAiError && <AIErrorNote message={dispAiError} />}
              {(dispNlAnswer || dispSummary) && (
                <FadeIn>
                  <LiveModeNote>
                    Live AI Mode — generated by Claude, not scripted
                  </LiveModeNote>
                  <p className="text-[13px] text-slate-200 leading-relaxed p-3 rounded-lg bg-ai-cyan/5 border border-ai-cyan/20">
                    {dispNlAnswer || dispSummary}
                  </p>
                </FadeIn>
              )}
            </GlowCard>

            <GlowCard className="mb-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setDispView("transaction")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${dispView === "transaction" ? "bg-gradient-to-r from-hospital-blue to-ai-violet text-white border-transparent" : "border-white/12 text-slate-300"}`}
                  >
                    Transaction View
                  </button>
                  <button
                    onClick={() => setDispView("item")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${dispView === "item" ? "bg-gradient-to-r from-hospital-blue to-ai-violet text-white border-transparent" : "border-white/12 text-slate-300"}`}
                  >
                    Item View
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Sort:</span>
                  <select
                    value={dispSort}
                    onChange={(e) => setDispSort(e.target.value)}
                    className="bg-white/[0.04] border border-white/12 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-200 focus:outline-none focus:border-ai-cyan"
                  >
                    <option value="date-desc">Newest first</option>
                    <option value="date-asc">Oldest first</option>
                    <option value="patient">Patient A–Z</option>
                    <option value="amount-desc">Amount: High to Low</option>
                    <option value="amount-asc">Amount: Low to High</option>
                    <option value="unit">Unit A–Z</option>
                    <option value="payment">Payment status</option>
                  </select>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-4 text-[12px] text-slate-400">
                <span>
                  Total value:{" "}
                  <span className="text-white font-semibold tabular-nums">
                    ₦{dispTotalValue.toLocaleString()}
                  </span>
                </span>
                <span>
                  Total outstanding:{" "}
                  <span className="text-danger font-semibold tabular-nums">
                    ₦{Math.round(dispTotalUnpaid).toLocaleString()}
                  </span>
                </span>
                <span>{filteredTxns.length} transaction(s)</span>
              </div>

              <div className="overflow-x-auto">
                {dispView === "transaction" ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                        <th className="pb-2 pr-3">ID</th>
                        <th className="pb-2 pr-3">Date</th>
                        <th className="pb-2 pr-3">Patient</th>
                        <th className="pb-2 pr-3">Unit</th>
                        <th className="pb-2 pr-3">Items</th>
                        <th className="pb-2 pr-3">Amount</th>
                        <th className="pb-2 pr-3">Payment</th>
                        <th className="pb-2">Staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTxns.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-white/5 align-top"
                        >
                          <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {t.id}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-400 whitespace-nowrap">
                            {t.date} {t.time}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-200 whitespace-nowrap">
                            {t.patient}{" "}
                            <span className="text-slate-500 text-[11px] font-mono">
                              {t.pid}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-slate-300 whitespace-nowrap">
                            {t.unit}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-300">
                            {t.items.map((it, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 whitespace-nowrap mb-1 last:mb-0"
                              >
                                {it.drug} ×{it.quantity}{" "}
                                <span
                                  className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-bold border ${BRAND_STYLE[it.brand]}`}
                                >
                                  {it.brand}
                                </span>
                              </div>
                            ))}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-200 tabular-nums">
                            ₦{computeTransactionTotal(t).toLocaleString()}
                          </td>
                          <td className="py-2.5 pr-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap ${PAYMENT_STATUS_STYLE[t.paymentStatus]}`}
                            >
                              {t.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-400 whitespace-nowrap">
                            {t.staff}
                          </td>
                        </tr>
                      ))}
                      {filteredTxns.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-6 text-center text-slate-500"
                          >
                            No transactions match these filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                        <th className="pb-2 pr-3">Txn</th>
                        <th className="pb-2 pr-3">Date</th>
                        <th className="pb-2 pr-3">Patient</th>
                        <th className="pb-2 pr-3">Drug</th>
                        <th className="pb-2 pr-3">Qty</th>
                        <th className="pb-2 pr-3">Brand</th>
                        <th className="pb-2 pr-3">Batch</th>
                        <th className="pb-2 pr-3">Line Total</th>
                        <th className="pb-2">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemRows.map((r) => (
                        <tr key={r.rowId} className="border-b border-white/5">
                          <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {r.txnId}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-400 whitespace-nowrap">
                            {r.date}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-200 whitespace-nowrap">
                            {r.patient}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-200 font-medium whitespace-nowrap">
                            {r.drug}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-300 tabular-nums">
                            {r.quantity}
                          </td>
                          <td className="py-2.5 pr-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap ${BRAND_STYLE[r.brand]}`}
                            >
                              {r.brand}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-slate-500 font-mono text-xs">
                            {r.batch}
                          </td>
                          <td className="py-2.5 pr-3 text-slate-200 tabular-nums">
                            ₦{r.lineTotal.toLocaleString()}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap ${PAYMENT_STATUS_STYLE[r.paymentStatus]}`}
                            >
                              {r.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {itemRows.length === 0 && (
                        <tr>
                          <td
                            colSpan={9}
                            className="py-6 text-center text-slate-500"
                          >
                            No items match these filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </GlowCard>
          </FadeIn>
        )}

        {tab === "issuance" && (
          <FadeIn>
            <GlowCard className="mb-6">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <FiTruck className="text-mint" /> Log a Stock Movement
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Type
                  </label>
                  <select
                    value={movType}
                    onChange={(e) => setMovType(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-mint"
                  >
                    {MOVEMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Item
                  </label>
                  <input
                    list="drug-options-mov"
                    type="text"
                    value={movItem}
                    onChange={(e) => onMovItemChange(e.target.value)}
                    placeholder="e.g. Ceftriaxone 1g Vial"
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                  />
                  <datalist id="drug-options-mov">
                    {INVENTORY_ITEMS.map((i) => (
                      <option key={i.name} value={i.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={movQty}
                    onChange={(e) => setMovQty(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-mint"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1">
                    <FiZap size={9} className="text-ai-cyan" /> Brand (MOU)
                  </label>
                  <select
                    value={movBrand}
                    onChange={(e) => setMovBrand(e.target.value)}
                    className="w-full bg-white/[0.04] border border-ai-cyan/25 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ai-cyan"
                  >
                    {DRUG_BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Batch
                  </label>
                  <input
                    type="text"
                    value={movBatch}
                    onChange={(e) => setMovBatch(e.target.value)}
                    placeholder="optional"
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Expiry (MM/YYYY)
                  </label>
                  <input
                    type="text"
                    value={movExpiry}
                    onChange={(e) => setMovExpiry(e.target.value)}
                    placeholder="e.g. 09/2027"
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Unit Cost (₦)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={movUnitCost}
                    onChange={(e) => setMovUnitCost(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-mint"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                {movType === "Receiving" && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                      Source (Supplier/MOU)
                    </label>
                    <select
                      value={movSource}
                      onChange={(e) => setMovSource(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-mint"
                    >
                      {SOURCES_FOR_RECEIVING.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    {movType === "Issuance"
                      ? "Destination Unit"
                      : "Destination"}
                  </label>
                  <select
                    value={movDestination}
                    onChange={(e) => setMovDestination(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-mint"
                  >
                    {DESTINATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Authorization / Reference
                  </label>
                  <input
                    type="text"
                    value={movAuth}
                    onChange={(e) => setMovAuth(e.target.value)}
                    placeholder="e.g. REQ-3302 or GRN-771"
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-mint"
                  />
                </div>
              </div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={movNotes}
                onChange={(e) => setMovNotes(e.target.value)}
                rows={2}
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-mint mb-4"
              />
              <PrimaryButton
                onClick={logMovement}
                disabled={!movItem.trim() || !movQty}
                className="flex items-center gap-2"
              >
                <FiTruck size={14} /> Log {movType}
              </PrimaryButton>
            </GlowCard>

            <GlowCard className="mb-5">
              <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-500">
                <FiFilter size={12} /> Filters
              </div>
              <div className="grid sm:grid-cols-4 gap-3 mb-3">
                <input
                  type="date"
                  value={movFilters.dateFrom}
                  onChange={(e) =>
                    setMovFilters((f) => ({ ...f, dateFrom: e.target.value }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                />
                <input
                  type="date"
                  value={movFilters.dateTo}
                  onChange={(e) =>
                    setMovFilters((f) => ({ ...f, dateTo: e.target.value }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                />
                <input
                  type="text"
                  value={movFilters.item}
                  onChange={(e) =>
                    setMovFilters((f) => ({ ...f, item: e.target.value }))
                  }
                  placeholder="Item"
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
                />
                <select
                  value={movFilters.type}
                  onChange={(e) =>
                    setMovFilters((f) => ({ ...f, type: e.target.value }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                >
                  <option value="All">All types</option>
                  {MOVEMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <select
                  value={movFilters.brand}
                  onChange={(e) =>
                    setMovFilters((f) => ({ ...f, brand: e.target.value }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                >
                  <option value="All">All brands</option>
                  {DRUG_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <select
                  value={movFilters.destination}
                  onChange={(e) =>
                    setMovFilters((f) => ({
                      ...f,
                      destination: e.target.value,
                    }))
                  }
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                >
                  <option value="All">All destinations</option>
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={movSort}
                  onChange={(e) => setMovSort(e.target.value)}
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-ai-cyan"
                >
                  <option value="date-desc">Newest first</option>
                  <option value="date-asc">Oldest first</option>
                  <option value="item">Item A–Z</option>
                  <option value="quantity-desc">Quantity: High to Low</option>
                  <option value="value-desc">Value: High to Low</option>
                </select>
              </div>
            </GlowCard>

            <GlowCard className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                    <th className="pb-2 pr-3">ID</th>
                    <th className="pb-2 pr-3">Date</th>
                    <th className="pb-2 pr-3">Type</th>
                    <th className="pb-2 pr-3">Item</th>
                    <th className="pb-2 pr-3">Qty</th>
                    <th className="pb-2 pr-3">Brand</th>
                    <th className="pb-2 pr-3">Batch</th>
                    <th className="pb-2 pr-3">Expiry</th>
                    <th className="pb-2 pr-3">Value</th>
                    <th className="pb-2 pr-3">Source → Destination</th>
                    <th className="pb-2">Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((m) => (
                    <tr key={m.id} className="border-b border-white/5">
                      <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {m.id}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-400 whitespace-nowrap">
                        {m.date}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap ${m.type === "Issuance" ? "text-ai-cyan bg-ai-cyan/10 border-ai-cyan/30" : "text-mint bg-mint/10 border-mint/30"}`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-200 font-medium whitespace-nowrap">
                        {m.item}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-300 tabular-nums">
                        {m.quantity}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap ${BRAND_STYLE[m.brand]}`}
                        >
                          {m.brand}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500 font-mono text-xs">
                        {m.batch}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-400 whitespace-nowrap">
                        {m.expiry}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-200 tabular-nums">
                        ₦{(m.quantity * m.unitCost).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-400 whitespace-nowrap">
                        {m.source} → {m.destination}
                      </td>
                      <td className="py-2.5 text-slate-400 whitespace-nowrap">
                        {m.staff}
                      </td>
                    </tr>
                  ))}
                  {filteredMovements.length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        className="py-6 text-center text-slate-500"
                      >
                        No movements match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </GlowCard>
          </FadeIn>
        )}

        {tab === "trace" && (
          <FadeIn>
            <GlowCard className="mb-5">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/12 focus-within:border-ai-cyan transition-colors">
                <FiSearch className="text-slate-400 shrink-0" size={16} />
                <input
                  type="text"
                  value={traceQuery}
                  onChange={(e) => setTraceQuery(e.target.value)}
                  placeholder="Search a transaction ID, patient, drug, brand, staff, or unit — e.g. DISP-00125..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2.5">
                Searches across Dispensing, Issuance & Receiving, Requisitions,
                Theatre requests, and the Audit Trail at once.
              </p>
            </GlowCard>

            {!traceResults && (
              <p className="text-center text-slate-500 text-sm py-16">
                Search above to trace a transaction across every log.
              </p>
            )}

            {traceResults?.timeline && (
              <GlowCard className="mb-5 border-ai-cyan/25">
                <div className="flex items-center gap-2 mb-3">
                  <FiLink className="text-ai-cyan" size={15} />
                  <h3 className="text-white font-bold text-sm">
                    Linked Timeline — {traceResults.timeline.txn.id}
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-ai-cyan/5 border border-ai-cyan/20 text-[12.5px] text-slate-300">
                    <span className="text-white font-semibold">Dispensed</span>{" "}
                    —{" "}
                    {traceResults.timeline.txn.items
                      .map((it) => `${it.drug} ×${it.quantity} (${it.brand})`)
                      .join(", ")}{" "}
                    to {traceResults.timeline.txn.patient} at{" "}
                    {traceResults.timeline.txn.unit} on{" "}
                    {traceResults.timeline.txn.date}.
                  </div>
                  <div
                    className={`p-3 rounded-lg border text-[12.5px] ${PAYMENT_STATUS_STYLE[traceResults.timeline.txn.paymentStatus]}`}
                  >
                    <span className="font-semibold">Payment Status</span> —{" "}
                    {traceResults.timeline.txn.paymentStatus} (billing ref{" "}
                    {traceResults.timeline.txn.billingRef})
                  </div>
                  {traceResults.timeline.billing ? (
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-[12.5px] text-slate-300">
                      <span className="text-white font-semibold">
                        Linked Billing Record
                      </span>{" "}
                      — {traceResults.timeline.billing.item}, ₦
                      {traceResults.timeline.billing.amount.toLocaleString()},{" "}
                      {traceResults.timeline.billing.status}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-warn/5 border border-warn/20 text-[12.5px] text-warn">
                      No matching billing record found for this transaction's
                      items — see Reconciliation.
                    </div>
                  )}
                  {traceResults.timeline.audit.length > 0 && (
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-[12.5px] text-slate-300">
                      <span className="text-white font-semibold">
                        Audit Trail
                      </span>{" "}
                      — {traceResults.timeline.audit.length} entr
                      {traceResults.timeline.audit.length === 1 ? "y" : "ies"}{" "}
                      logged for this reference.
                    </div>
                  )}
                </div>
              </GlowCard>
            )}

            {traceResults && (
              <div className="space-y-4">
                {traceResults.txnMatches.length > 0 && (
                  <GlowCard>
                    <h4 className="text-white font-bold text-sm mb-2.5 flex items-center gap-2">
                      <FiPackage className="text-mint" size={14} /> Dispensing
                      Transactions
                    </h4>
                    {traceResults.txnMatches.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0 text-[12.5px]"
                      >
                        <span className="font-mono text-slate-400">{t.id}</span>
                        <span className="text-slate-300">
                          {t.patient} · {t.unit}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${PAYMENT_STATUS_STYLE[t.paymentStatus]}`}
                        >
                          {t.paymentStatus}
                        </span>
                      </div>
                    ))}
                  </GlowCard>
                )}
                {traceResults.movMatches.length > 0 && (
                  <GlowCard>
                    <h4 className="text-white font-bold text-sm mb-2.5 flex items-center gap-2">
                      <FiTruck className="text-ai-cyan" size={14} /> Issuance &
                      Receiving
                    </h4>
                    {traceResults.movMatches.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0 text-[12.5px]"
                      >
                        <span className="font-mono text-slate-400">{m.id}</span>
                        <span className="text-slate-300">
                          {m.item} · {m.source} → {m.destination}
                        </span>
                      </div>
                    ))}
                  </GlowCard>
                )}
                {traceResults.reqMatches.length > 0 && (
                  <GlowCard>
                    <h4 className="text-white font-bold text-sm mb-2.5 flex items-center gap-2">
                      <FiClipboard className="text-ai-violet" size={14} />{" "}
                      Requisitions
                    </h4>
                    {traceResults.reqMatches.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0 text-[12.5px]"
                      >
                        <span className="font-mono text-slate-400">{r.id}</span>
                        <span className="text-slate-300">
                          {r.item} · {r.department}
                        </span>
                      </div>
                    ))}
                  </GlowCard>
                )}
                {traceResults.theatreMatches.length > 0 && (
                  <GlowCard>
                    <h4 className="text-white font-bold text-sm mb-2.5 flex items-center gap-2">
                      <FiActivity className="text-warn" size={14} /> Theatre
                      Requests
                    </h4>
                    {traceResults.theatreMatches.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0 text-[12.5px]"
                      >
                        <span className="font-mono text-slate-400">{r.id}</span>
                        <span className="text-slate-300">
                          {r.procedure} · {r.department}
                        </span>
                      </div>
                    ))}
                  </GlowCard>
                )}
                {traceResults.auditMatches.length > 0 && (
                  <GlowCard>
                    <h4 className="text-white font-bold text-sm mb-2.5 flex items-center gap-2">
                      <FiClock className="text-slate-400" size={14} /> Audit
                      Trail
                    </h4>
                    {traceResults.auditMatches.map((a) => (
                      <div
                        key={a.id}
                        className="py-1.5 border-b border-white/5 last:border-0 text-[12.5px] text-slate-300"
                      >
                        <span className="font-mono text-slate-500">
                          {a.refId}
                        </span>{" "}
                        — {a.action}{" "}
                        <span className="text-slate-500">({a.timestamp})</span>
                      </div>
                    ))}
                  </GlowCard>
                )}
                {traceResults.txnMatches.length === 0 &&
                  traceResults.movMatches.length === 0 &&
                  traceResults.reqMatches.length === 0 &&
                  traceResults.theatreMatches.length === 0 &&
                  traceResults.auditMatches.length === 0 && (
                    <p className="text-center text-slate-500 text-sm py-10">
                      No matches found across any log.
                    </p>
                  )}
              </div>
            )}
          </FadeIn>
        )}

        {tab === "reconciliation" && (
          <FadeIn>
            <GlowCard className="mb-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <FiAlertTriangle
                  className={
                    reconciliationFlags.length > 0 ? "text-warn" : "text-mint"
                  }
                  size={18}
                />
                <div>
                  <div className="text-sm font-bold text-white">
                    {reconciliationFlags.length} Flagged Discrepanc
                    {reconciliationFlags.length === 1 ? "y" : "ies"}
                  </div>
                  <p className="text-[12px] text-slate-400">
                    Automatic checks across Dispensing and Issuance & Receiving
                    — always for human review, never auto-corrected.
                  </p>
                </div>
              </div>
              {liveMode && (
                <GhostButton
                  onClick={explainReconciliation}
                  disabled={reconLoading || reconciliationFlags.length === 0}
                  className="flex items-center gap-2 text-xs"
                >
                  <FiZap size={12} /> Explain & Prioritize With AI
                </GhostButton>
              )}
            </GlowCard>

            {reconLoading && (
              <GlowCard className="mb-5">
                <LiveThinking label="Reviewing flagged discrepancies with Phantom..." />
              </GlowCard>
            )}
            {reconError && (
              <GlowCard className="mb-5">
                <AIErrorNote
                  message={reconError}
                  onRetry={explainReconciliation}
                />
              </GlowCard>
            )}
            {reconExplain && (
              <FadeIn>
                <LiveModeNote>
                  Live AI Mode — generated by Claude, not scripted
                </LiveModeNote>
                <GlowCard className="mb-5">
                  <p className="text-[13px] text-slate-200 leading-relaxed">
                    {reconExplain}
                  </p>
                </GlowCard>
              </FadeIn>
            )}

            {reconciliationFlags.length === 0 ? (
              <GlowCard className="border-mint/25 flex items-center gap-3">
                <FiCheck className="text-mint shrink-0" size={20} />
                <p className="text-sm text-slate-300">
                  No discrepancies flagged across the current Dispensing and
                  Issuance & Receiving records.
                </p>
              </GlowCard>
            ) : (
              <StaggerList
                items={reconciliationFlags}
                renderItem={(f) => (
                  <GlowCard
                    className={
                      f.severity === "danger"
                        ? "border-danger/25 bg-danger/5"
                        : "border-warn/25 bg-warn/5"
                    }
                  >
                    <div className="flex items-start gap-3">
                      <FiAlertTriangle
                        className={
                          f.severity === "danger"
                            ? "text-danger shrink-0 mt-0.5"
                            : "text-warn shrink-0 mt-0.5"
                        }
                        size={16}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-white">
                            {f.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {f.refIds.join(", ")}
                          </span>
                        </div>
                        <p className="text-[12.5px] text-slate-300">
                          {f.message}
                        </p>
                      </div>
                    </div>
                  </GlowCard>
                )}
              />
            )}
          </FadeIn>
        )}

        {tab === "audit" && (
          <FadeIn>
            <GlowCard className="mb-5">
              <p className="text-[12.5px] text-slate-400">
                Every dispensing transaction, stock movement, and clinical note
                logged in this session automatically appends here — user,
                timestamp, action, and reference ID. Entries are never edited or
                removed, only added to.
              </p>
            </GlowCard>
            {auditTrail.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-16">
                No audit entries yet — log a dispensing transaction, stock
                movement, or clinical note to see it appear here automatically.
              </p>
            ) : (
              <div className="space-y-2">
                {auditTrail.map((a) => (
                  <GlowCard key={a.id}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {a.action}
                        </div>
                        <p className="text-[12px] text-slate-400">
                          Ref: <span className="font-mono">{a.refId}</span> —{" "}
                          {a.details}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-slate-400">
                          {a.user} · {a.role}
                        </div>
                        <div className="text-[10.5px] text-slate-500">
                          {a.timestamp}
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </div>
            )}
          </FadeIn>
        )}

        {tab === "notes" && (
          <FadeIn>
            <GlowCard className="mb-6">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Record Type
                  </label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-ai-cyan"
                  >
                    {RECORD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Patient (optional)
                  </label>
                  <input
                    type="text"
                    value={notePatientQuery}
                    onChange={(e) => setNotePatientQuery(e.target.value)}
                    placeholder="Search name or PID..."
                    className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan"
                  />
                  {noteMatchingPatients.length > 0 && (
                    <div className="absolute z-20 mt-1.5 w-full glass-strong border border-white/12 rounded-xl p-1.5">
                      {noteMatchingPatients.map((p) => (
                        <button
                          key={p.pid}
                          onClick={() =>
                            setNotePatientQuery(`${p.name} (${p.pid})`)
                          }
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 transition-colors"
                        >
                          {p.name}{" "}
                          <span className="text-slate-500 font-mono text-[11px]">
                            {p.pid}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
                Quick Notes (one point per line)
              </label>
              <textarea
                value={noteBullets}
                onChange={(e) => setNoteBullets(e.target.value)}
                rows={4}
                placeholder={
                  "e.g.\nWarfarin + ciprofloxacin flagged\nCalled Dr. Musa, switched to nitrofurantoin\nINR recheck booked for Friday"
                }
                className="w-full bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan mb-4"
              />
              <PrimaryButton
                onClick={draftNote}
                disabled={noteLiveLoading || !noteBullets.trim()}
                className="flex items-center gap-2"
              >
                {liveMode && <FiZap size={14} />}{" "}
                {liveMode ? "Draft With Live AI" : "Generate Structured Note"}
              </PrimaryButton>
            </GlowCard>

            {noteLiveLoading && (
              <GlowCard className="mb-6">
                <LiveThinking label="Drafting documentation with Phantom..." />
              </GlowCard>
            )}
            {noteLiveError && (
              <GlowCard className="mb-6">
                <AIErrorNote
                  message={noteLiveError}
                  onRetry={runLiveNoteDraft}
                />
              </GlowCard>
            )}

            {noteDraft && (
              <FadeIn>
                {liveMode && (
                  <LiveModeNote>
                    Live AI Mode — generated by Claude, not scripted
                  </LiveModeNote>
                )}
                <GlowCard className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <FiFileText className="text-ai-cyan" size={15} /> Drafted
                      Record
                    </div>
                    <button
                      onClick={copyNoteDraft}
                      className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      {noteCopied ? (
                        <FiCheck size={12} className="text-mint" />
                      ) : (
                        <FiCopy size={12} />
                      )}{" "}
                      {noteCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[13.5px] text-slate-200 leading-relaxed whitespace-pre-line p-3 rounded-lg bg-white/[0.03] border border-white/10">
                    {noteDraft}
                  </p>
                </GlowCard>
                <div className="flex justify-end gap-3">
                  <GhostButton onClick={() => setNoteDraft(null)}>
                    Discard
                  </GhostButton>
                  <PrimaryButton onClick={saveNote}>
                    Save to Records Log
                  </PrimaryButton>
                </div>
              </FadeIn>
            )}
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
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="Search records..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <FiFilter size={12} /> Type:
                </div>
                <select
                  value={logTypeFilter}
                  onChange={(e) => setLogTypeFilter(e.target.value)}
                  className="bg-white/[0.04] border border-white/12 rounded-lg px-2.5 py-2 text-[12px] text-slate-200 focus:outline-none focus:border-ai-cyan"
                >
                  <option value="All">All types</option>
                  {RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </GlowCard>

            <StaggerList
              items={filteredRecords}
              renderItem={(r) => (
                <GlowCard>
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${RECORD_TYPE_STYLE[r.type]}`}
                      >
                        {r.type}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {r.id}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {r.date} · {r.pharmacist}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">
                    {r.patient}
                  </div>
                  <p className="text-[12.5px] text-slate-300 leading-relaxed">
                    {r.body}
                  </p>
                </GlowCard>
              )}
            />
            {filteredRecords.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-10">
                No records match this search/filter.
              </p>
            )}
          </FadeIn>
        )}
      </main>
    </>
  );
}
