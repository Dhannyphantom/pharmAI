// Lightweight, explainable reconciliation checks over the Dispensing and
// Issuance/Receiving logs. These are heuristics for a demo, not a
// certified reconciliation engine — every flag is meant for human review;
// nothing here ever modifies a record.

export function runReconciliationChecks({ transactions, movements, patients }) {
  const flags = [];

  // 1. Possible duplicate dispensing — same patient, same drug, same
  // quantity, same date, logged more than once.
  const seen = new Map();
  transactions.forEach((txn) => {
    txn.items.forEach((it) => {
      const key = `${txn.pid}|${it.drug}|${it.quantity}|${txn.date}`;
      seen.set(key, (seen.get(key) || []).concat(txn.id));
    });
  });
  seen.forEach((ids, key) => {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length > 1) {
      const [pid, drug, qty, date] = key.split("|");
      flags.push({
        id: `DUP-${uniqueIds.join("-")}`,
        severity: "warn",
        type: "Possible Duplicate Dispensing",
        message: `${drug} ×${qty} was logged more than once for ${pid} on ${date} (${uniqueIds.join(", ")}).`,
        refIds: uniqueIds,
      });
    }
  });

  // 2. Unpaid/Partial dispensing with no matching outstanding billing
  // record for that patient — a sign the billing link may be missing.
  transactions.filter((t) => t.paymentStatus !== "Paid").forEach((txn) => {
    const patient = patients.find((p) => p.pid === txn.pid);
    if (!patient) return;
    const hasOutstanding = patient.billingHistory?.some((b) => b.status !== "Paid");
    if (!hasOutstanding) {
      flags.push({
        id: `BILL-${txn.id}`,
        severity: "danger",
        type: "Missing Billing Link",
        message: `${txn.id} is marked ${txn.paymentStatus} for ${txn.patient}, but no outstanding billing record was found on their account.`,
        refIds: [txn.id],
      });
    }
  });

  // 3. Issuance quantity well outside a typical single-issuance range —
  // reuses the same 2x/0.25x-style heuristic as the Inventory Requisition
  // Analyzer, with an illustrative baseline where no per-item typical exists.
  const TYPICAL_ISSUANCE_QTY = 40;
  movements.filter((m) => m.type === "Issuance").forEach((m) => {
    const ratio = m.quantity / TYPICAL_ISSUANCE_QTY;
    if (ratio >= 3) {
      flags.push({
        id: `ISS-HIGH-${m.id}`,
        severity: "warn",
        type: "Unusual Issuance Quantity",
        message: `${m.id}: ${m.quantity} units of ${m.item} issued to ${m.destination} is well above a typical single issuance — confirm this was intentional.`,
        refIds: [m.id],
      });
    } else if (ratio <= 0.25) {
      flags.push({
        id: `ISS-LOW-${m.id}`,
        severity: "warn",
        type: "Unusually Low Issuance Quantity",
        message: `${m.id}: only ${m.quantity} units of ${m.item} issued to ${m.destination} — confirm this wasn't a partial/incomplete entry.`,
        refIds: [m.id],
      });
    }
  });

  // 4. Receiving with an expiry date that has already passed.
  const now = new Date();
  movements.filter((m) => m.type === "Receiving" && m.expiry).forEach((m) => {
    const [mm, yyyy] = m.expiry.split("/");
    if (mm && yyyy) {
      const expiryDate = new Date(parseInt(yyyy, 10), parseInt(mm, 10), 0);
      if (expiryDate < now) {
        flags.push({
          id: `EXP-${m.id}`,
          severity: "danger",
          type: "Expired Stock Received",
          message: `${m.id}: ${m.item} (batch ${m.batch}) was received with an expiry of ${m.expiry}, which has already passed.`,
          refIds: [m.id],
        });
      }
    }
  });

  return flags;
}
