"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLayers, FiAlertTriangle, FiZap, FiCheckCircle, FiTarget,
  FiClipboard, FiPackage, FiDollarSign, FiClock, FiActivity, FiSearch, FiGrid,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, StaggerList, StatTile } from "@/components/ui";
import { HOSPITAL_UNITS, CORE_DASHBOARD_METRICS, DEMONSTRATION_FLOW } from "@/lib/unitsData";

const METRIC_ICONS = {
  screened: FiClipboard,
  alerts: FiAlertTriangle,
  stock: FiPackage,
  expiry: FiClock,
  billing: FiDollarSign,
  variance: FiActivity,
  requests: FiLayers,
};

export default function UnitsPage() {
  const [activeId, setActiveId] = useState(HOSPITAL_UNITS[0].id);
  const unit = HOSPITAL_UNITS.find((u) => u.id === activeId);

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <PageHeader
          eyebrow="Integrated Pharmacy AI Web App"
          title="Hospital Pharmacy Units"
          subtitle="Five real pharmacy units, their day-to-day workflow, the friction points staff face, and the AI interventions — and matching web app demonstrations — proposed for each."
        />

        {/* Unit switcher — console-style segmented control */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
          {HOSPITAL_UNITS.map((u) => {
            const active = u.id === activeId;
            return (
              <button
                key={u.id}
                onClick={() => setActiveId(u.id)}
                className={`relative shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  active
                    ? "bg-gradient-to-r from-hospital-blue to-ai-violet text-white border-transparent glow-blue"
                    : "border-white/12 text-slate-300 hover:border-white/25 hover:bg-white/5"
                }`}
              >
                {u.name}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Unit hero strip */}
            <GlowCard glow="glow-blue" className="mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-eyebrow mb-2">{unit.tag}</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{unit.name}</h2>
                  <p className="text-sm text-slate-400">{unit.primaryFunction}</p>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ai-cyan/10 border border-ai-cyan/25 text-ai-cyan text-xs font-semibold shrink-0">
                  <FiTarget size={14} /> Demo focus: {unit.demoHighlight}
                </div>
              </div>
            </GlowCard>

            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 mb-6">
              {/* Workflow — quest-style step list */}
              <GlowCard>
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <FiLayers className="text-ai-cyan" /> Workflow
                </h3>
                <StaggerList
                  items={unit.workflow}
                  gap="gap-2.5"
                  renderItem={(step, i) => (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-white/[0.06] border border-white/15 text-[11px] font-bold text-slate-300 flex items-center justify-center tabular-nums">
                        {i + 1}
                      </span>
                      <span className="text-[13px] text-slate-300 leading-relaxed pt-0.5">{step}</span>
                    </div>
                  )}
                />
              </GlowCard>

              <div className="flex flex-col gap-6">
                {/* Key challenges */}
                <GlowCard className="border-warn/20">
                  <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                    <FiAlertTriangle className="text-warn" /> Key Challenges
                  </h3>
                  <ul className="space-y-2">
                    {unit.challenges.map((c) => (
                      <li key={c} className="text-[13px] text-slate-300 leading-relaxed flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warn/70 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </GlowCard>

                {/* AI interventions */}
                <GlowCard className="border-ai-cyan/20">
                  <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                    <FiZap className="text-ai-cyan" /> AI Interventions
                  </h3>
                  <ul className="space-y-2">
                    {unit.aiInterventions.map((a) => (
                      <li key={a} className="text-[13px] text-slate-300 leading-relaxed flex items-start gap-2">
                        <FiCheckCircle className="text-ai-cyan/80 shrink-0 mt-0.5" size={13} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </GlowCard>
              </div>
            </div>

            {/* Web app demonstrations — achievement-style unlocked chips */}
            <GlowCard glow="glow-mint" className="mb-10">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <FiCheckCircle className="text-mint" /> Web App Demonstrations
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {unit.webAppDemos.map((d, i) => (
                  <motion.span
                    key={d}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-mint/10 border border-mint/25 text-mint text-[12.5px] font-semibold"
                  >
                    <FiCheckCircle size={12} /> {d}
                  </motion.span>
                ))}
              </div>
            </GlowCard>
          </motion.div>
        </AnimatePresence>

        {/* Core dashboard — shared across all units */}
        <div className="mb-4">
          <div className="text-eyebrow mb-2">Shared Pharmacy Intelligence</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Core Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
            One dashboard rolling up medication safety, inventory, billing and workflow signals from every unit.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {CORE_DASHBOARD_METRICS.map((m, i) => (
            <StatTile
              key={m.label}
              icon={METRIC_ICONS[m.iconKey] || FiGrid}
              value={m.value}
              label={m.label}
              delay={i * 0.06}
              color={i % 3 === 0 ? "text-ai-cyan" : i % 3 === 1 ? "text-warn" : "text-ai-violet"}
            />
          ))}
        </div>

        {/* Recommended demonstration flow */}
        <GlowCard>
          <h3 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
            <FiSearch className="text-ai-violet" /> Recommended Demonstration Flow
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {DEMONSTRATION_FLOW.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.1}>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 h-full">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-hospital-blue to-ai-violet text-white text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">{step.title}</span>
                  </div>
                  <p className="text-[12.5px] text-slate-400 leading-relaxed pl-9">{step.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <p className="text-[12.5px] text-slate-500 mt-5 italic">
            AI supports pharmacist decision-making; final clinical and operational decisions remain with qualified pharmacy staff.
          </p>
        </GlowCard>
      </main>
    </>
  );
}
