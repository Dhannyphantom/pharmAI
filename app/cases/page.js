"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiUser, FiArrowRight, FiAlertTriangle } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard } from "@/components/ui";
import { CASES } from "@/lib/cases";

export default function CasesPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <PageHeader
          eyebrow="Step 1 of 5"
          title="Select a Patient Case"
          subtitle="Each case contains a real prescribing scenario with a hidden medication-related problem. Review the chart, discuss as a group, then reveal the AI analysis."
        />
        <div className="grid sm:grid-cols-2 gap-5">
          {CASES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={`/cases/${c.id}/assess`}>
                <GlowCard className="hover:border-ai-cyan/40 hover:bg-white/[0.06] transition group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-hospital-blue/30 to-ai-violet/30 flex items-center justify-center">
                      <FiUser className="text-ai-cyan" size={18} />
                    </div>
                    <FiArrowRight className="text-slate-500 group-hover:text-ai-cyan group-hover:translate-x-0.5 transition mt-2" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{c.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    {c.age} • {c.sex} • {c.diagnosis}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-warn bg-warn/10 border border-warn/20 rounded-full px-2.5 py-1 w-fit">
                    <FiAlertTriangle size={11} /> New Rx: {c.newPrescription.drug}
                  </div>
                </GlowCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </>
  );
}
