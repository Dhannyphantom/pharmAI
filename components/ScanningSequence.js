"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import Orb from "./Orb";

/**
 * Animated checklist scanning sequence, e.g.
 * ["Analyzing prescription...", "Checking allergies...", ...]
 * Calls onComplete when the last step finishes.
 */
export default function ScanningSequence({ steps, stepDuration = 650, onComplete }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [doneSteps, setDoneSteps] = useState([]);

  useEffect(() => {
    if (activeIndex >= steps.length) {
      onComplete?.();
      return;
    }
    const t = setTimeout(() => {
      setDoneSteps((d) => [...d, activeIndex]);
      setActiveIndex((i) => i + 1);
    }, stepDuration);
    return () => clearTimeout(t);
  }, [activeIndex, steps.length, stepDuration, onComplete]);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <Orb size={88} />

      <div className="w-full max-w-md space-y-2.5">
        {steps.map((label, i) => {
          const isDone = doneSteps.includes(i);
          const isActive = activeIndex === i;
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: isActive || isDone ? 1 : 0.3, x: 0 }}
              className="flex items-center gap-3 text-sm"
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  isDone
                    ? "bg-mint/15 border-mint/40 text-mint"
                    : isActive
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-white/15 text-transparent"
                }`}
              >
                {isDone ? (
                  <FiCheck size={12} />
                ) : isActive ? (
                  <motion.span
                    className="w-2 h-2 rounded-full bg-[var(--accent)]"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                ) : (
                  "•"
                )}
              </span>
              <span className={isDone ? "text-slate-300" : isActive ? "text-white font-medium" : "text-slate-500"}>
                {label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
