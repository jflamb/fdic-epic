export const REGULATOR_HANDOFFS = {
  OCC: {
    agency: "Office of the Comptroller of the Currency (OCC)",
    url: "https://www.helpwithmybank.gov/file-a-complaint/index-file-a-complaint.html",
    action: "file a complaint or ask a question through HelpWithMyBank.gov",
  },
  FED: {
    agency: "Federal Reserve Consumer Help",
    url: "https://forms.federalreserveconsumerhelp.gov/secure/complaint/complaintType.html",
    action: "file a complaint or ask a question through Federal Reserve Consumer Help",
  },
  STATE: {
    agency: "Conference of State Bank Supervisors (CSBS)",
    url: "https://www.csbs.org/contact-your-state-bank-agency",
    action: "find the appropriate state banking agency",
  },
  CFPB: {
    agency: "Consumer Financial Protection Bureau (CFPB)",
    url: "https://www.consumerfinance.gov/complaint/",
    action: "submit a consumer financial product or service complaint",
  },
};

export function getRegulatorHandoffProfile(selectedBankDetails, hasSpecificBankConfig = true) {
  if (!hasSpecificBankConfig || !selectedBankDetails) {
    return null;
  }

  const regulatorCode = String(selectedBankDetails.regulator || "").trim().toUpperCase();
  if (!regulatorCode || regulatorCode === "FDIC") {
    return null;
  }

  const handoff = REGULATOR_HANDOFFS[regulatorCode];
  if (!handoff) {
    return {
      label: "Bank regulator handoff",
      queueCode: null,
      pattern: "external-handoff",
      sections: [],
      requiredFields: [],
      conditionalFields: {},
      url: "https://www.helpwithmybank.gov/who-regulates-my-bank/index-who-regulates-bank.html",
      description: `${selectedBankDetails.name} is not listed as FDIC-regulated in BankFind. Confirm the bank's primary regulator before continuing.`,
    };
  }

  return {
    label: handoff.agency,
    queueCode: null,
    pattern: "external-handoff",
    sections: [],
    requiredFields: [],
    conditionalFields: {},
    url: handoff.url,
    description: `${selectedBankDetails.name} is regulated by ${handoff.agency}, not the FDIC. To avoid sending your request to the wrong agency, ${handoff.action}.`,
  };
}

