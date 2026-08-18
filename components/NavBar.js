"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu, FiX, FiMaximize, FiMinimize, FiFileText, FiZap, FiCpu,
  FiUser, FiHeart, FiAward, FiCamera, FiShare2, FiSliders, FiPackage,
  FiAlertTriangle, FiActivity, FiAlertOctagon, FiMessageCircle,
} from "react-icons/fi";
import { useApp } from "@/context/AppContext";

const MODULE_GROUPS = [
  {
    label: "Standalone Clinical Tools",
    items: [
      { href: "/cases", label: "Patient Assessment (Case Library)", icon: FiUser },
      { href: "/counseling", label: "Patient Counselling & Drug Reference", icon: FiHeart },
      { href: "/training", label: "Pharmacy Training — Virtual Patient", icon: FiMessageCircle },
      { href: "/challenge", label: "AI vs Pharmacist", icon: FiAward },
      { href: "/scanner", label: "Prescription Scanner", icon: FiCamera },
      { href: "/interactions", label: "Interaction Visualizer", icon: FiShare2 },
      { href: "/renal-calculator", label: "Renal Dose Calculator & Pharmacogenomics", icon: FiSliders },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/theatre", label: "Theatre", icon: FiActivity },
      { href: "/inventory", label: "Inventory Management", icon: FiPackage },
      { href: "/pharmacovigilance", label: "Pharmacovigilance", icon: FiAlertTriangle },
    ],
  },
  {
    label: "Overview",
    items: [
      { href: "/drug-discovery", label: "Drug Discovery", icon: FiActivity },
      { href: "/hallucination", label: "AI Hallucination Demo", icon: FiAlertOctagon },
    ],
  },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isFullscreen, toggleFullscreen, presenterNotes, setPresenterNotes, liveMode, setLiveMode } = useApp();

  return (
    <div className="sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 glass-strong border-b border-white/10 flex-wrap gap-y-2">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-ai-cyan to-ai-violet flex items-center justify-center text-[13px] font-bold text-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset] transition-transform group-hover:scale-105">
            P
          </span>
          <span className="hidden sm:flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-wide text-white">PhantomAI</span>
            <span className="font-medium text-xs tracking-wide text-slate-400">Clinical Pharmacy Assistant</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/attend"
            className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
              pathname.startsWith("/attend")
                ? "border-ai-violet/50 text-ai-violet bg-ai-violet/15"
                : "border-ai-violet/30 text-ai-violet/90 hover:bg-ai-violet/10"
            }`}
          >
            <FiUser size={12} /> Attend to Patient
          </Link>

          {/* Live Mode — console-style power toggle */}
          <button
            onClick={() => setLiveMode(!liveMode)}
            title="Toggle Live AI Mode — calls the real Anthropic API instead of scripted content"
            className={`relative flex items-center gap-1.5 text-xs font-semibold pl-2.5 pr-3 py-1.5 rounded-full border transition-all duration-200 ${
              liveMode
                ? "border-ai-cyan/60 text-ai-cyan bg-ai-cyan/15 glow-cyan"
                : "border-white/12 text-slate-400 hover:text-slate-200 hover:border-white/20"
            }`}
          >
            <span className={`relative flex items-center justify-center w-4 h-4 rounded-full ${liveMode ? "bg-ai-cyan/20" : "bg-white/5"}`}>
              {liveMode && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-ai-cyan/40"
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              {liveMode ? <FiZap size={10} /> : <FiCpu size={10} />}
            </span>
            {liveMode ? "Live AI Mode" : "Simulated Mode"}
          </button>

          <button
            onClick={() => setPresenterNotes(!presenterNotes)}
            title="Toggle presenter notes (P)"
            className={`hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              presenterNotes
                ? "border-ai-cyan/50 text-ai-cyan bg-ai-cyan/10"
                : "border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
            }`}
          >
            <FiFileText size={13} /> Presenter Notes
          </button>
          <button
            onClick={toggleFullscreen}
            title="Toggle fullscreen (F)"
            className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors"
          >
            {isFullscreen ? <FiMinimize size={15} /> : <FiMaximize size={15} />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className={`p-2 rounded-lg border transition-colors ${open ? "border-ai-cyan/50 text-ai-cyan bg-ai-cyan/10" : "border-white/10 text-slate-200 hover:border-white/20"}`}
          >
            {open ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>
      </div>

      {liveMode && (
        <div className="bg-ai-cyan/10 border-b border-ai-cyan/20 px-4 sm:px-6 py-1.5 text-[11px] text-ai-cyan text-center">
          Live AI Mode is on — this page will call the real Anthropic API and needs <code className="font-mono">ANTHROPIC_API_KEY</code> set in <code className="font-mono">.env.local</code>.
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong border-b border-white/10 overflow-hidden max-h-[75vh] overflow-y-auto"
          >
            <div className="px-4 sm:px-6 py-4">
              <Link
                href="/attend"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 text-sm px-3 py-3 rounded-lg border mb-4 font-semibold ${
                  pathname.startsWith("/attend")
                    ? "border-ai-violet/50 bg-ai-violet/10 text-ai-violet"
                    : "border-ai-violet/25 text-ai-violet bg-ai-violet/5"
                }`}
              >
                <FiUser size={15} className="shrink-0" /> Attend to Patient — the unified workflow
              </Link>

              <div className="space-y-5">
                {MODULE_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">{group.label}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {group.items.map((m) => {
                        const Icon = m.icon;
                        const active = pathname === m.href;
                        return (
                          <Link
                            key={m.href}
                            href={m.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-2.5 text-xs sm:text-sm px-3 py-2.5 rounded-lg border transition-all ${
                              active
                                ? "border-ai-cyan/50 bg-ai-cyan/10 text-ai-cyan"
                                : "border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/5"
                            }`}
                          >
                            <Icon size={14} className="shrink-0" />
                            <span className="truncate">{m.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
