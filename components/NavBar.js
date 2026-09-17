"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX, FiZap, FiUser, FiHeart } from "react-icons/fi";
import { useApp } from "@/context/AppContext";
import { MODULE_GROUPS } from "./Sidebar";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { liveMode, setLiveMode } = useApp();

  return (
    <div className="lg:hidden sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--panel)] border-b border-white/8">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-[12px] font-semibold text-white">P</span>
          <span className="font-semibold text-sm text-white">PhantomAI</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLiveMode(!liveMode)}
            className={`flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1.5 rounded-full border ${
              liveMode ? "border-[var(--accent)]/50 text-[var(--accent)] bg-[var(--accent)]/10" : "border-white/12 text-slate-400"
            }`}
          >
            <FiZap size={11} /> {liveMode ? "Live" : "Simulated"}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg border border-white/10 text-slate-200"
          >
            {open ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[var(--panel)] border-b border-white/8 overflow-hidden max-h-[75vh] overflow-y-auto"
          >
            <div className="px-4 py-4">
              <Link
                href="/attend"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 text-sm px-3 py-3 rounded-xl bg-white/[0.04] border border-white/10 mb-2 font-medium text-slate-200"
              >
                <FiUser size={15} /> Attend to patient
              </Link>
              <Link
                href="/patient"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 text-sm px-3 py-3 rounded-xl bg-white/[0.04] border border-white/10 mb-4 font-medium text-slate-200"
              >
                <FiHeart size={15} /> Patient portal
              </Link>

              <div className="space-y-4">
                {MODULE_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="text-[11px] font-medium text-slate-500 mb-1.5">{group.label}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {group.items.map((m) => {
                        const Icon = m.icon;
                        const active = pathname === m.href;
                        return (
                          <Link
                            key={m.href}
                            href={m.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-2 text-[12.5px] px-2.5 py-2.5 rounded-lg ${
                              active ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "text-slate-300 bg-white/[0.02]"
                            }`}
                          >
                            <Icon size={13} className="shrink-0" />
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
