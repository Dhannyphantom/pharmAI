"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX, FiMaximize, FiMinimize, FiFileText, FiZap, FiCpu } from "react-icons/fi";
import { useApp } from "@/context/AppContext";

const MODULES = [
  { href: "/cases", label: "Patient Assessment" },
  { href: "/counseling", label: "Patient Counselling" },
  { href: "/challenge", label: "AI vs Pharmacist" },
  { href: "/scanner", label: "Prescription Scanner" },
  { href: "/interactions", label: "Interaction Visualizer" },
  { href: "/renal-calculator", label: "Renal Dose Calculator" },
  { href: "/inventory", label: "Inventory Management" },
  { href: "/pharmacovigilance", label: "Pharmacovigilance" },
  { href: "/drug-discovery", label: "Drug Discovery" },
  { href: "/hospital-dashboard", label: "Hospital Dashboard" },
  { href: "/hallucination", label: "AI Hallucination Demo" },
  { href: "/takeaway", label: "Final Takeaway" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isFullscreen, toggleFullscreen, presenterNotes, setPresenterNotes, liveMode, setLiveMode } = useApp();

  return (
    <div className="sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 glass-strong border-b border-white/10 flex-wrap gap-y-2">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-ai-cyan to-ai-violet flex items-center justify-center text-[13px] font-bold text-slate-950">
            AI
          </span>
          <span className="font-semibold text-sm tracking-wide hidden sm:block">
            Clinical Pharmacy Assistant
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLiveMode(!liveMode)}
            title="Toggle Live AI Mode — calls the real Anthropic API instead of scripted content"
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
              liveMode
                ? "border-ai-cyan/60 text-ai-cyan bg-ai-cyan/15 glow-cyan"
                : "border-white/12 text-slate-400 hover:text-slate-200"
            }`}
          >
            {liveMode ? <FiZap size={13} /> : <FiCpu size={13} />}
            {liveMode ? "Live AI Mode" : "Simulated Mode"}
          </button>
          <button
            onClick={() => setPresenterNotes(!presenterNotes)}
            title="Toggle presenter notes (P)"
            className={`hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition ${
              presenterNotes
                ? "border-ai-cyan/50 text-ai-cyan bg-ai-cyan/10"
                : "border-white/10 text-slate-400 hover:text-slate-200"
            }`}
          >
            <FiFileText size={13} /> Presenter Notes
          </button>
          <button
            onClick={toggleFullscreen}
            title="Toggle fullscreen (F)"
            className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 transition"
          >
            {isFullscreen ? <FiMinimize size={15} /> : <FiMaximize size={15} />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg border border-white/10 text-slate-200"
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

      {open && (
        <div className="glass-strong border-b border-white/10 px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              onClick={() => setOpen(false)}
              className={`text-xs sm:text-sm px-3 py-2.5 rounded-lg border transition ${
                pathname === m.href
                  ? "border-ai-cyan/50 bg-ai-cyan/10 text-ai-cyan"
                  : "border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/5"
              }`}
            >
              {m.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
