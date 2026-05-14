export const PROTOTYPE_SESSION_TTL_HOURS = 12;
export const PROTOTYPE_SESSION_TTL_MS = PROTOTYPE_SESSION_TTL_HOURS * 60 * 60 * 1000;

export const CASE_HISTORY_METADATA_KEYS = [
  "caseId",
  "submittedAt",
  "workflowHeading",
  "topicTitle",
  "outcomeTitle",
  "endpointLabel",
  "queueCode",
  "status",
];

export function getPrototypeStorageTimestamp(record) {
  if (!record || typeof record !== "object") return 0;
  const value = record.submittedAt || record.savedAt || record.updatedAt;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function isPrototypeSessionRecordFresh(record, now = Date.now(), ttlMs = PROTOTYPE_SESSION_TTL_MS) {
  const timestamp = getPrototypeStorageTimestamp(record);
  return Boolean(timestamp && now - timestamp <= ttlMs);
}

export function createCaseHistoryEntry(submittedCase) {
  const entry = {};
  for (const key of CASE_HISTORY_METADATA_KEYS) {
    entry[key] = submittedCase?.[key] || "";
  }
  return entry;
}

export function sanitizeCaseHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .map(createCaseHistoryEntry)
    .filter((entry) => entry.caseId);
}
