"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function CountdownTimer({ seconds = 30, onComplete, autoStart = true }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(autoStart);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete?.();
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, running, onComplete]);

  const pct = (remaining / seconds) * 100;
  const urgent = remaining <= 10;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 shrink-0">
        <svg width="64" height="64" className="-rotate-90">
          <circle cx="32" cy="32" r="27" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
          <motion.circle
            cx="32" cy="32" r="27"
            stroke={urgent ? "#EF4444" : "#22D3EE"}
            strokeWidth="6" fill="none" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 27}
            animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - pct / 100) }}
            transition={{ duration: 0.9, ease: "linear" }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-bold text-lg ${urgent ? "text-danger" : "text-white"}`}>
          {remaining}
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold text-white">What would you do?</div>
        <div className="text-xs text-slate-400">Discuss as a group before revealing the AI analysis.</div>
      </div>
    </div>
  );
}
