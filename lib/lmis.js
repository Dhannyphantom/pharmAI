// Shared LMIS-style stock analysis. Works for any stock record shaped like
// { stock, amc, reorderPoint (ROL), minStock, maxStock, leadTimeDays }.

export function computeLmis(record) {
  const { stock, amc, reorderPoint, minStock, maxStock, leadTimeDays } = record;
  const mos = amc > 0 ? Math.round((stock / amc) * 10) / 10 : null;

  let status, statusColor, recommendation;

  if (stock <= 0) {
    status = "Stockout";
    statusColor = "danger";
    recommendation = `Emergency requisition needed — 0 units on hand. Order to max stock level (${maxStock ?? "—"} units); expect ~${leadTimeDays ?? "?"} day lead time.`;
  } else if (reorderPoint != null && stock < reorderPoint) {
    status = "Below Reorder Level";
    statusColor = "warn";
    const orderQty = maxStock != null ? Math.max(maxStock - stock, 0) : null;
    recommendation = orderQty != null
      ? `Order ${orderQty} units to reach max stock level before it runs out (~${mos ?? "?"} months of stock remain).`
      : `Stock is below the reorder level — raise a requisition.`;
  } else if (maxStock != null && stock > maxStock) {
    status = "Overstock";
    statusColor = "ai-violet";
    recommendation = `Stock exceeds the max level (${maxStock} units) — hold new orders and monitor for expiry risk.`;
  } else if (minStock != null && stock < minStock) {
    status = "Below Safety Stock";
    statusColor = "danger";
    recommendation = `Stock is under the safety-stock threshold (${minStock} units) — prioritize this requisition.`;
  } else {
    status = "Adequate";
    statusColor = "mint";
    recommendation = `Stock within normal range (~${mos ?? "?"} months of stock) — no action needed.`;
  }

  return { mos, status, statusColor, recommendation };
}

export const LMIS_STATUS_STYLE = {
  Stockout: "text-danger bg-danger/15 border-danger/40",
  "Below Reorder Level": "text-warn bg-warn/10 border-warn/30",
  "Below Safety Stock": "text-danger bg-danger/10 border-danger/30",
  Overstock: "text-ai-violet bg-ai-violet/10 border-ai-violet/30",
  Adequate: "text-mint bg-mint/10 border-mint/30",
};
