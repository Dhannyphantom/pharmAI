"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function GlowCard({ children, className = "", glow = "", ...props }) {
  return (
    <div className={`glass rounded-2xl p-5 sm:p-6 ${glow} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <div className="text-[11px] font-semibold tracking-[0.2em] text-ai-cyan uppercase mb-2">
          {eyebrow}
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
      {subtitle && <p className="text-slate-400 text-sm sm:text-base max-w-2xl">{subtitle}</p>}
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`px-6 py-3 rounded-xl bg-gradient-to-r from-hospital-blue to-ai-violet text-white font-semibold text-sm shadow-lg glow-blue disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`px-5 py-2.5 rounded-xl border border-white/15 text-slate-200 font-medium text-sm hover:bg-white/5 transition ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

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
    <span>
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
        <span className="text-xl font-bold text-white"><AnimatedCounter value={percent} suffix="%" /></span>
        {label && <span className="text-[10px] text-slate-400 mt-0.5 text-center">{label}</span>}
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

export function FadeIn({ children, delay = 0, className = "", y = 12 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
        <button onClick={onRetry} className="shrink-0 px-3 py-1.5 rounded-lg border border-danger/40 text-danger text-xs font-semibold hover:bg-danger/10">
          Try Again
        </button>
      )}
    </div>
  );
}

export function LiveModeNote({ children }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase text-ai-cyan bg-ai-cyan/10 border border-ai-cyan/25 rounded-full px-3 py-1.5 w-fit">
      ⚡ {children || "Live AI Mode — real API call"}
    </div>
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

