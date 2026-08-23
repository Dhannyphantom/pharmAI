// Projects demand forward instead of just displaying trailing history.
// `item.forecast` is treated as the last 6 months of ACTUAL consumption
// (ending last month); this derives a trend from it and projects the NEXT
// 6 months from today, then simulates stock depletion against that
// projection to predict a stockout month.
//
// Returns real calendar month labels (e.g. "Nov 2026") anchored to the
// current date, rather than generic "Month 1..6" placeholders.
//
// Pass `autoReorder: true` to simulate AI-driven automatic reordering: once
// projected stock falls to the reorder point, a replenishment order is
// placed and arrives after the item's lead time, topping stock back up to
// its max level. This is what "Enable AI Reordering" toggles on the
// Inventory page — with it off you see the raw, unmanaged depletion curve;
// with it on you see what happens once the system reorders on your behalf.

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(offsetFromNow, base = new Date()) {
  const d = new Date(base.getFullYear(), base.getMonth() + offsetFromNow, 1);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function computeForecast(item, opts = {}) {
  const history = item.forecast || [];
  const now = opts.now || new Date();
  const autoReorder = !!opts.autoReorder;

  // Average month-over-month growth rate across the trailing history.
  let trend = 0;
  if (history.length >= 2) {
    const changes = [];
    for (let i = 1; i < history.length; i++) {
      if (history[i - 1] > 0) changes.push((history[i] - history[i - 1]) / history[i - 1]);
    }
    if (changes.length) trend = changes.reduce((a, b) => a + b, 0) / changes.length;
  }
  trend = Math.max(-0.2, Math.min(0.2, trend)); // clamp to a sane range for a 6-month projection

  const base = item.amc || (history.length ? history[history.length - 1] : 0);
  // Linear trend adjustment scaled across the 6-month window — avoids the
  // runaway growth/collapse that compounding a noisy 6-point trend produces.
  const predicted = [];
  const predictedMonthLabels = [];
  for (let i = 0; i < 6; i++) {
    const monthTrend = trend * ((i + 1) / 6);
    predicted.push(Math.max(0, Math.round(base * (1 + monthTrend))));
    predictedMonthLabels.push(monthLabel(i + 1, now)); // next 6 months: +1..+6
  }

  // History covers the 6 months ending LAST month (offsets -6..-1); the
  // bridge point connecting the two chart segments represents THIS month (0).
  const historyMonthLabels = history.map((_, i) => monthLabel(i - history.length, now));
  const currentMonthLabel = monthLabel(0, now);

  // Simulate stock depletion against the projected demand.
  let runningStock = item.stock;
  let stockoutMonth = null; // 1-6, offset from now
  let reorderPlacedMonth = null;
  let reorderArrivesMonth = null;
  let reorderQty = null;
  const leadMonths = Math.max(1, Math.round((item.leadTimeDays || 14) / 30));
  const projectedStock = [];

  for (let i = 0; i < 6; i++) {
    // Receive a pending order that lands this month.
    if (autoReorder && reorderArrivesMonth === i && reorderQty) {
      runningStock += reorderQty;
      reorderQty = null;
    }
    // Trigger a fresh order once stock has hit the reorder point, if none pending.
    if (autoReorder && reorderPlacedMonth === null && runningStock <= (item.reorderPoint || 0)) {
      reorderPlacedMonth = i;
      reorderArrivesMonth = i + leadMonths;
      reorderQty = Math.max((item.maxStock || (item.reorderPoint || 0) * 2) - runningStock, 0);
    }

    runningStock -= predicted[i];
    projectedStock.push(Math.max(0, Math.round(runningStock)));
    if (runningStock <= 0 && stockoutMonth === null) stockoutMonth = i + 1;
    if (runningStock < 0) runningStock = 0; // stock can't actually go negative in reality
  }

  return {
    history,
    historyMonthLabels,
    currentMonthLabel,
    predicted,
    predictedMonthLabels,
    projectedStock,
    trend,
    stockoutMonth,
    stockoutMonthLabel: stockoutMonth ? monthLabel(stockoutMonth, now) : null,
    autoReorderApplied: autoReorder,
    reorderPlacedMonthLabel: reorderPlacedMonth !== null ? monthLabel(reorderPlacedMonth, now) : null,
    reorderArrivesMonthLabel: reorderArrivesMonth !== null ? monthLabel(reorderArrivesMonth, now) : null,
  };
}
