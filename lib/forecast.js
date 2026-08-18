// Projects demand forward instead of just displaying trailing history.
// `item.forecast` is treated as the last 6 months of ACTUAL consumption; this
// derives a trend from it and projects the NEXT 6 months, then simulates
// stock depletion against that projection to predict a stockout month.

export function computeForecast(item) {
  const history = item.forecast || [];

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
  for (let i = 0; i < 6; i++) {
    const monthTrend = trend * ((i + 1) / 6);
    predicted.push(Math.max(0, Math.round(base * (1 + monthTrend))));
  }

  // Simulate stock depletion against the projected demand (no restocking assumed).
  let runningStock = item.stock;
  let stockoutMonth = null;
  const projectedStock = [];
  for (let i = 0; i < 6; i++) {
    runningStock -= predicted[i];
    projectedStock.push(Math.max(0, Math.round(runningStock)));
    if (runningStock <= 0 && stockoutMonth === null) stockoutMonth = i + 1;
  }

  return { history, predicted, projectedStock, trend, stockoutMonth };
}
