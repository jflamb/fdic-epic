const SCHEMA_VERSION = "fdic-epic-salesforce-payload-v1";

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value) {
  const text = cleanString(value);
  return text || null;
}

function cleanBankDetails(bank) {
  if (!bank || typeof bank !== "object") return null;

  return {
    name: optionalString(bank.name),
    certificateNumber: optionalString(bank.cert),
    regulator: optionalString(bank.regulator),
    website: optionalString(bank.website),
    mainOffice: {
      city: optionalString(bank.city),
      state: optionalString(bank.state),
    },
    active: typeof bank.active === "boolean" ? bank.active : null,
  };
}

function cleanAppraisalDetails(draft) {
  if (!cleanString(draft.appraisalRole) && !cleanString(draft.propertyStreet) && !cleanString(draft.propertyCity)) {
    return null;
  }

  return {
    role: optionalString(draft.appraisalRole),
    property: {
      street: optionalString(draft.propertyStreet),
      city: optionalString(draft.propertyCity),
    },
  };
}

export function buildSalesforcePayload(draft, options = {}) {
  const submittedAt = optionalString(options.submittedAt || draft?.submittedAt);
  const caseId = optionalString(options.caseId || draft?.caseId);
  const specificBank = cleanBankDetails(draft?.specificBankDetails);
  const specificBankSearch = optionalString(draft?.specificBankSearch);
  const failedBankSearch = optionalString(draft?.failedBankSearch);

  return {
    schemaVersion: SCHEMA_VERSION,
    targetSystem: "Salesforce application layer",
    source: {
      application: "FDIC Information and Support Center prototype",
      channel: "web",
      environment: "static prototype",
      submittedAt,
    },
    routing: {
      endpointProfile: optionalString(draft?.endpointProfile),
      endpointLabel: optionalString(draft?.endpointLabel),
      queueCode: optionalString(draft?.queueCode),
      pattern: optionalString(draft?.pattern) || "intake",
      intent: optionalString(draft?.intent),
      intentLabel: optionalString(draft?.workflowHeading),
      topic: optionalString(draft?.topic),
      topicLabel: optionalString(draft?.topicTitle),
      subcategory: optionalString(draft?.sub),
      subcategoryLabel: optionalString(draft?.subLabel),
    },
    requester: {
      firstName: optionalString(draft?.firstName),
      lastName: optionalString(draft?.lastName),
      email: optionalString(draft?.email),
      businessPhone: optionalString(draft?.businessPhone),
      mailingAddress: {
        street: optionalString(draft?.mailingStreet),
        city: optionalString(draft?.mailingCity),
        state: optionalString(draft?.mailingState),
        postalCode: optionalString(draft?.mailingPostal),
        country: optionalString(draft?.mailingCountry),
      },
    },
    request: {
      narrative: optionalString(draft?.details),
      desiredOutcome: optionalString(draft?.outcome),
      desiredOutcomeLabel: optionalString(draft?.outcomeTitle),
      desiredResolution: optionalString(draft?.desiredResolution),
      documentRequestType: optionalString(draft?.documentRequestType),
      appraisal: cleanAppraisalDetails(draft || {}),
      emailSendBody: optionalString(draft?.emailSendBody),
    },
    institution: {
      selectedInstitution: specificBank,
      selectedInstitutionAcknowledged: Boolean(specificBank),
      specificBankSearchText: specificBankSearch,
      failedBankSearchText: failedBankSearch,
    },
    consent: {
      authorizationConfirmed: Boolean(draft?.authorization),
      privacyNoticePresented: true,
    },
    processing: {
      directDatabaseWrite: false,
      expectedIntegration: "Submit this payload through Salesforce APIs or platform services so Salesforce can enforce auth, validation rules, automation, duplicate checks, and data integrity before storage.",
    },
    prototype: {
      localCaseId: caseId,
      savedAt: optionalString(draft?.savedAt),
    },
  };
}
