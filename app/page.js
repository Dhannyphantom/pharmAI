"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiActivity, FiArrowRight } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PrimaryButton, GhostButton } from "@/components/ui";

const MODULE_LINKS = [
  { href: "/cases", label: "Patient Assessment", desc: "Full 5-step AI clinical review flow" },
  { href: "/counseling", label: "Patient Counselling", desc: "AI-generated, pharmacist-reviewed patient info" },
  { href: "/challenge", label: "AI vs Pharmacist", desc: "Live audience quiz with scoring" },
  { href: "/scanner", label: "Prescription Scanner", desc: "Simulated handwriting-to-report pipeline" },
  { href: "/interactions", label: "Interaction Visualizer", desc: "Pick two drugs, see the connection" },
  { href: "/renal-calculator", label: "Renal Dose Calculator", desc: "Cockcroft-Gault CrCl + dose bands" },
  { href: "/inventory", label: "Inventory Management", desc: "AI stock forecasting dashboard" },
  { href: "/pharmacovigilance", label: "Pharmacovigilance", desc: "Signal detection from adverse reports" },
  { href: "/drug-discovery", label: "Drug Discovery", desc: "Millions of molecules to one medicine" },
  { href: "/hospital-dashboard", label: "Hospital Dashboard", desc: "Today's numbers, animated" },
  { href: "/hallucination", label: "AI Hallucination Demo", desc: "When the AI is confidently wrong" },
  { href: "/takeaway", label: "Final Takeaway", desc: "The closing message" },
];

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="text-xs font-semibold tracking-[0.25em] text-ai-cyan uppercase mb-3">
            Educational Demonstration
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            AI Clinical Pharmacy <span className="text-gradient">Assistant</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-10">
            Applications of AI in Current Pharmacy Practice and Patient Care
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mb-16"
        >
          <Link href="/cases">
            <PrimaryButton className="flex items-center gap-2">
              Begin Patient Assessment <FiArrowRight />
            </PrimaryButton>
          </Link>
          <Link href="#modules">
            <GhostButton>Explore All Modules</GhostButton>
          </Link>
        </motion.div>

        <motion.div
          id="modules"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left"
        >
          {MODULE_LINKS.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="glass rounded-xl p-4 hover:border-ai-cyan/40 hover:bg-white/[0.06] transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-white">{m.label}</span>
                <FiArrowRight className="text-slate-500 group-hover:text-ai-cyan group-hover:translate-x-0.5 transition" size={14} />
              </div>
              <p className="text-xs text-slate-400">{m.desc}</p>
            </Link>
          ))}
        </motion.div>
      </main>
    </>
  );
}
