"use client";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FiPackage, FiTrendingUp, FiZap } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, PrimaryButton, LiveThinking, AIErrorNote, LiveModeNote } from "@/components/ui";
import { INVENTORY_ITEMS } from "@/lib/miscData";
import { useApp } from "@/context/AppContext";
import { askAI } from "@/lib/aiClient";

const RISK_STYLES = {
  Low: "text-mint bg-mint/10 border-mint/30",
  Medium: "text-warn bg-warn/10 border-warn/30",
  High: "text-danger bg-danger/10 border-danger/30",
};

const INVENTORY_SYSTEM_PROMPT = `You are a hospital pharmacy inventory analyst AI in an education demo. Given simulated stock data for one medication, write a concise (under 90 words) plain-language interpretation: is the stock situation concerning, and what would you recommend? No markdown, no JSON, just a short paragraph.`;

export default function InventoryPage() {
  const [selected, setSelected] = useState(INVENTORY_ITEMS[0].name);
  const [liveText, setLiveText] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const { liveMode } = useApp();
  const item = INVENTORY_ITEMS.find((i) => i.name === selected);
  const chartData = item.forecast.map((v, i) => ({ month: `M${i + 1}`, demand: v }));

  async function interpret() {
    setLiveError(null);
    setLiveLoading(true);
    setLiveText(null);
    try {
      const text = await askAI(
        `Medicine: ${item.name}\nCurrent stock: ${item.stock}\nReorder point: ${item.reorderPoint}\nExpiry: ${item.expiry}\n6-month demand forecast: ${item.forecast.join(", ")}\nRisk rating: ${item.risk}`,
        { system: INVENTORY_SYSTEM_PROMPT, maxTokens: 250 }
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
        <PageHeader
          eyebrow="AI Inventory Management"
          title="Hospital Stock Dashboard"
          subtitle="Simulated predictive demand forecasting and stockout risk scoring across the pharmacy formulary."
        />

        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
          <GlowCard className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-white/10">
                  <th className="pb-2 pr-3">Medicine</th>
                  <th className="pb-2 pr-3">Stock</th>
                  <th className="pb-2 pr-3">Expiry</th>
                  <th className="pb-2">Risk</th>
                </tr>
              </thead>
              <tbody>
                {INVENTORY_ITEMS.map((i) => (
                  <tr
                    key={i.name}
                    onClick={() => { setSelected(i.name); setLiveText(null); }}
                    className={`cursor-pointer border-b border-white/5 hover:bg-white/[0.04] transition ${
                      selected === i.name ? "bg-ai-cyan/5" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-3 text-slate-200 font-medium">{i.name}</td>
                    <td className={`py-2.5 pr-3 ${i.stock < i.reorderPoint ? "text-warn font-semibold" : "text-slate-300"}`}>{i.stock}</td>
                    <td className="py-2.5 pr-3 text-slate-400">{i.expiry}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${RISK_STYLES[i.risk]}`}>{i.risk}</span>
                    </td>
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
      </main>
    </>
  );
}
