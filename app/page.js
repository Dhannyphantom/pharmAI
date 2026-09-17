"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiSearch, FiArrowRight, FiUser, FiHeart, FiAward, FiCamera, FiShare2,
  FiSliders, FiPackage, FiAlertTriangle, FiAlertOctagon, FiMessageCircle,
  FiClipboard, FiActivity, FiGrid, FiZap,
} from "react-icons/fi";
import { GlowCard } from "@/components/ui";
import { useApp } from "@/context/AppContext";
import Orb from "@/components/Orb";

const MODULE_LINKS = [
  { href: "/cases", label: "Patient assessment", desc: "Full clinical review flow, case by case.", icon: FiUser },
  { href: "/counseling", label: "Counselling & drug reference", desc: "Patient-facing card plus clinical dosing reference.", icon: FiHeart },
  { href: "/training", label: "Training — virtual patient", desc: "Practice counselling with a virtual patient.", icon: FiMessageCircle },
  { href: "/challenge", label: "AI vs pharmacist", desc: "Live audience quiz with scoring.", icon: FiAward },
  { href: "/scanner", label: "Prescription scanner", desc: "Simulated handwriting-to-report pipeline.", icon: FiCamera },
  { href: "/interactions", label: "Interaction visualizer", desc: "Pick two drugs, see the connection.", icon: FiShare2 },
  { href: "/renal-calculator", label: "Renal dosing & pharmacogenomics", desc: "Cockcroft-Gault CrCl, dose bands, gene-drug pairs.", icon: FiSliders },
  { href: "/theatre", label: "Theatre", desc: "Request board, complication planning, payment tracker.", icon: FiActivity },
  { href: "/inventory", label: "Inventory management", desc: "Forecasting, LMIS analysis, expiry, requisitions.", icon: FiPackage },
  { href: "/pharmacovigilance", label: "Pharmacovigilance", desc: "Signal detection from adverse reports.", icon: FiAlertTriangle },
  { href: "/patient", label: "Patient portal", desc: "Adherence, reminders, instructions in local languages.", icon: FiHeart },
  { href: "/communication", label: "Patient communication", desc: "Bridge language barriers during counselling.", icon: FiMessageCircle },
  { href: "/documentation", label: "Documentation & records", desc: "Dispensing, stock movements, and clinical notes.", icon: FiClipboard },
  { href: "/drug-discovery", label: "Drug discovery", desc: "Millions of molecules to one medicine.", icon: FiActivity },
  { href: "/hallucination", label: "AI hallucination demo", desc: "When the AI is confidently wrong.", icon: FiAlertOctagon },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { liveMode, setLiveMode } = useApp();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MODULE_LINKS;
    return MODULE_LINKS.filter((m) => m.label.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
  }, [query]);

  function handleSubmit(e) {
    e.preventDefault();
    if (filtered.length > 0) router.push(filtered[0].href);
  }

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-16 sm:py-20 text-center">
      <Orb size={112} className="mb-8" />

      <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-1.5">
        Hi, Pharmacist
      </h1>
      <p className="text-3xl sm:text-4xl font-semibold text-white mb-4">
        How can PhantomAI help today?
      </p>
      <p className="text-slate-500 text-[15px] max-w-md mx-auto mb-10 leading-relaxed">
        From prescription checks to inventory forecasting — search a module below,
        or jump straight into a patient.
      </p>

      {/* Command bar */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl mb-8">
        <div className="rounded-2xl border border-white/10 bg-[var(--panel)] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4">
            <FiSearch className="text-slate-500 shrink-0" size={17} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules, e.g. inventory, interactions, scanner..."
              className="flex-1 bg-transparent text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-2">
              <Link
                href="#modules"
                className="flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/[0.05] transition-colors"
              >
                <FiGrid size={12} /> All modules
              </Link>
              <button
                type="button"
                onClick={() => setLiveMode(!liveMode)}
                className={`flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-2 rounded-xl border transition-colors ${
                  liveMode
                    ? "border-[var(--accent)]/50 text-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-white/10 text-slate-300 hover:bg-white/[0.05]"
                }`}
              >
                <FiZap size={12} /> {liveMode ? "Live AI mode on" : "Live AI mode off"}
              </button>
            </div>
            <button
              type="submit"
              className="w-9 h-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center hover:bg-[#4a7ce8] transition-colors shrink-0"
              aria-label="Go"
            >
              <FiArrowRight size={15} />
            </button>
          </div>
        </div>
      </form>

      {/* Featured shortcuts */}
      <div className="w-full max-w-3xl grid sm:grid-cols-3 gap-3 mb-16 text-left">
        <Link href="/attend">
          <GlowCard interactive className="h-full">
            <FiUser className="text-slate-300 mb-3" size={18} />
            <div className="text-[13.5px] font-semibold text-white mb-1">Attend to patient</div>
            <p className="text-[12px] text-slate-500 leading-relaxed">Search a patient, open the full clinical workspace.</p>
          </GlowCard>
        </Link>
        <Link href="/patient">
          <GlowCard interactive className="h-full">
            <FiHeart className="text-slate-300 mb-3" size={18} />
            <div className="text-[13.5px] font-semibold text-white mb-1">Patient portal</div>
            <p className="text-[12px] text-slate-500 leading-relaxed">Adherence, reminders, and instructions for a signed-in patient.</p>
          </GlowCard>
        </Link>
        <Link href="/challenge">
          <GlowCard interactive className="h-full">
            <FiAward className="text-slate-300 mb-3" size={18} />
            <div className="text-[13.5px] font-semibold text-white mb-1">AI vs pharmacist</div>
            <p className="text-[12px] text-slate-500 leading-relaxed">Test your judgement against tricky prescribing scenarios.</p>
          </GlowCard>
        </Link>
      </div>

      {/* Full module grid */}
      <div id="modules" className="w-full max-w-5xl scroll-mt-24">
        <div className="text-left mb-4">
          <h2 className="text-sm font-semibold text-white">All modules</h2>
          <p className="text-[12.5px] text-slate-500 mt-0.5">{filtered.length} of {MODULE_LINKS.length}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
          {filtered.map((m) => {
            const Icon = m.icon;
            return (
              <Link href={m.href} key={m.href} className="block h-full">
                <GlowCard interactive className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/10 text-slate-300">
                      <Icon size={15} />
                    </div>
                    <FiArrowRight className="text-slate-600 mt-1.5" size={13} />
                  </div>
                  <span className="font-medium text-[13.5px] text-white">{m.label}</span>
                  <p className="text-[12px] text-slate-500 leading-relaxed mt-1">{m.desc}</p>
                </GlowCard>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-500 text-sm py-10">
              No module matches &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
