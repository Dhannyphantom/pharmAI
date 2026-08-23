"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  FiPackage, FiTrendingUp, FiZap, FiClock, FiClipboard, FiActivity, FiTruck, FiSearch,
  FiAlertTriangle, FiBarChart2, FiCheckCircle, FiHome, FiChevronDown, FiX,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, PrimaryButton, LevelBar, SegmentedTabs, BackButton, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import {
  EXPIRY_ITEMS, expiryRisk, REQUISITIONS, requisitionFlag,
  STOCK_VARIANCE, varianceOf, RECEIVING_RECORDS, CENTRAL_STOCK, getCentralStoreAsUnitItems,
} from "@/lib/bulkStoreData";
import { computeLmis, LMIS_STATUS_STYLE } from "@/lib/lmis";
import { computeForecast } from "@/lib/forecast";
import { UNITS, getUnitInventory, computeRisk } from "@/lib/unitInventory";
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

// "Unit" + "Central Store" are both valid locations for the forecast view —
// Central Store isn't in UNITS since it isn't a dispensing unit, so it's
// added here as its own top entry in the location dropdown.
const LOCATIONS = ["Central Store", ...UNITS];

function getItemsForLocation(loc) {
  return loc === "Central Store" ? getCentralStoreAsUnitItems() : getUnitInventory(loc);
}

const INVENTORY_SYSTEM_PROMPT = `You are a hospital pharmacy inventory analyst AI in an education demo. Given simulated stock data for one medication, write a concise (under 90 words) plain-language interpretation: is the stock situation concerning, and what would you recommend? No markdown, no JSON, just a short paragraph.`;
const SEARCH_SYSTEM_PROMPT = `You are a natural-language inventory search assistant for a hospital pharmacy education demo. Given unit-level and central-store inventory (JSON) and a natural-language question, answer directly and concisely (under 80 words) using only the data provided. Plain text, no markdown, no JSON.`;

export default function InventoryPage() {
  const [unit, setUnit] = useState(UNITS[0]);
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);
  const [tab, setTab] = useState("unit");
  const [aiReorderEnabled, setAiReorderEnabled] = useState(false);
  const unitItems = useMemo(() => getItemsForLocation(unit), [unit]);
  const [selected, setSelected] = useState(unitItems[0]?.name);
  const [liveText, setLiveText] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveAnswer, setLiveAnswer] = useState(null);
  const { liveMode } = useApp();

  // Always-available quick search across every unit's formulary plus
  // Central Store, so a specific drug can be found without first guessing
  // which unit or tab it lives in.
  const [globalQuery, setGlobalQuery] = useState("");
  const allLocationOptions = useMemo(() => {
    const list = [];
    LOCATIONS.forEach((loc) => {
      getItemsForLocation(loc).forEach((item) => list.push({ name: item.name, location: loc }));
    });
    return list;
  }, []);
  const globalMatches = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return [];
    return allLocationOptions.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 8);
  }, [globalQuery, allLocationOptions]);

  const item = unitItems.find((i) => i.name === selected) || unitItems[0];
  const itemRisk = item ? computeRisk(item) : "Low";
  const stockPct = item ? Math.max(0, Math.min(100, Math.round((item.stock / (item.reorderPoint * 2)) * 100))) : 0;
  const forecast = useMemo(() => (item ? computeForecast(item, { autoReorder: aiReorderEnabled }) : null), [item, aiReorderEnabled]);
  const predictionChartData = forecast
    ? [
        ...forecast.history.map((v, i) => ({ month: forecast.historyMonthLabels[i], actual: v, predicted: null })),
        { month: forecast.currentMonthLabel, actual: forecast.history[forecast.history.length - 1] ?? null, predicted: forecast.history[forecast.history.length - 1] ?? null },
        ...forecast.predicted.map((v, i) => ({ month: forecast.predictedMonthLabels[i], actual: null, predicted: v })),
      ]
    : [];

  const sortedExpiry = useMemo(() => [...EXPIRY_ITEMS].sort((a, b) => a.daysToExpiry - b.daysToExpiry), []);
  const sortedVariance = useMemo(() => [...STOCK_VARIANCE].sort((a, b) => Math.abs(varianceOf(b)) - Math.abs(varianceOf(a))), []);
  const filteredInventory = useMemo(() => {
    if (!searchQuery.trim()) return unitItems;
    const q = searchQuery.trim().toLowerCase();
    return unitItems.filter((i) => i.name.toLowerCase().includes(q) || computeRisk(i).toLowerCase().includes(q));
  }, [searchQuery, unitItems]);

  function changeUnit(u) {
    setUnit(u);
    const items = getItemsForLocation(u);
    setSelected(items[0]?.name);
    setLiveText(null);
  }

  function jumpToMatch(match) {
    setUnit(match.location);
    setSelected(match.name);
    setTab("unit");
    setGlobalQuery("");
    setLiveText(null);
  }

  async function interpret() {
    if (!item || !forecast) return;
    setLiveError(null); setLiveLoading(true); setLiveText(null);
    try {
      const text = await askAI(
        `Unit: ${unit}\nMedicine: ${item.name}\nCurrent stock: ${item.stock}\nReorder point: ${item.reorderPoint}\nExpiry: ${item.expiry}\nPast 6 months actual consumption: ${forecast.history.join(", ")}\nPredicted next 6 months demand: ${forecast.predicted.join(", ")}\nPredicted stockout: ${forecast.stockoutMonthLabel ?? "none within 6 months"}\nRisk rating: ${itemRisk}\nAI auto-reordering enabled: ${aiReorderEnabled ? "yes" : "no"}`,
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
        `Unit: ${unit}\nUnit stock: ${JSON.stringify(unitItems)}\nCentral store stock: ${JSON.stringify(CENTRAL_STOCK)}\n\nQuestion: ${searchQuery.trim()}`,
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
          subtitle="Demand forecasting and full LMIS analysis per unit or Central Store, plus expiry monitoring, requisition anomalies, stock variance and receiving checks."
        />

        {/* Always-available quick search — finds a drug across every unit + Central Store */}
        <div className="relative mb-6">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/12 focus-within:border-ai-cyan transition-colors">
            <FiSearch className="text-slate-400 shrink-0" size={16} />
            <input
              type="text"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Quick search any drug or item — across every unit and Central Store..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            {globalQuery && (
              <button onClick={() => setGlobalQuery("")} className="text-slate-500 hover:text-slate-300 shrink-0">
                <FiX size={14} />
              </button>
            )}
          </div>
          {globalQuery.trim() && (
            <div className="absolute z-30 mt-2 w-full glass-strong border border-white/12 rounded-xl p-1.5 max-h-72 overflow-y-auto">
              {globalMatches.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12.5px] text-slate-500">No items match &ldquo;{globalQuery}&rdquo;.</div>
              ) : (
                globalMatches.map((m, i) => (
                  <button
                    key={`${m.name}-${m.location}-${i}`}
                    onClick={() => jumpToMatch(m)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-slate-200 hover:bg-white/5 transition-colors"
                  >
                    <span className="truncate">{m.name}</span>
                    <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                      m.location === "Central Store" ? "text-ai-violet border-ai-violet/30 bg-ai-violet/10" : "text-ai-cyan border-ai-cyan/30 bg-ai-cyan/10"
                    }`}>{m.location}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Location dropdown (units + Central Store) and AI reordering toggle */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative">
            <button
              onClick={() => setUnitMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass border border-white/12 text-sm font-semibold text-white hover:border-ai-cyan/40 transition-colors"
            >
              {unit === "Central Store" ? <FiPackage className="text-ai-violet shrink-0" size={15} /> : <FiHome className="text-ai-cyan shrink-0" size={15} />}
              {unit}
              <FiChevronDown size={14} className={`text-slate-400 transition-transform ${unitMenuOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {unitMenuOpen && (
                <>
                  <button
                    className="fixed inset-0 z-20 cursor-default"
                    onClick={() => setUnitMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 mt-2 w-64 glass-strong border border-white/12 rounded-xl p-1.5 shadow-xl"
                  >
                    <button
                      onClick={() => { changeUnit("Central Store"); setUnitMenuOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                        unit === "Central Store" ? "bg-ai-violet/15 text-ai-violet" : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <FiPackage size={14} className="shrink-0" /> Central Store
                    </button>
                    <div className="h-px bg-white/10 my-1.5" />
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 px-3 pt-1 pb-1.5">Hospital Units</div>
                    <div className="max-h-56 overflow-y-auto">
                      {UNITS.map((u) => (
                        <button
                          key={u}
                          onClick={() => { changeUnit(u); setUnitMenuOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                            unit === u ? "bg-ai-cyan/15 text-ai-cyan" : "text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          <FiHome size={14} className="shrink-0" /> {u}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setAiReorderEnabled((v) => !v)}
            title="Simulate automatic replenishment once stock hits the reorder point"
            className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition-colors ${
              aiReorderEnabled ? "border-ai-cyan/50 bg-ai-cyan/10 text-ai-cyan glow-cyan" : "border-white/12 text-slate-400 hover:text-slate-200 hover:border-white/20"
            }`}
          >
            <FiZap size={13} /> {aiReorderEnabled ? "AI Reordering: On" : "Enable AI Reordering"}
          </button>
        </div>

        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "unit" && item && forecast && (
          <>
            <FadeIn>
              <GlowCard className="mb-6 overflow-x-auto">
                <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2"><FiBarChart2 className="text-ai-violet" /> LMIS Overview — {unit}</h3>
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
                    {unitItems.map((i) => {
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
                    {unitItems.map((i) => {
                      const r = computeRisk(i);
                      return (
                        <tr key={i.name} onClick={() => { setSelected(i.name); setLiveText(null); }}
                          className={`cursor-pointer border-b border-white/5 hover:bg-white/[0.04] transition-colors ${selected === i.name ? "bg-ai-cyan/5" : ""}`}>
                          <td className="py-2.5 pr-3 text-slate-200 font-medium">{i.name}</td>
                          <td className={`py-2.5 pr-3 tabular-nums ${i.stock < i.reorderPoint ? "text-warn font-semibold" : "text-slate-300"}`}>{i.stock}</td>
                          <td className="py-2.5 pr-3 text-slate-400 tabular-nums">{i.expiry}</td>
                          <td className="py-2.5"><span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${RISK_STYLES[r]}`}>{r}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </GlowCard>

              <FadeIn>
                <GlowCard>
                  <div className="flex items-center gap-2 mb-1">
                    <FiTrendingUp className="text-ai-cyan" />
                    <h3 className="text-white font-bold text-sm">{item.name} — Predicted Demand</h3>
                  </div>
                  <p className="text-[12px] text-slate-500 mb-4">
                    {unit} · Reorder point: {item.reorderPoint} units · trend: {forecast.trend >= 0 ? "+" : ""}{(forecast.trend * 100).toFixed(1)}%/mo
                  </p>
                  <div className="mb-5">
                    <LevelBar percent={stockPct} color={RISK_BAR_COLOR[itemRisk]} label="Current Stock Level" value={`${item.stock} units`} />
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={predictionChartData}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip contentStyle={{ background: "#0B1730", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12 }} />
                        <Line type="monotone" dataKey="actual" name="Actual (past 6mo)" stroke="#64748b" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2.5, fill: "#64748b" }} connectNulls />
                        <Line type="monotone" dataKey="predicted" name="Predicted (next 6mo)" stroke="#22D3EE" strokeWidth={2.5} dot={{ r: 3, fill: "#22D3EE" }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stockout / reordering status — only surfaces an alarming
                      banner when it's actually warranted: either AI reordering
                      is on and even it can't keep pace, or reordering is off
                      and the item is already at Medium/High risk. A healthy,
                      well-stocked item just gets a calm confirmation instead
                      of a scary but practically meaningless 6-month projection. */}
                  {aiReorderEnabled ? (
                    forecast.stockoutMonth ? (
                      <div className="mt-3 p-3 rounded-lg bg-danger/10 border border-danger/25 text-[12.5px] text-danger flex items-center gap-2">
                        <FiAlertTriangle size={14} className="shrink-0" /> Even with AI reordering active, the current lead time can&apos;t keep pace with demand — a stockout is still projected for {forecast.stockoutMonthLabel}. Consider expediting this order or raising the safety stock level.
                      </div>
                    ) : forecast.reorderPlacedMonthLabel ? (
                      <div className="mt-3 p-3 rounded-lg bg-mint/10 border border-mint/25 text-[12.5px] text-mint flex items-center gap-2">
                        <FiCheckCircle size={14} className="shrink-0" /> AI Reordering active — a replenishment order is projected for {forecast.reorderPlacedMonthLabel}, arriving {forecast.reorderArrivesMonthLabel}, keeping stock above zero throughout.
                      </div>
                    ) : (
                      <div className="mt-3 p-3 rounded-lg bg-mint/10 border border-mint/25 text-[12.5px] text-mint flex items-center gap-2">
                        <FiCheckCircle size={14} className="shrink-0" /> AI Reordering active — stock is projected to stay above the reorder point for the next 6 months, so no order is needed yet.
                      </div>
                    )
                  ) : itemRisk !== "Low" && forecast.stockoutMonth ? (
                    <div className="mt-3 p-3 rounded-lg bg-danger/10 border border-danger/25 text-[12.5px] text-danger flex items-center gap-2">
                      <FiAlertTriangle size={14} className="shrink-0" /> This item is already below a healthy stock level — at the current consumption trend, with no reorder placed, it's projected to run out in {forecast.stockoutMonthLabel}.
                    </div>
                  ) : (
                    <div className="mt-3 p-3 rounded-lg bg-mint/10 border border-mint/25 text-[12.5px] text-mint flex items-center gap-2">
                      <FiCheckCircle size={14} className="shrink-0" /> Stock is currently healthy — no urgent reorder action needed.
                    </div>
                  )}

                  {!aiReorderEnabled && itemRisk !== "Low" && (
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
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><FiSearch className="text-ai-cyan" /> Smart Inventory Search — {unit}</h3>
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
                {liveMode ? "Ask Claude a natural-language question across this unit's and central store inventory." : "Instant keyword filter over this location's formulary. Switch on Live AI Mode to ask natural-language questions."}
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
                          <td className="py-2.5 text-slate-300">{computeRisk(i)}</td>
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
