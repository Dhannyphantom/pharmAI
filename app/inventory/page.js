"use client";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  FiPackage, FiTrendingUp, FiZap, FiClock, FiClipboard, FiActivity, FiTruck, FiSearch, FiAlertTriangle, FiBarChart2,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, PrimaryButton, LevelBar, SegmentedTabs, BackButton, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import { INVENTORY_ITEMS } from "@/lib/miscData";
import {
  EXPIRY_ITEMS, expiryRisk, REQUISITIONS, requisitionFlag,
  STOCK_VARIANCE, varianceOf, RECEIVING_RECORDS, CENTRAL_STOCK,
} from "@/lib/bulkStoreData";
import { computeLmis, LMIS_STATUS_STYLE } from "@/lib/lmis";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";

const RISK_STYLES = {
  Low: "text-mint bg-mint/10 border-mint/30",
  Medium: "text-warn bg-warn/10 border-warn/30",
  High: "text-danger bg-danger/10 border-danger/30",
};
const RISK_BAR_COLOR = { Low: "var(--color-mint)", Medium: "var(--color-warn)", High: "var(--color-danger)" };
const EXPIRY_RISK_STYLE = {
  Expired: "text-danger bg-danger/15 border-danger/40",
  Critical: "text-danger bg-danger/10 border-danger/30",
  Warning: "text-warn bg-warn/10 border-warn/30",
  OK: "text-mint bg-mint/10 border-mint/30",
};

const TABS = [
  { value: "unit", label: "Unit Forecast", icon: FiTrendingUp },
  { value: "expiry", label: "Expiry Dashboard", icon: FiClock },
  { value: "requisitions", label: "Requisition Analyzer", icon: FiClipboard },
  { value: "variance", label: "Stock Variance", icon: FiActivity },
  { value: "receiving", label: "Receiving Check", icon: FiTruck },
  { value: "search", label: "Smart Search", icon: FiSearch },
];

const INVENTORY_SYSTEM_PROMPT = `You are a hospital pharmacy inventory analyst AI in an education demo. Given simulated stock data for one medication, write a concise (under 90 words) plain-language interpretation: is the stock situation concerning, and what would you recommend? No markdown, no JSON, just a short paragraph.`;
const SEARCH_SYSTEM_PROMPT = `You are a natural-language inventory search assistant for a hospital pharmacy education demo. Given unit-level and central-store inventory (JSON) and a natural-language question, answer directly and concisely (under 80 words) using only the data provided. Plain text, no markdown, no JSON.`;

export default function InventoryPage() {
  const [tab, setTab] = useState("unit");
  const [selected, setSelected] = useState(INVENTORY_ITEMS[0].name);
  const [liveText, setLiveText] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveAnswer, setLiveAnswer] = useState(null);
  const { liveMode } = useApp();

  const item = INVENTORY_ITEMS.find((i) => i.name === selected);
  const chartData = item.forecast.map((v, i) => ({ month: `M${i + 1}`, demand: v }));
  const stockPct = Math.max(0, Math.min(100, Math.round((item.stock / (item.reorderPoint * 2)) * 100)));

  const sortedExpiry = useMemo(() => [...EXPIRY_ITEMS].sort((a, b) => a.daysToExpiry - b.daysToExpiry), []);
  const sortedVariance = useMemo(() => [...STOCK_VARIANCE].sort((a, b) => Math.abs(varianceOf(b)) - Math.abs(varianceOf(a))), []);
  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return INVENTORY_ITEMS;
    const q = searchQuery.trim().toLowerCase();
    return INVENTORY_ITEMS.filter((i) => i.name.toLowerCase().includes(q) || i.risk.toLowerCase().includes(q));
  }, [searchQuery]);

  async function interpret() {
    setLiveError(null); setLiveLoading(true); setLiveText(null);
    try {
      const text = await askAI(
        `Medicine: ${item.name}\nCurrent stock: ${item.stock}\nReorder point: ${item.reorderPoint}\nExpiry: ${item.expiry}\n6-month demand forecast: ${item.forecast.join(", ")}\nRisk rating: ${item.risk}`,
        { system: INVENTORY_SYSTEM_PROMPT, maxTokens: 250 }
      );
      setLiveText(text);
    } catch (e) { setLiveError(e.message); } finally { setLiveLoading(false); }
  }

  async function runLiveSearch() {
    if (!searchQuery.trim()) return;
    setLiveError(null); setLiveLoading(true); setLiveAnswer(null);
    try {
      const text = await askAI(
        `Unit stock: ${JSON.stringify(INVENTORY_ITEMS)}\nCentral store stock: ${JSON.stringify(CENTRAL_STOCK)}\n\nQuestion: ${searchQuery.trim()}`,
        { system: SEARCH_SYSTEM_PROMPT, maxTokens: 220 }
      );
      setLiveAnswer(text);
    } catch (e) { setLiveError(e.message); } finally { setLiveLoading(false); }
  }

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="Inventory Management"
          title="Unit & Central Stock Intelligence"
          subtitle="Demand forecasting and full LMIS analysis for this unit, plus the shared Bulk Store tools: expiry monitoring, requisition anomalies, stock variance and receiving checks, and natural-language search."
        />

        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "unit" && (
          <>
            <FadeIn>
              <GlowCard className="mb-6 overflow-x-auto">
                <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2"><FiBarChart2 className="text-ai-violet" /> LMIS Overview — This Unit</h3>
                <p className="text-[11.5px] text-slate-500 mb-4">Average Monthly Consumption (AMC), Reorder Level (ROL), safety/max stock, and months of stock (MOS) remaining, with a recommendation per item.</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                      <th className="pb-2 pr-3">Medicine</th>
                      <th className="pb-2 pr-3">Stock</th>
                      <th className="pb-2 pr-3">AMC</th>
                      <th className="pb-2 pr-3">ROL</th>
                      <th className="pb-2 pr-3">Min / Max</th>
                      <th className="pb-2 pr-3">MOS</th>
                      <th className="pb-2 pr-3">Status</th>
                      <th className="pb-2">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INVENTORY_ITEMS.map((i) => {
                      const lmis = computeLmis(i);
                      return (
                        <tr key={i.name} className="border-b border-white/5 align-top">
                          <td className="py-2.5 pr-3 text-slate-200 font-medium whitespace-nowrap">{i.name}</td>
                          <td className="py-2.5 pr-3 text-slate-300 tabular-nums">{i.stock}</td>
                          <td className="py-2.5 pr-3 text-slate-400 tabular-nums">{i.amc}</td>
                          <td className="py-2.5 pr-3 text-slate-400 tabular-nums">{i.reorderPoint}</td>
                          <td className="py-2.5 pr-3 text-slate-400 tabular-nums whitespace-nowrap">{i.minStock} / {i.maxStock}</td>
                          <td className="py-2.5 pr-3 text-slate-300 tabular-nums">{lmis.mos ?? "—"}</td>
                          <td className="py-2.5 pr-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${LMIS_STATUS_STYLE[lmis.status]}`}>{lmis.status}</span>
                          </td>
                          <td className="py-2.5 text-slate-400 text-[12px] max-w-xs">{lmis.recommendation}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </GlowCard>
            </FadeIn>

            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
            <GlowCard className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                    <th className="pb-2 pr-3">Medicine</th><th className="pb-2 pr-3">Stock</th><th className="pb-2 pr-3">Expiry</th><th className="pb-2">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY_ITEMS.map((i) => (
                    <tr key={i.name} onClick={() => { setSelected(i.name); setLiveText(null); }}
                      className={`cursor-pointer border-b border-white/5 hover:bg-white/[0.04] transition-colors ${selected === i.name ? "bg-ai-cyan/5" : ""}`}>
                      <td className="py-2.5 pr-3 text-slate-200 font-medium">{i.name}</td>
                      <td className={`py-2.5 pr-3 tabular-nums ${i.stock < i.reorderPoint ? "text-warn font-semibold" : "text-slate-300"}`}>{i.stock}</td>
                      <td className="py-2.5 pr-3 text-slate-400 tabular-nums">{i.expiry}</td>
                      <td className="py-2.5"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${RISK_STYLES[i.risk]}`}>{i.risk}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlowCard>

            <FadeIn>
              <GlowCard>
                <div className="flex items-center gap-2 mb-1">
                  <FiTrendingUp className="text-ai-cyan" />
                  <h3 className="text-white font-bold text-sm">{item.name} — 6-Month Demand Forecast</h3>
                </div>
                <p className="text-[12px] text-slate-500 mb-4">Reorder point: {item.reorderPoint} units</p>
                <div className="mb-5">
                  <LevelBar percent={stockPct} color={RISK_BAR_COLOR[item.risk]} label="Current Stock Level" value={`${item.stock} units`} />
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ background: "#0B1730", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12 }} />
                      <Line type="monotone" dataKey="demand" stroke="#22D3EE" strokeWidth={2.5} dot={{ r: 3, fill: "#22D3EE" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {item.risk !== "Low" && (
                  <div className="mt-3 p-3 rounded-lg bg-warn/10 border border-warn/25 text-[12.5px] text-warn flex items-center gap-2">
                    <FiPackage size={14} /> AI Suggestion: reorder {Math.max(item.reorderPoint * 2 - item.stock, 100)} units within the next cycle.
                  </div>
                )}
                {liveMode && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <PrimaryButton onClick={interpret} disabled={liveLoading} className="flex items-center gap-2 mb-3">
                      <FiZap size={14} /> Ask Live AI to Interpret This
                    </PrimaryButton>
                    {liveLoading && <LiveThinking label="Analyzing with Claude..." />}
                    {liveError && <AIErrorNote message={liveError} onRetry={interpret} />}
                    {liveText && (
                      <FadeIn>
                        <LiveModeNote>Live AI Mode — generated by Claude, not scripted</LiveModeNote>
                        <p className="text-[13px] text-slate-200 leading-relaxed p-3 rounded-lg bg-ai-cyan/5 border border-ai-cyan/20">{liveText}</p>
                      </FadeIn>
                    )}
                  </div>
                )}
              </GlowCard>
            </FadeIn>
            </div>
          </>
        )}

        {tab === "expiry" && (
          <FadeIn>
            <GlowCard className="overflow-x-auto">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiClock className="text-warn" /> Items Nearest Expiry</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                    <th className="pb-2 pr-3">Medicine</th><th className="pb-2 pr-3">Batch</th><th className="pb-2 pr-3">Qty</th><th className="pb-2 pr-3">Expiry</th><th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExpiry.map((it) => {
                    const risk = expiryRisk(it.daysToExpiry);
                    return (
                      <tr key={it.batch} className="border-b border-white/5">
                        <td className="py-2.5 pr-3 text-slate-200 font-medium">{it.name}</td>
                        <td className="py-2.5 pr-3 text-slate-500 font-mono text-xs">{it.batch}</td>
                        <td className="py-2.5 pr-3 text-slate-300 tabular-nums">{it.qty}</td>
                        <td className="py-2.5 pr-3 text-slate-300 tabular-nums">{it.expiry}</td>
                        <td className="py-2.5"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${EXPIRY_RISK_STYLE[risk]}`}>{risk === "Expired" ? "Expired" : risk === "OK" ? "OK" : `${it.daysToExpiry}d — ${risk}`}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </GlowCard>
          </FadeIn>
        )}

        {tab === "requisitions" && (
          <FadeIn>
            <GlowCard className="overflow-x-auto">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiClipboard className="text-ai-cyan" /> Requisition Analyzer</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                    <th className="pb-2 pr-3">Department</th><th className="pb-2 pr-3">Item</th><th className="pb-2 pr-3">Requested</th><th className="pb-2 pr-3">Typical</th><th className="pb-2">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {REQUISITIONS.map((r) => {
                    const flag = requisitionFlag(r.qtyRequested, r.typicalQty);
                    return (
                      <tr key={r.id} className="border-b border-white/5">
                        <td className="py-2.5 pr-3 text-slate-200 font-medium">{r.department}</td>
                        <td className="py-2.5 pr-3 text-slate-300">{r.item}</td>
                        <td className={`py-2.5 pr-3 tabular-nums ${flag === "Unusual" ? "text-warn font-semibold" : "text-slate-300"}`}>{r.qtyRequested}</td>
                        <td className="py-2.5 pr-3 text-slate-500 tabular-nums">{r.typicalQty}</td>
                        <td className="py-2.5"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${flag === "Unusual" ? "text-warn bg-warn/10 border-warn/30" : "text-mint bg-mint/10 border-mint/30"}`}>{flag}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-[11.5px] text-slate-500 mt-4">Flags any requisition at 2× or more, or ¼ or less, of the department&apos;s typical order quantity.</p>
            </GlowCard>
          </FadeIn>
        )}

        {tab === "variance" && (
          <FadeIn>
            <GlowCard className="overflow-x-auto">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiActivity className="text-ai-violet" /> Stock Variance Dashboard</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                    <th className="pb-2 pr-3">Item</th><th className="pb-2 pr-3">Physical</th><th className="pb-2 pr-3">EMR</th><th className="pb-2 pr-3">Expected</th><th className="pb-2">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVariance.map((row) => {
                    const v = varianceOf(row);
                    const flagged = Math.abs(v) >= 10;
                    return (
                      <tr key={row.item} className="border-b border-white/5">
                        <td className="py-2.5 pr-3 text-slate-200 font-medium">{row.item}</td>
                        <td className="py-2.5 pr-3 text-slate-300 tabular-nums">{row.physical}</td>
                        <td className="py-2.5 pr-3 text-slate-300 tabular-nums">{row.emr}</td>
                        <td className="py-2.5 pr-3 text-slate-500 tabular-nums">{row.expected}</td>
                        <td className={`py-2.5 tabular-nums font-semibold flex items-center gap-1.5 ${flagged ? "text-danger" : "text-mint"}`}>{flagged && <FiAlertTriangle size={12} />} {v > 0 ? `+${v}` : v}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-[11.5px] text-slate-500 mt-4">Physical vs EMR variance of 10+ units is flagged for investigation (possible miscount, mispick, or pilferage).</p>
            </GlowCard>
          </FadeIn>
        )}

        {tab === "receiving" && (
          <FadeIn>
            <GlowCard className="overflow-x-auto">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiTruck className="text-mint" /> Receiving Discrepancy Checker</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                    <th className="pb-2 pr-3">GRN</th><th className="pb-2 pr-3">Item</th><th className="pb-2 pr-3">Ordered</th><th className="pb-2 pr-3">Invoiced</th><th className="pb-2 pr-3">Delivered</th><th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RECEIVING_RECORDS.map((r) => {
                    const mismatch = r.ordered !== r.invoiced || r.invoiced !== r.delivered || r.ordered !== r.delivered;
                    return (
                      <tr key={r.id} className="border-b border-white/5">
                        <td className="py-2.5 pr-3 text-slate-500 font-mono text-xs">{r.id}</td>
                        <td className="py-2.5 pr-3 text-slate-200 font-medium">{r.item}</td>
                        <td className="py-2.5 pr-3 text-slate-300 tabular-nums">{r.ordered}</td>
                        <td className={`py-2.5 pr-3 tabular-nums ${r.invoiced !== r.ordered ? "text-warn font-semibold" : "text-slate-300"}`}>{r.invoiced}</td>
                        <td className={`py-2.5 pr-3 tabular-nums ${r.delivered !== r.ordered ? "text-danger font-semibold" : "text-slate-300"}`}>{r.delivered}</td>
                        <td className="py-2.5"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${mismatch ? "text-danger bg-danger/10 border-danger/30" : "text-mint bg-mint/10 border-mint/30"}`}>{mismatch ? "Discrepancy" : "Clean"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </GlowCard>
          </FadeIn>
        )}

        {tab === "search" && (
          <FadeIn>
            <GlowCard className="mb-6">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiSearch className="text-ai-cyan" /> Smart Inventory Search</h3>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && liveMode && runLiveSearch()}
                  placeholder={liveMode ? "e.g. Which items are low at the unit but well-stocked centrally?" : "Search by name or risk level..."}
                  className="flex-1 bg-white/[0.04] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-ai-cyan" />
                {liveMode && (
                  <PrimaryButton onClick={runLiveSearch} disabled={liveLoading || !searchQuery.trim()} className="flex items-center gap-2 justify-center">
                    <FiZap size={14} /> Ask
                  </PrimaryButton>
                )}
              </div>
              <p className="text-[11.5px] text-slate-500">
                {liveMode ? "Ask Claude a natural-language question across unit and central store inventory." : "Instant keyword filter over the unit formulary. Switch on Live AI Mode to ask natural-language questions."}
              </p>
            </GlowCard>

            {liveLoading && <GlowCard className="mb-6"><LiveThinking label="Searching inventory with Claude..." /></GlowCard>}
            {liveError && <GlowCard className="mb-6"><AIErrorNote message={liveError} onRetry={runLiveSearch} /></GlowCard>}
            {liveMode && liveAnswer && (
              <FadeIn>
                <LiveModeNote>Live AI Mode — generated by Claude, not scripted</LiveModeNote>
                <GlowCard className="mb-6"><p className="text-[13.5px] text-slate-200 leading-relaxed">{liveAnswer}</p></GlowCard>
              </FadeIn>
            )}

            {!liveMode && (
              <GlowCard className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                      <th className="pb-2 pr-3">Medicine</th><th className="pb-2 pr-3">Unit Stock</th><th className="pb-2 pr-3">Central Stock</th><th className="pb-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((i) => {
                      const central = CENTRAL_STOCK.find((c) => c.name === i.name);
                      return (
                        <tr key={i.name} className="border-b border-white/5">
                          <td className="py-2.5 pr-3 text-slate-200 font-medium">{i.name}</td>
                          <td className="py-2.5 pr-3 text-slate-300 tabular-nums">{i.stock}</td>
                          <td className={`py-2.5 pr-3 tabular-nums ${central && central.qty < central.reorderPoint ? "text-warn font-semibold" : "text-slate-300"}`}>
                            {central ? central.qty : "—"}
                          </td>
                          <td className="py-2.5 text-slate-300">{i.risk}</td>
                        </tr>
                      );
                    })}
                    {filteredInventory.length === 0 && (
                      <tr><td colSpan={4} className="py-6 text-center text-slate-500">No matches.</td></tr>
                    )}
                  </tbody>
                </table>
              </GlowCard>
            )}
          </FadeIn>
        )}
      </main>
    </>
  );
}
