"use client";
import { motion } from "framer-motion";
import { FiXCircle, FiCheckCircle } from "react-icons/fi";
import NavBar from "@/components/NavBar";
import { PageHeader } from "@/components/ui";

const AI_ALONE = ["Hallucinations", "No empathy", "No accountability", "No clinical responsibility"];
const WITH_PHARMACIST = ["Safer decisions", "Better efficiency", "Better patient counselling", "Reduced medication errors", "Personalized care"];

export default function TakeawayPage() {
  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col items-center justify-center">
        <PageHeader eyebrow="Final Takeaway" title="Two Futures" subtitle="" />

        <div className="grid sm:grid-cols-2 gap-5 w-full mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6 border-danger/20"
          >
            <div className="text-[11px] uppercase tracking-widest text-danger font-semibold mb-4">AI Alone</div>
            <ul className="space-y-3">
              {AI_ALONE.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-2.5 text-slate-300 text-sm"
                >
                  <FiXCircle className="text-danger shrink-0" /> {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6 glow-mint border-mint/20"
          >
            <div className="text-[11px] uppercase tracking-widest text-mint font-semibold mb-4">Pharmacist + AI</div>
            <ul className="space-y-3">
              {WITH_PHARMACIST.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2.5 text-slate-200 text-sm"
                >
                  <FiCheckCircle className="text-mint shrink-0" /> {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gradient max-w-2xl leading-snug"
        >
          The Future of Pharmacy is Human Intelligence + Artificial Intelligence.
        </motion.p>
      </main>
    </>
  );
}
