"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";

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
      <div className="relative w-28 h-28">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-ai-cyan/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border-2 border-t-transparent border-ai-violet/70"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-7 rounded-full bg-gradient-to-br from-ai-cyan to-ai-violet"
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="w-full max-w-md space-y-2.5">
        {steps.map((label, i) => {
          const isDone = doneSteps.includes(i);
          const isActive = activeIndex === i;
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isActive || isDone ? 1 : 0.3, x: 0 }}
              className="flex items-center gap-3 text-sm"
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  isDone
                    ? "bg-mint/20 border-mint/50 text-mint"
                    : isActive
                    ? "border-ai-cyan text-ai-cyan"
                    : "border-white/15 text-transparent"
                }`}
              >
                {isDone ? (
                  <FiCheck size={12} />
                ) : isActive ? (
                  <motion.span
                    className="w-2 h-2 rounded-full bg-ai-cyan"
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
