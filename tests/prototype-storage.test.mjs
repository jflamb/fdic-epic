import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  CASE_HISTORY_METADATA_KEYS,
  PROTOTYPE_SESSION_TTL_HOURS,
  createCaseHistoryEntry,
  isPrototypeSessionRecordFresh,
  sanitizeCaseHistory,
} from "../components/prototype-storage.mjs";

const piiHeavySubmittedCase = {
  caseId: "FDIC-20260514-1234",
  submittedAt: "2026-05-14T15:30:00.000Z",
  workflowHeading: "Report a problem or concern",
  topicTitle: "A bank or financial institution",
  outcomeTitle: "Help resolve an issue",
  endpointLabel: "Bank and Consumer Response Team",
  queueCode: "Q-BCR",
  status: "Submitted",
  details: "The bank closed my account without clear notice.",
  firstName: "Alex",
  lastName: "Taylor",
  email: "alex@example.com",
  businessPhone: "919-555-0100",
  mailingStreet: "100 Main Street",
  mailingCity: "Cary",
  mailingState: "North Carolina",
  mailingPostal: "27511",
  specificBankSearch: "Example Bank",
  specificBankDetails: { name: "Example Bank", cert: "12345" },
  salesforcePayload: { request: { narrative: "Do not put this in localStorage history." } },
};

test("createCaseHistoryEntry stores only case-history metadata", () => {
  const entry = createCaseHistoryEntry(piiHeavySubmittedCase);

  assert.deepEqual(Object.keys(entry), CASE_HISTORY_METADATA_KEYS);
  assert.equal(entry.caseId, "FDIC-20260514-1234");
  assert.equal(entry.topicTitle, "A bank or financial institution");

  const serialized = JSON.stringify(entry);
  assert.doesNotMatch(serialized, /alex@example\.com/i);
  assert.doesNotMatch(serialized, /100 Main Street/i);
  assert.doesNotMatch(serialized, /closed my account/i);
  assert.doesNotMatch(serialized, /Example Bank/i);
  assert.doesNotMatch(serialized, /salesforcePayload/i);
});

test("sanitizeCaseHistory strips unexpected PII fields from existing browser history", () => {
  const [entry] = sanitizeCaseHistory([piiHeavySubmittedCase]);

  assert.deepEqual(Object.keys(entry), CASE_HISTORY_METADATA_KEYS);
  assert.equal(entry.caseId, "FDIC-20260514-1234");
  assert.equal(entry.endpointLabel, "Bank and Consumer Response Team");
  assert.equal(entry.email, undefined);
  assert.equal(entry.details, undefined);
  assert.equal(entry.specificBankDetails, undefined);
});

test("prototype session records expire after the storage TTL", () => {
  const now = Date.parse("2026-05-14T16:00:00.000Z");
  const fresh = { savedAt: new Date(now - (PROTOTYPE_SESSION_TTL_HOURS - 1) * 60 * 60 * 1000).toISOString() };
  const stale = { savedAt: new Date(now - (PROTOTYPE_SESSION_TTL_HOURS + 1) * 60 * 60 * 1000).toISOString() };
  const newlySubmittedFromOldDraft = {
    savedAt: new Date(now - (PROTOTYPE_SESSION_TTL_HOURS + 1) * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(now).toISOString(),
  };

  assert.equal(isPrototypeSessionRecordFresh(fresh, now), true);
  assert.equal(isPrototypeSessionRecordFresh(stale, now), false);
  assert.equal(isPrototypeSessionRecordFresh(newlySubmittedFromOldDraft, now), true);
  assert.equal(isPrototypeSessionRecordFresh({}, now), false);
});

test("support-review writes case history through the metadata whitelist", async () => {
  const source = await readFile(new URL("../support-review.js", import.meta.url), "utf8");

  assert.match(source, /history\.push\(createCaseHistoryEntry\(submittedCase\)\)/);
  assert.doesNotMatch(source, /localStorage\.setItem\(\s*CASE_HISTORY_STORAGE_KEY,\s*JSON\.stringify\(submittedCase\)/);
});

test("draft and submitted detail keys stay in sessionStorage only", async () => {
  const sources = await Promise.all([
    readFile(new URL("../support-intake.js", import.meta.url), "utf8"),
    readFile(new URL("../support-review.js", import.meta.url), "utf8"),
    readFile(new URL("../support-confirmation.js", import.meta.url), "utf8"),
  ]);
  const combined = sources.join("\n");

  for (const key of ["DRAFT_STORAGE_KEY", "LIVE_DRAFT_KEY", "SUBMITTED_STORAGE_KEY"]) {
    assert.match(combined, new RegExp(`sessionStorage\\.(?:getItem|setItem|removeItem)\\(${key}\\)`));
    assert.doesNotMatch(combined, new RegExp(`localStorage\\.(?:getItem|setItem|removeItem)\\(${key}\\)`));
  }
});
