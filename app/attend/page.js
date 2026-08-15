"use client";
import { useState } from "react";
import Link from "next/link";
import { FiSearch, FiUser, FiArrowRight, FiAlertTriangle } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, BackButton } from "@/components/ui";
import { PATIENTS, searchPatients } from "@/lib/patients";

export default function AttendPage() {
  const [query, setQuery] = useState("");
  const results = searchPatients(query);

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="Unified Workflow"
          title="Attend to Patient"
          subtitle="Search by patient name or hospital PID to open a full pharmacist workspace — chart, AI checks, billing, theatre, and counselling in one place."
        />

        <GlowCard className="mb-6">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/12 focus-within:border-ai-cyan transition-colors">
            <FiSearch className="text-slate-400 shrink-0" size={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or PID, e.g. Bello or PID-20140..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              autoFocus
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5">All patient names are fictional and initialized for demonstration purposes only.</p>
        </GlowCard>

        <div className="space-y-3">
          {results.map((p, i) => (
            <FadeIn key={p.pid} delay={i * 0.05}>
              <Link href={`/attend/${p.pid}`}>
                <GlowCard interactive className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hospital-blue/30 to-ai-violet/30 flex items-center justify-center shrink-0">
                      <FiUser className="text-ai-cyan" size={17} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">{p.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">{p.pid}</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{p.age} yrs · {p.sex} · {p.diagnosis}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {p.newPrescriptions?.some((rx) => !rx.dispensed) && (
                      <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-warn bg-warn/10 border border-warn/25 rounded-full px-2.5 py-1">
                        <FiAlertTriangle size={11} /> Rx pending
                      </span>
                    )}
                    <FiArrowRight className="text-slate-500" size={16} />
                  </div>
                </GlowCard>
              </Link>
            </FadeIn>
          ))}
          {results.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-16">No patients match &ldquo;{query}&rdquo;.</div>
          )}
        </div>

        <p className="text-[11px] text-slate-600 mt-8 text-center">{PATIENTS.length} demo patients loaded</p>
      </main>
    </>
  );
}
