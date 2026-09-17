/**
 * The AI orb — one glossy, softly-rotating sphere standing in for
 * "the assistant is here / thinking." Pure CSS, no canvas, no particle
 * system. Used at three sizes: hero (home page), inline (loading states),
 * small (sidebar mark).
 */
export default function Orb({ size = 120, active = true, className = "" }) {
  return (
    <div
      className={`orb-wrap relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div
        className="orb-core absolute inset-0 rounded-full"
        style={{
          animationPlayState: active ? "running" : "paused",
          boxShadow: `0 0 ${Math.round(size * 0.5)}px -${Math.round(size * 0.12)}px rgba(59,111,224,0.45)`,
        }}
      />
      {/* Glass highlight */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "10%",
          background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), transparent 55%)",
          mixBlendMode: "overlay",
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ inset: 0, boxShadow: "inset 0 0 18px rgba(0,0,0,0.35)" }}
      />
    </div>
  );
}
