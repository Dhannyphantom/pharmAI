"use client";
import { useState } from "react";
import Link from "next/link";
import { FiSearch, FiHeart, FiArrowRight } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader, GlowCard, FadeIn, BackButton } from "@/components/ui";
import { PATIENTS, searchPatients } from "@/lib/patients";

export default function PatientPortalSearchPage() {
  const [query, setQuery] = useState("");
  const results = searchPatients(query);

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <BackButton label="Back to home" fallbackHref="/" />
        <PageHeader
          eyebrow="Patient Portal"
          title="Welcome — Find Your Record"
          subtitle="Search by name or hospital PID to open your personal portal — medication adherence, reminders, and instructions in your language."
        />

        <GlowCard className="mb-6">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/12 focus-within:border-mint transition-colors">
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
              <Link href={`/patient/${p.pid}`}>
                <GlowCard interactive className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint/30 to-ai-cyan/30 flex items-center justify-center shrink-0">
                      <FiHeart className="text-mint" size={17} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">{p.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">{p.pid}</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{p.age} yrs · {p.sex}</div>
                    </div>
                  </div>
                  <FiArrowRight className="text-slate-500 shrink-0" size={16} />
                </GlowCard>
              </Link>
            </FadeIn>
          ))}
          {results.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-16">No patients match &ldquo;{query}&rdquo;.</div>
          )}
        </div>
      </main>
    </>
  );
}
