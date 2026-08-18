// AI-style payment risk scoring for the Attend to Patient billing panel.
// Turns a flat billing list into an actionable signal: how likely is this
// account to end up with unpaid pharmacy bills, and what should be done now.

export function computePaymentRisk(billingHistory) {
  const total = billingHistory.length;
  if (total === 0) {
    return { score: 0, level: "Low", outstandingTotal: 0, overdueCount: 0, pendingCount: 0, recommendation: "No billing history on file.", factors: [] };
  }

  const overdue = billingHistory.filter((b) => b.status === "Overdue");
  const pending = billingHistory.filter((b) => b.status === "Pending");
  const totalBilled = billingHistory.reduce((s, b) => s + b.amount, 0);
  const outstandingTotal = [...overdue, ...pending].reduce((s, b) => s + b.amount, 0);

  const overdueRatio = overdue.length / total;
  const pendingRatio = pending.length / total;
  const outstandingRatio = totalBilled > 0 ? outstandingTotal / totalBilled : 0;

  // Overdue bills weigh most heavily — they're the clearest signal of
  // actual non-payment, not just processing lag.
  const score = Math.min(100, Math.round(overdueRatio * 100 + pendingRatio * 40 + outstandingRatio * 20));
  const level = score >= 55 ? "High" : score >= 25 ? "Medium" : "Low";

  const factors = [];
  if (overdue.length > 0) {
    factors.push(`${overdue.length} overdue bill${overdue.length > 1 ? "s" : ""} totaling ₦${overdue.reduce((s, b) => s + b.amount, 0).toLocaleString()}`);
  }
  if (pending.length > 0) {
    factors.push(`${pending.length} bill${pending.length > 1 ? "s" : ""} still pending payment`);
  }
  if (outstandingRatio > 0.5 && totalBilled > 0) {
    factors.push("Over half of this patient's total billed amount remains unpaid");
  }
  if (factors.length === 0) factors.push("All billing items are paid — healthy payment history.");

  let recommendation;
  if (level === "High") {
    recommendation = "High payment risk — request part-payment or confirm NHIS pre-authorization before dispensing further non-urgent items, and flag the account for billing follow-up.";
  } else if (level === "Medium") {
    recommendation = "Moderate payment risk — send a payment reminder for pending items and confirm coverage before the next dispense.";
  } else {
    recommendation = "Low payment risk — no billing action needed at this time.";
  }

  return { score, level, outstandingTotal, overdueCount: overdue.length, pendingCount: pending.length, recommendation, factors };
}

export const PAYMENT_RISK_STYLE = {
  High: "text-danger bg-danger/10 border-danger/30",
  Medium: "text-warn bg-warn/10 border-warn/30",
  Low: "text-mint bg-mint/10 border-mint/30",
};
