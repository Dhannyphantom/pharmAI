export default function Disclaimer() {
  return (
    <footer className="relative z-10 border-t border-white/8 bg-[var(--panel)] py-3 px-4 text-center">
      <p className="text-[11px] leading-snug text-slate-500 max-w-4xl mx-auto">
        <span className="font-medium text-slate-400">Educational demonstration only.</span>{" "}
        This application is not intended for real clinical decision making. All recommendations
        require pharmacist review and professional clinical judgement.
      </p>
    </footer>
  );
}
