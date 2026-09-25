"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiX, FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import Orb from "./Orb";

/* ---------------------------------------------------------------------- */
/* Surfaces                                                                */
/* ---------------------------------------------------------------------- */

export function GlowCard({ children, className = "", glow = "", interactive = false, ...props }) {
  return (
    <motion.div
      className={`glass rounded-2xl p-5 sm:p-6 ${glow} ${interactive ? "surface-interactive" : ""} ${className}`}
      whileHover={interactive ? { y: -4, scale: 1.012 } : { y: -2 }}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, meta }) {
  return (
    <div className="mb-8 sm:mb-10">
      {eyebrow && <div className="text-eyebrow mb-2">{eyebrow}</div>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{title}</h1>
        {meta && <div className="shrink-0">{meta}</div>}
      </div>
      {subtitle && <p className="text-[15px] max-w-2xl mt-2.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>}
    </div>
  );
}

export function BackButton({ label = "Back", fallbackHref = "/", className = "" }) {
  const router = useRouter();
  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }
  return (
    <button onClick={handleClick} className={`flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-all duration-200 hover:-translate-x-0.5 mb-6 ${className}`}>
      <FiArrowLeft size={14} /> {label}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Buttons                                                                 */
/* ---------------------------------------------------------------------- */

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`btn-primary px-5 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgba(59,111,224,0.55)] active:translate-y-0 active:scale-[0.97] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2.5 rounded-xl border border-white/12 bg-white/[0.02] text-slate-200 font-medium text-sm hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Data display                                                            */
/* ---------------------------------------------------------------------- */

export function AnimatedCounter({ value, duration = 0.8, decimals = 0, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start;
    let raf;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setDisplay(value * progress);
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function ProgressRing({ percent, size = 120, stroke = 9, color = "var(--accent)", label }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="relative inline-flex items-center justify-center transition-transform duration-300 hover:scale-[1.04]" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-white tabular-nums"><AnimatedCounter value={percent} suffix="%" /></span>
        {label && <span className="text-[10px] text-slate-500 mt-0.5 text-center">{label}</span>}
      </div>
    </div>
  );
}

export function LevelBar({ percent, color = "var(--accent)", label, value }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full">
      {(label || value !== undefined) && (
        <div className="flex justify-between items-center mb-1.5 text-[11px] text-slate-500">
          {label && <span>{label}</span>}
          {value !== undefined && <span className="tabular-nums text-slate-300 font-medium">{value}</span>}
        </div>
      )}
      <div className="level-track">
        <motion.div
          className="level-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${clamped}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

const SEVERITY_STYLES = {
  Low: "bg-mint/10 text-mint border-mint/25",
  Moderate: "bg-warn/10 text-warn border-warn/25",
  High: "bg-danger/10 text-danger border-danger/25",
  Major: "bg-danger/10 text-danger border-danger/25",
  Critical: "bg-danger/15 text-danger border-danger/30",
};

export function SeverityPill({ level }) {
  const cls = SEVERITY_STYLES[level] || "bg-white/8 text-slate-300 border-white/15";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border transition-transform duration-150 hover:scale-105 ${cls}`}>
      {level}
    </span>
  );
}

export function StatTile({ icon: Icon, value, suffix = "", label, color = "text-slate-300", delay = 0 }) {
  return (
    <FadeIn delay={delay}>
      <GlowCard interactive className="text-center py-7">
        {Icon && (
          <div className={`w-9 h-9 mx-auto mb-3 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center ${color}`}>
            <Icon size={16} />
          </div>
        )}
        <div className="text-2xl sm:text-3xl font-semibold text-white mb-1 tabular-nums">
          <AnimatedCounter value={value} suffix={suffix} />
        </div>
        <div className="text-xs text-slate-500">{label}</div>
      </GlowCard>
    </FadeIn>
  );
}

export function SegmentedTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
      {tabs.map((t) => {
        const isActive = t.value === active;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`flex items-center gap-2 shrink-0 px-3.5 py-2 rounded-xl text-[13.5px] font-medium border transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] ${
              isActive
                ? "bg-[var(--accent)] text-white border-transparent"
                : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            {t.icon && <t.icon size={13} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function Modal({ open, onClose, title, eyebrow, children, wide = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className={`relative glass-strong rounded-2xl p-6 w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[85vh] overflow-y-auto`}
          >
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                {eyebrow && <div className="text-eyebrow mb-1.5">{eyebrow}</div>}
                {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
              </div>
              <button onClick={onClose} className="shrink-0 p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/25 transition-all duration-150 hover:rotate-90">
                <FiX size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------------- */
/* Motion helpers — scroll-triggered entrance, used quietly                */
/* ---------------------------------------------------------------------- */

export function FadeIn({ children, delay = 0, className = "", y = 10 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({ items, renderItem, gap = "gap-3", startDelay = 0, step = 0.05 }) {
  return (
    <div className={`flex flex-col ${gap}`}>
      {items.map((item, i) => (
        <FadeIn key={i} delay={startDelay + i * step}>
          {renderItem(item, i)}
        </FadeIn>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Live AI mode states                                                     */
/* ---------------------------------------------------------------------- */

export function LiveThinking({ label = "Consulting the assistant..." }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Orb size={56} />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

export function AIErrorNote({ message, onRetry }) {
  return (
    <div className="p-4 rounded-xl bg-danger/8 border border-danger/20 text-[13px] text-danger flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-danger/30 text-danger text-xs font-medium hover:bg-danger/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
          <FiRefreshCw size={11} /> Try again
        </button>
      )}
    </div>
  );
}

export function LiveModeNote({ children }) {
  return (
    <div className="achievement-pop mb-4 flex items-center gap-2 text-[11.5px] font-medium text-slate-300 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 w-fit">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
      {children || "Live AI Mode — real model call"}
    </div>
  );
}
