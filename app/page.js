"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiSearch, FiArrowRight, FiUser, FiHeart, FiAward, FiCamera, FiShare2,
  FiSliders, FiPackage, FiAlertTriangle, FiAlertOctagon, FiMessageCircle,
  FiClipboard, FiActivity, FiGrid, FiZap, FiX,
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
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const { liveMode, setLiveMode } = useApp();
  const modalInputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MODULE_LINKS;
    return MODULE_LINKS.filter((m) => m.label.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
  }, [query]);

  // Move focus into the modal's own input once it mounts.
  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => modalInputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [searchOpen]);

  // Escape closes the search modal from anywhere.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (filtered.length > 0) {
      router.push(filtered[0].href);
      setSearchOpen(false);
    }
  }

  function goTo(href) {
    setSearchOpen(false);
    router.push(href);
  }

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-16 sm:py-20 text-center">
      <Orb size={112} className="mb-8" />

      <h1 className="text-3xl sm:text-4xl font-semibold text-slate-500 mb-1.5">
        Hi, Pharmacist
      </h1>
      <p className="text-3xl sm:text-4xl font-semibold text-white mb-10">
        How can PhantomAI help today?
      </p>

      {/* Command bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="rounded-2xl border border-ai-cyan/20 bg-gradient-to-b from-ai-cyan/[0.07] to-transparent p-1.5">
          {/* "Unlock more..." strip — a real app feature, not a fake upsell:
              tapping it turns on Live AI Mode across every module. */}
          <button
            type="button"
            onClick={() => setLiveMode(true)}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 mb-1.5 rounded-xl text-[12.5px] font-medium text-ai-cyan hover:bg-ai-cyan/10 transition-colors"
          >
            <FiZap size={13} className="shrink-0" />
            {liveMode
              ? "Live AI Mode is on — every module now calls Claude in real time"
              : "Unlock Live AI Mode — real-time Claude analysis across every module"}
          </button>

          <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-[#0b0c0f] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4">
              <FiSearch className="text-slate-500 shrink-0" size={17} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
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
          </form>
        </div>
      </div>

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

      {/* Animated search modal — opens on input focus */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh]"
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl glass-strong rounded-2xl border border-white/12 overflow-hidden shadow-2xl"
            >
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                  <FiSearch className="text-slate-500 shrink-0" size={17} />
                  <input
                    ref={modalInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search modules, e.g. inventory, interactions, scanner..."
                    className="flex-1 bg-transparent text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <FiX size={15} />
                  </button>
                </div>
              </form>

              <div className="max-h-[50vh] overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm py-10">
                    No module matches &ldquo;{query}&rdquo;.
                  </div>
                ) : (
                  filtered.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <motion.button
                        key={m.href}
                        type="button"
                        onClick={() => goTo(m.href)}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.2 }}
                        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/10 text-slate-300">
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-medium text-white">{m.label}</div>
                          <div className="text-[12px] text-slate-500 truncate">{m.desc}</div>
                        </div>
                        <FiArrowRight className="ml-auto text-slate-600 shrink-0" size={13} />
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
