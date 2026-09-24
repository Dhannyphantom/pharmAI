"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiHome, FiGrid, FiUser, FiHeart, FiMaximize, FiMinimize,
  FiZap, FiX, FiAward, FiCamera, FiShare2, FiSliders, FiPackage,
  FiAlertTriangle, FiActivity, FiAlertOctagon, FiMessageCircle, FiClipboard,
  FiSun, FiMoon,
} from "react-icons/fi";
import { useApp } from "@/context/AppContext";

export const MODULE_GROUPS = [
  {
    label: "Clinical tools",
    items: [
      { href: "/cases", label: "Patient assessment", icon: FiUser },
      { href: "/counseling", label: "Counselling & drug reference", icon: FiHeart },
      { href: "/training", label: "Training — virtual patient", icon: FiMessageCircle },
      { href: "/challenge", label: "AI vs pharmacist", icon: FiAward },
      { href: "/scanner", label: "Prescription scanner", icon: FiCamera },
      { href: "/interactions", label: "Interaction visualizer", icon: FiShare2 },
      { href: "/renal-calculator", label: "Renal dosing & pharmacogenomics", icon: FiSliders },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/theatre", label: "Theatre", icon: FiActivity },
      { href: "/inventory", label: "Inventory management", icon: FiPackage },
      { href: "/pharmacovigilance", label: "Pharmacovigilance", icon: FiAlertTriangle },
    ],
  },
  {
    label: "Patient & records",
    items: [
      { href: "/patient", label: "Patient portal", icon: FiHeart },
      { href: "/communication", label: "Patient communication", icon: FiMessageCircle },
      { href: "/documentation", label: "Documentation & records", icon: FiClipboard },
    ],
  },
  {
    label: "Overview",
    items: [
      { href: "/drug-discovery", label: "Drug discovery", icon: FiActivity },
      { href: "/hallucination", label: "AI hallucination demo", icon: FiAlertOctagon },
    ],
  },
];

const PRIMARY = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/attend", label: "Attend to patient", icon: FiUser },
  { href: "/patient", label: "Patient portal", icon: FiHeart },
];

function RailButton({ active, label, onClick, href, children }) {
  const cls = `relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors group ${
    active ? "bg-[var(--accent)] text-white" : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]"
  }`;
  const inner = (
    <>
      {children}
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-[#1a1c21] border border-white/10 px-2.5 py-1.5 text-[12px] text-slate-200 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 z-50">
        {label}
      </span>
    </>
  );
  if (href) {
    return <Link href={href} className={cls} aria-label={label}>{inner}</Link>;
  }
  return <button onClick={onClick} className={cls} aria-label={label}>{inner}</button>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isFullscreen, toggleFullscreen, liveMode, setLiveMode, theme, toggleTheme } = useApp();

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-40 w-[84px] flex-col items-center py-5 border-r border-white/8 bg-[var(--panel)]">
        <Link href="/" className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[13px] font-semibold text-white mb-5 shrink-0">
          P
        </Link>
        <div className="w-8 h-px bg-white/10 mb-4" />

        <nav className="flex flex-col items-center gap-1.5">
          {PRIMARY.map((item) => (
            <RailButton
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname === item.href}
            >
              <item.icon size={17} />
            </RailButton>
          ))}
          <RailButton label="All modules" onClick={() => setMenuOpen(true)} active={menuOpen}>
            <FiGrid size={17} />
          </RailButton>
        </nav>

        <div className="flex-1" />

        <div className="flex flex-col items-center gap-1.5">
          <RailButton
            label={liveMode ? "Live AI mode — on" : "Live AI mode — off"}
            onClick={() => setLiveMode(!liveMode)}
            active={liveMode}
          >
            <FiZap size={16} />
          </RailButton>
          <RailButton label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
            {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
          </RailButton>
          <RailButton
            label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
            onClick={toggleTheme}
            active={theme === "light"}
          >
            {theme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
          </RailButton>
          <div className="w-8 h-px bg-white/10 my-1" />
          <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 text-[12px] font-medium">
            PA
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed left-[84px] top-0 bottom-0 z-50 w-[300px] bg-[var(--panel)] border-r border-white/10 overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
                <span className="text-sm font-semibold text-white">All modules</span>
                <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]">
                  <FiX size={16} />
                </button>
              </div>
              <div className="px-4 py-4 space-y-5">
                {MODULE_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="text-[11px] font-medium text-slate-500 px-2 mb-1.5">{group.label}</div>
                    <div className="space-y-0.5">
                      {group.items.map((m) => {
                        const Icon = m.icon;
                        const active = pathname === m.href;
                        return (
                          <Link
                            key={m.href}
                            href={m.href}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13.5px] transition-colors ${
                              active ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "text-slate-300 hover:bg-white/[0.05]"
                            }`}
                          >
                            <Icon size={15} className="shrink-0" />
                            {m.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
