"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiZap, FiX, FiArrowLeft } from "react-icons/fi";

/* ---------------------------------------------------------------------- */
/* Surfaces                                                                */
/* ---------------------------------------------------------------------- */

export function GlowCard({ children, className = "", glow = "", interactive = false, ...props }) {
  return (
    <div
      className={`glass rounded-2xl p-5 sm:p-6 ${glow} ${interactive ? "surface-interactive" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, meta }) {
  return (
    <div className="mb-8 sm:mb-10">
      {eyebrow && <div className="text-eyebrow mb-3">{eyebrow}</div>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h1>
        {meta && <div className="shrink-0">{meta}</div>}
      </div>
      {subtitle && <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

/* Back navigation — used at the top of pages reached via a flow (e.g. a
   patient workspace, a merged multi-step module) so the person doesn't have
   to return to the home screen to go back a step. Falls back to `fallbackHref`
   when there's no browser history to go back to (e.g. a fresh tab / deep link). */
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
    <button onClick={handleClick} className={`flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6 ${className}`}>
      <FiArrowLeft size={13} /> {label}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Buttons                                                                 */
/* ---------------------------------------------------------------------- */

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`btn-primary px-6 py-3 rounded-xl text-white font-semibold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`px-5 py-2.5 rounded-xl border border-white/15 bg-white/[0.02] text-slate-200 font-medium text-sm hover:bg-white/[0.06] hover:border-white/25 transition-colors ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/* ---------------------------------------------------------------------- */
/* Data display                                                            */
/* ---------------------------------------------------------------------- */

export function AnimatedCounter({ value, duration = 1.2, decimals = 0, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start;
    let raf;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
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

export function ProgressRing({ percent, size = 120, stroke = 10, color = "#22D3EE", label }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
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
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white tabular-nums"><AnimatedCounter value={percent} suffix="%" /></span>
        {label && <span className="text-[10px] text-slate-400 mt-0.5 text-center uppercase tracking-wide">{label}</span>}
      </div>
    </div>
  );
}

/* Slim horizontal "level" bar — used for stock levels, XP-style progress,
   confidence meters, and any 0-100 measure that reads best inline. */
export function LevelBar({ percent, color = "var(--color-ai-cyan)", label, value }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full">
      {(label || value !== undefined) && (
        <div className="flex justify-between items-center mb-1.5 text-[11px] uppercase tracking-wide text-slate-400">
          {label && <span>{label}</span>}
          {value !== undefined && <span className="tabular-nums text-slate-300 font-semibold">{value}</span>}
        </div>
      )}
      <div className="level-track">
        <motion.div
          className="level-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

const SEVERITY_STYLES = {
  Low: "bg-mint/10 text-mint border-mint/30",
  Moderate: "bg-warn/10 text-warn border-warn/30",
  High: "bg-danger/10 text-danger border-danger/30",
  Major: "bg-danger/10 text-danger border-danger/30",
  Critical: "bg-danger/20 text-danger border-danger/40",
};

export function SeverityPill({ level }) {
  const cls = SEVERITY_STYLES[level] || "bg-white/10 text-slate-300 border-white/20";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${cls}`}>
      {level}
    </span>
  );
}

/* Compact stat tile for dashboard-style grids — icon, big number, label. */
export function StatTile({ icon: Icon, value, suffix = "", label, color = "text-ai-cyan", delay = 0 }) {
  return (
    <FadeIn delay={delay}>
      <GlowCard interactive className="text-center py-7">
        {Icon && (
          <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center ${color}`}>
            <Icon size={18} />
          </div>
        )}
        <div className="text-3xl sm:text-4xl font-bold text-white mb-1 tabular-nums">
          <AnimatedCounter value={value} suffix={suffix} />
        </div>
        <div className="text-xs text-slate-400">{label}</div>
      </GlowCard>
    </FadeIn>
  );
}

/* Segmented tab control — used by pages that bundle several related tools
   (e.g. one unit's billing verification + error dashboard + queue analytics). */
export function SegmentedTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-1 px-1">
      {tabs.map((t) => {
        const isActive = t.value === active;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              isActive
                ? "bg-gradient-to-r from-hospital-blue to-ai-violet text-white border-transparent glow-blue"
                : "border-white/12 text-slate-300 hover:border-white/25 hover:bg-white/5"
            }`}
          >
            {t.icon && <t.icon size={14} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* Lightweight modal overlay — used for the theatre request checklist and
   anywhere else a focused, dismissible panel is useful. */
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
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative glass-strong rounded-2xl p-6 w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[85vh] overflow-y-auto`}
          >
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                {eyebrow && <div className="text-eyebrow mb-1.5">{eyebrow}</div>}
                {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
              </div>
              <button onClick={onClose} className="shrink-0 p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/25 transition-colors">
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
/* Motion helpers                                                          */
/* ---------------------------------------------------------------------- */

export function FadeIn({ children, delay = 0, className = "", y = 12 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: "opacity, transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({ items, renderItem, gap = "gap-3", startDelay = 0, step = 0.12 }) {
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

export function LiveThinking({ label = "Consulting live AI model..." }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-ai-cyan/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full bg-gradient-to-br from-ai-cyan to-ai-violet"
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      </div>
      <span className="text-xs font-mono tracking-wide text-ai-cyan uppercase">{label}</span>
    </div>
  );
}

export function AIErrorNote({ message, onRetry }) {
  return (
    <div className="p-4 rounded-xl bg-danger/10 border border-danger/25 text-[13px] text-danger flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 px-3 py-1.5 rounded-lg border border-danger/40 text-danger text-xs font-semibold hover:bg-danger/10 transition-colors">
          Try Again
        </button>
      )}
    </div>
  );
}

/* "Achievement unlocked"-style badge shown when a live AI result lands. */
export function LiveModeNote({ children }) {
  return (
    <div className="achievement-pop mb-4 flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase text-ai-cyan bg-ai-cyan/10 border border-ai-cyan/25 rounded-full px-3 py-1.5 w-fit">
      <FiZap size={12} className="shrink-0" />
      {children || "Live AI Mode — real API call"}
    </div>
  );
}
