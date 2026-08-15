export default function Disclaimer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-sm py-3 px-4 text-center">
      <p className="text-[11px] leading-snug text-slate-400 max-w-4xl mx-auto">
        <span className="font-semibold text-slate-300">Educational Demonstration Only.</span>{" "}
        This application is NOT intended for real clinical decision making. All recommendations
        require pharmacist review and professional clinical judgement.
      </p>
    </footer>
  );
}
