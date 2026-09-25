"use client";

/**
 * Wraps a displayed vitals/labs/ABG value with a small status badge
 * (Normal/Low/High/etc) and a hover/focus tooltip that shows the actual
 * value against the reference range it was judged against.
 *
 * If `status` is null (no reference exists for this field), renders the
 * plain value with no badge or tooltip — safe to use unconditionally.
 *
 *   <ValueWithStatus value={patient.vitals.hr} status={getVitalStatus("hr", patient.vitals.hr)} />
 *   <ValueWithStatus value={patient.abg.pH} status={getAbgStatus("ph", patient.abg.pH)} stack />
 */
export default function ValueWithStatus({ value, status, stack = false }) {
  if (!status) return <>{value}</>;

  return (
    <span
      tabIndex={0}
      className={`vwt-wrap ${stack ? "flex flex-col items-center gap-1" : "inline-flex items-center gap-1.5 flex-wrap"}`}
    >
      <span>{value}</span>
      <span
        className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border whitespace-nowrap ${status.className}`}
      >
        {status.label}
      </span>
      <span className="vwt-tooltip" role="tooltip">
        <span className="vwt-tooltip-title">{status.metric}</span>
        <span className="vwt-tooltip-row">
          <span>Reference</span>
          <span>{status.reference}</span>
        </span>
        <span className="vwt-tooltip-row vwt-tooltip-actual">
          <span>Actual</span>
          <span>{value}</span>
        </span>
      </span>
    </span>
  );
}
