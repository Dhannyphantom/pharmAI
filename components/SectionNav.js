"use client";
import { useEffect, useState } from "react";

/**
 * Scroll-spy "Quick Jump" navigation for long single-page workspaces.
 * Renders as a sticky vertical sidebar on desktop (lg+) and a sticky
 * horizontal scroll strip on mobile. Both read from the same `sections`
 * list: [{ id, label, icon, onActivate? }]. `onActivate`, if provided, runs
 * before scrolling (e.g. to expand a collapsed panel so the target exists).
 *
 * Target elements must have a matching `id` and a `scroll-mt-*` class so
 * they land below the sticky NavBar when scrolled into view.
 */
export default function SectionNav({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveId(top.target.id);
      },
      { rootMargin: "-110px 0px -55% 0px", threshold: [0, 1] }
    );

    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.id).join("|")]);

  function jump(s) {
    setActiveId(s.id);
    if (s.onActivate) {
      s.onActivate();
      // Give the panel a moment to expand/render before scrolling to it.
      setTimeout(() => {
        document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } else {
      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      {/* Desktop — sticky vertical sidebar, occupies the left grid column */}
      <nav className="hidden lg:block sticky top-24 self-start">
        <div className="glass rounded-2xl p-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 pt-1.5 pb-2">
            Quick Jump
          </div>
          <div className="flex flex-col gap-0.5">
            {sections.map((s) => {
              const Icon = s.icon;
              const active = activeId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => jump(s)}
                  className={`flex items-center gap-2.5 text-left text-[12.5px] font-medium px-3 py-2 rounded-xl border transition-colors ${
                    active
                      ? "bg-ai-cyan/10 text-ai-cyan border-ai-cyan/25"
                      : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Icon size={13} className="shrink-0" />
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile — sticky horizontal quick-jump strip, sits just under NavBar */}
      <div className="lg:hidden sticky top-14 z-20 -mx-6 px-6 py-2.5 mb-6 glass-strong border-b border-white/10 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {sections.map((s) => {
            const Icon = s.icon;
            const active = activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => jump(s)}
                className={`shrink-0 flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "border-ai-cyan/50 text-ai-cyan bg-ai-cyan/10"
                    : "border-white/12 text-slate-400 hover:text-slate-200 hover:border-white/25"
                }`}
              >
                <Icon size={11} /> {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
