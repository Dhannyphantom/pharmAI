"use client";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  FiDollarSign,
  FiAlertTriangle,
  FiBarChart2,
  FiZap,
  FiClock,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import {
  PageHeader,
  GlowCard,
  FadeIn,
  StaggerList,
  SegmentedTabs,
  PrimaryButton,
  SeverityPill,
  BackButton,
  LiveThinking,
  AIErrorNote,
  LiveModeNote,
} from "@/components/ui";
import {
  BILLING_RECORDS,
  ERROR_LOG,
  QUEUE_DATA,
  getPeakHour,
} from "@/lib/nhisOpsData";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";

const BILLING_STATUS_STYLE = {
  Match: "text-mint bg-mint/10 border-mint/30",
  Mismatch: "text-danger bg-danger/10 border-danger/30",
  "Pending Payment": "text-warn bg-warn/10 border-warn/30",
};

const ERROR_SEVERITY_MAP = { Low: "Low", Moderate: "Moderate", High: "High" };

const OPS_SYSTEM_PROMPT = `You are an NHIS pharmacy operations AI in an education demo, briefing a pharmacy manager. Given billing records, an error log, and hourly queue data (all simulated), write a concise (under 100 words) plain-language operational summary — flag what needs attention today. No markdown, no JSON.`;

const TABS = [
  { value: "billing", label: "Billing Verification", icon: FiDollarSign },
  { value: "errors", label: "Error Dashboard", icon: FiAlertTriangle },
  { value: "queue", label: "Queue Analytics", icon: FiBarChart2 },
];

export default function NhisOpsPage() {
  const [tab, setTab] = useState("billing");
  const [liveText, setLiveText] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();

  const mismatchCount = BILLING_RECORDS.filter(
    (r) => r.status === "Mismatch",
  ).length;
  const peak = getPeakHour();

  async function briefOps() {
    setLiveError(null);
    setLiveLoading(true);
    setLiveText(null);
    try {
      const text = await askAI(
        `Billing records: ${JSON.stringify(BILLING_RECORDS)}\nError log: ${JSON.stringify(ERROR_LOG)}\nQueue data: ${JSON.stringify(QUEUE_DATA)}`,
        { system: OPS_SYSTEM_PROMPT, maxTokens: 280 },
      );
      setLiveText(text);
    } catch (e) {
      setLiveError(e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="NHIS Pharmacy"
          title="Billing, Errors & Queue Operations"
          subtitle="Verify prescribed vs. billed quantities, monitor prescription errors, and see when patient volume peaks."
        />

        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "billing" && (
          <FadeIn>
            <GlowCard className="mb-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <FiDollarSign className="text-ai-cyan" /> Billing Verification
                </h3>
                {mismatchCount > 0 && (
                  <span className="text-[11px] font-semibold text-danger bg-danger/10 border border-danger/25 rounded-full px-3 py-1">
                    {mismatchCount} discrepanc
                    {mismatchCount === 1 ? "y" : "ies"} found
                  </span>
                )}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                    <th className="pb-2 pr-3">Patient</th>
                    <th className="pb-2 pr-3">Drug</th>
                    <th className="pb-2 pr-3">Prescribed</th>
                    <th className="pb-2 pr-3">Billed</th>
                    <th className="pb-2 pr-3">Receipt</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {BILLING_RECORDS.map((r) => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="py-2.5 pr-3 text-slate-200 font-medium">
                        {r.patient}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-300">{r.drug}</td>
                      <td className="py-2.5 pr-3 text-slate-300 tabular-nums">
                        {r.prescribedQty}
                      </td>
                      <td
                        className={`py-2.5 pr-3 tabular-nums ${r.billedQty !== r.prescribedQty ? "text-danger font-semibold" : "text-slate-300"}`}
                      >
                        {r.billedQty}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500 text-xs">
                        {r.receiptNo}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${BILLING_STATUS_STYLE[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlowCard>
          </FadeIn>
        )}

        {tab === "errors" && (
          <FadeIn>
            <GlowCard className="mb-6">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <FiAlertTriangle className="text-warn" /> Prescription Error
                Dashboard
              </h3>
              <StaggerList
                items={ERROR_LOG}
                renderItem={(e) => (
                  <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">
                          {e.type}
                        </span>
                        <SeverityPill level={ERROR_SEVERITY_MAP[e.severity]} />
                      </div>
                      <p className="text-[12.5px] text-slate-300">
                        {e.description}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {e.drug} · {e.time}
                      </p>
                    </div>
                  </div>
                )}
              />
            </GlowCard>
          </FadeIn>
        )}

        {tab === "queue" && (
          <FadeIn>
            <GlowCard className="mb-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <FiBarChart2 className="text-ai-violet" /> Queue Analytics —
                  Today
                </h3>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ai-violet bg-ai-violet/10 border border-ai-violet/25 rounded-full px-3 py-1">
                  <FiClock size={11} /> Peak: {peak.hour} ({peak.patients}{" "}
                  patients)
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={QUEUE_DATA}>
                    <CartesianGrid
                      stroke="rgba(255,255,255,0.06)"
                      vertical={false}
                    />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "#0B1730",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 10,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="patients"
                      fill="#7C5CFF"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlowCard>
          </FadeIn>
        )}

        {liveMode && (
          <GlowCard>
            <PrimaryButton
              onClick={briefOps}
              disabled={liveLoading}
              className="flex items-center gap-2 mb-3"
            >
              <FiZap size={14} /> Ask Live AI for Today&apos;s Operations
              Briefing
            </PrimaryButton>
            {liveLoading && (
              <LiveThinking label="Analyzing operations with Phantom..." />
            )}
            {liveError && (
              <AIErrorNote message={liveError} onRetry={briefOps} />
            )}
            {liveText && (
              <FadeIn>
                <LiveModeNote>
                  Live AI Mode — generated by Claude, not scripted
                </LiveModeNote>
                <p className="text-[13px] text-slate-200 leading-relaxed p-3 rounded-lg bg-ai-cyan/5 border border-ai-cyan/20">
                  {liveText}
                </p>
              </FadeIn>
            )}
          </GlowCard>
        )}
      </main>
    </>
  );
}
