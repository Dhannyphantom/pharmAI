"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiActivity, FiArrowRight, FiUser, FiHeart, FiAward, FiCamera, FiShare2,
  FiSliders, FiPackage, FiAlertTriangle, FiAlertOctagon, FiMessageCircle, FiClipboard,
} from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { GlowCard } from "@/components/ui";

const MODULE_LINKS = [
  { href: "/cases", label: "Patient Assessment", desc: "Full 5-step AI clinical review flow", icon: FiUser },
  { href: "/counseling", label: "Patient Counselling & Drug Reference", desc: "Patient-facing card plus clinical dosing reference", icon: FiHeart },
  { href: "/training", label: "Pharmacy Training — Virtual Patient", desc: "Chat or talk with a virtual patient; AI coaches your counselling", icon: FiMessageCircle },
  { href: "/challenge", label: "AI vs Pharmacist", desc: "Live audience quiz with scoring", icon: FiAward },
  { href: "/scanner", label: "Prescription Scanner", desc: "Simulated handwriting-to-report pipeline", icon: FiCamera },
  { href: "/interactions", label: "Interaction Visualizer", desc: "Pick two drugs, see the connection", icon: FiShare2 },
  { href: "/renal-calculator", label: "Renal Dose Calculator & Pharmacogenomics", desc: "Cockcroft-Gault CrCl, dose bands, and gene-drug demos", icon: FiSliders },
  { href: "/theatre", label: "Theatre", desc: "Request board with complication planning, requests, payment tracker", icon: FiActivity },
  { href: "/inventory", label: "Inventory Management", desc: "Predictive forecasting, LMIS analysis, expiry, requisitions, variance", icon: FiPackage },
  { href: "/pharmacovigilance", label: "Pharmacovigilance", desc: "Signal detection from adverse reports", icon: FiAlertTriangle },
  { href: "/patient", label: "Patient Portal", desc: "Adherence tracking, smart reminders, and instructions in local languages", icon: FiHeart },
  { href: "/communication", label: "Patient Communication", desc: "Bridge language barriers during counselling", icon: FiMessageCircle },
  { href: "/documentation", label: "Documentation & Records", desc: "AI-assisted intervention, dispensing, and incident documentation", icon: FiClipboard },
  { href: "/drug-discovery", label: "Drug Discovery", desc: "Millions of molecules to one medicine", icon: FiActivity },
  { href: "/hallucination", label: "AI Hallucination Demo", desc: "When the AI is confidently wrong", icon: FiAlertOctagon },
];

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col items-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-ai-cyan via-hospital-blue to-ai-violet flex items-center justify-center glow-cyan relative">
            <FiActivity size={38} className="text-white" />
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-ai-cyan/50"
              animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Phantom<span className="text-gradient">AI</span>
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl max-w-xl mx-auto mb-1 font-medium">
            The Clinical Pharmacy Assistant
          </p>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-10">
            Applications of AI in Current Pharmacy Practice and Patient Care
          </p>
        </motion.div>

        {/* Primary flows — Attend to Patient (pharmacist) and Patient Portal (patient) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="w-full max-w-2xl mb-6 grid sm:grid-cols-2 gap-4"
        >
          <Link href="/attend">
            <GlowCard interactive glow="glow-violet" className="border-ai-violet/30 text-left py-6 h-full">
              <div className="flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-2xl bg-ai-violet/15 border border-ai-violet/30 flex items-center justify-center text-ai-violet shrink-0">
                  <FiUser size={20} />
                  <motion.div
                    className="absolute inset-0 rounded-2xl border border-ai-violet/50"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base font-bold text-white">Attend to Patient</span>
                  </div>
                  <p className="text-xs text-slate-400">For pharmacists — search a patient, get the full clinical workspace.</p>
                </div>
              </div>
            </GlowCard>
          </Link>

          <Link href="/patient">
            <GlowCard interactive glow="glow-mint" className="border-mint/30 text-left py-6 h-full">
              <div className="flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-2xl bg-mint/15 border border-mint/30 flex items-center justify-center text-mint shrink-0">
                  <FiHeart size={20} />
                  <motion.div
                    className="absolute inset-0 rounded-2xl border border-mint/50"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base font-bold text-white">Patient Portal</span>
                  </div>
                  <p className="text-xs text-slate-400">For patients — adherence, reminders, and instructions in your language.</p>
                </div>
              </div>
            </GlowCard>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-2 text-[11px] text-slate-500 mb-4 uppercase tracking-wide"
        >
          <span className="w-8 h-px bg-white/15" /> Or explore standalone tools <span className="w-8 h-px bg-white/15" />
        </motion.div>

        <motion.div
          id="modules"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left"
        >
          {MODULE_LINKS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.href}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={m.href} className="block h-full">
                  <GlowCard interactive className="h-full group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center border bg-white/[0.04] border-white/10 text-ai-cyan">
                        <Icon size={16} />
                      </div>
                      <FiArrowRight className="text-slate-500 group-hover:text-ai-cyan group-hover:translate-x-0.5 transition-all mt-2" size={14} />
                    </div>
                    <span className="font-semibold text-sm text-white">{m.label}</span>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{m.desc}</p>
                  </GlowCard>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </>
  );
}
