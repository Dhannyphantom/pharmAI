// Shape for audit trail entries. The log itself lives as shared component
// state in the Documentation page (this demo has no backend/database), but
// every automatic-documentation action funnels through this one builder so
// every entry has a consistent shape — user, role, timestamp, action, the
// reference it applies to, and before/after values where relevant.
// Historical entries are never edited or removed, only appended to.

let counter = 0;

export function buildAuditEntry({ user = "You", role = "Pharmacist", action, refId, details, previousValue = null, newValue = null }) {
  counter += 1;
  return {
    id: `AUD-${1000 + counter}`,
    timestamp: new Date().toLocaleString(),
    user,
    role,
    action,
    refId,
    details,
    previousValue,
    newValue,
  };
}
