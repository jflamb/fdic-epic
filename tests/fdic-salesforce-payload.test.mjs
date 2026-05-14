import test from "node:test";
import assert from "node:assert/strict";

import { buildSalesforcePayload } from "../components/fdic-salesforce-payload.mjs";

const baseDraft = {
  intent: "report",
  workflowHeading: "Report a problem or concern",
  topic: "bank_issue",
  topicTitle: "A bank or financial institution",
  details: "The bank closed my account without clear notice.",
  outcome: "resolution",
  outcomeTitle: "Help resolve an issue",
  firstName: "Alex",
  lastName: "Taylor",
  email: "alex@example.com",
  emailConfirm: "alex@example.com",
  businessPhone: "919-555-0100",
  mailingStreet: "100 Main Street",
  mailingCity: "Cary",
  mailingState: "North Carolina",
  mailingPostal: "27511",
  mailingCountry: "United States",
  desiredResolution: "Explain the account closure and correct any mistake.",
  specificBankSearch: "Ergo Bank",
  specificBankDetails: {
    name: "Ergo Bank",
    cert: "35433",
    city: "Markesan",
    state: "WI",
    active: true,
    website: "www.ergobank.com",
    regulator: "FDIC",
  },
  specificBankAcknowledged: true,
  authorization: true,
  endpointProfile: "fdiccaform",
  endpointLabel: "Bank and Consumer Response Team",
  queueCode: "Q-BCR",
  pattern: "intake",
  savedAt: "2026-04-30T12:00:00.000Z",
};

test("buildSalesforcePayload maps routing, requester, request, and selected institution data", () => {
  const payload = buildSalesforcePayload(baseDraft, {
    caseId: "FDIC-20260430-1234",
    submittedAt: "2026-04-30T12:05:00.000Z",
  });

  assert.equal(payload.targetSystem, "Salesforce application layer");
  assert.equal(payload.source.submittedAt, "2026-04-30T12:05:00.000Z");
  assert.equal(payload.routing.endpointProfile, "fdiccaform");
  assert.equal(payload.routing.queueCode, "Q-BCR");
  assert.equal(payload.requester.email, "alex@example.com");
  assert.equal(payload.request.narrative, "The bank closed my account without clear notice.");
  assert.equal(payload.request.desiredResolution, "Explain the account closure and correct any mistake.");
  assert.equal(payload.institution.selectedInstitution.name, "Ergo Bank");
  assert.equal(payload.institution.selectedInstitution.certificateNumber, "35433");
  assert.equal(payload.institution.selectedInstitution.regulator, "FDIC");
  assert.equal(payload.institution.selectedInstitutionAcknowledged, true);
  assert.equal(payload.institution.specificBankSearchText, "Ergo Bank");
  assert.equal(payload.consent.authorizationConfirmed, true);
  assert.equal(payload.prototype.localCaseId, "FDIC-20260430-1234");
});

test("buildSalesforcePayload preserves failed-bank search and avoids direct database framing", () => {
  const payload = buildSalesforcePayload({
    ...baseDraft,
    specificBankDetails: null,
    specificBankAcknowledged: false,
    failedBankSearch: "First Republic Bank",
    endpointProfile: "requestformDepositor",
    endpointLabel: "Failed Bank Depositor Services Team",
    queueCode: "Q-DEP",
    sub: "Change of Address",
    subLabel: "Change my address with the FDIC",
  });

  assert.equal(payload.routing.subcategory, "Change of Address");
  assert.equal(payload.routing.subcategoryLabel, "Change my address with the FDIC");
  assert.equal(payload.institution.selectedInstitution, null);
  assert.equal(payload.institution.selectedInstitutionAcknowledged, false);
  assert.equal(payload.institution.failedBankSearchText, "First Republic Bank");
  assert.equal(payload.processing.directDatabaseWrite, false);
  assert.match(payload.processing.expectedIntegration, /Salesforce APIs/);
  assert.match(payload.processing.expectedIntegration, /validation rules/);
});

test("buildSalesforcePayload keeps free-text bank search separate from a selected institution", () => {
  const payload = buildSalesforcePayload({
    ...baseDraft,
    specificBankSearch: "Ergo",
    specificBankDetails: null,
    specificBankAcknowledged: true,
  });

  assert.equal(payload.institution.selectedInstitution, null);
  assert.equal(payload.institution.selectedInstitutionAcknowledged, false);
  assert.equal(payload.institution.specificBankSearchText, "Ergo");
});
