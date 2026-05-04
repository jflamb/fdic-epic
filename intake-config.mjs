// Intake-flow configuration: workflow definitions, step options, and field
// presets. Pure data — no DOM or runtime dependencies. Extracted from
// support-intake.js so the orchestration layer can stay focused on state,
// validation, and event wiring.

export const OUTCOME_OPTIONS = [
  { value: "info", title: "Information or clarification" },
  { value: "review", title: "Review a concern or complaint" },
  { value: "resolution", title: "Help resolve an issue" },
  { value: "other", title: "Other or not sure" },
];

export const US_STATES_AND_TERRITORIES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  "American Samoa", "Guam", "Northern Mariana Islands", "U.S. Virgin Islands",
];

export const WORKFLOWS = {
  report: {
    heading: "Report a problem or concern",
    subcopy: "Use this when you believe a bank or the FDIC handled something incorrectly.",
    topicLegend: "What is your concern related to?",
    topics: [
      {
        value: "bank_issue",
        title: "A bank or financial institution",
        detail: "For service issues, unfair treatment, or potential policy violations.",
        endpointKey: "fdiccaform",
        includeDesiredResolution: true,
      },
      {
        value: "small_business",
        title: "A small-business banking concern",
        detail: "For issues tied to small-business banking products or services.",
        endpointKey: "fdicbaform",
        includeDesiredResolution: true,
      },
      {
        value: "fdic_issue",
        title: "The FDIC",
        detail: "For concerns about FDIC actions, communication, or process.",
        endpointKey: "fdiccommentform",
        includeDesiredResolution: true,
      },
      {
        value: "insured_status",
        title: "Whether an entity or product is FDIC-insured",
        detail: "Concerns about insured status claims or advertising language.",
        endpointKey: "fdicdimcomplaintform",
        includeDesiredResolution: true,
      },
      {
        value: "appraisal",
        title: "An appraisal-related issue",
        detail: "For appraisal concerns tied to a bank or real estate transaction.",
        endpointKey: "fidciaform",
        includeDesiredResolution: true,
      },
    ],
    detailsLegend: "Briefly describe the problem",
  },
  ask: {
    heading: "Ask a question or get guidance",
    subcopy: "Use this when you need information or are not sure which process applies.",
    topicLegend: "What do you need help with?",
    topics: [
      {
        value: "deposit_question",
        title: "Deposit insurance coverage",
        detail: "Coverage rules, account ownership categories, and limits.",
        endpointKey: "fdicdiform",
      },
      {
        value: "general_question",
        title: "General regulatory question",
        detail: "A broad question about FDIC-supervised banking topics.",
        endpointKey: "fdiccaform",
      },
      {
        value: "process_help",
        title: "Not sure which option applies",
        detail: "Guidance when your request does not fit a clear category.",
        endpointKey: "fdiccaform",
        includeOutcome: true,
      },
      {
        value: "general_fdic_info",
        title: "Find general FDIC information online",
        detail: "Hours, deposit insurance basics, FAQs, and other resources on FDIC.gov.",
        endpointKey: "fdicGeneralInfo",
      },
    ],
    detailsLegend: "What question do you need answered?",
  },
  dir: {
    heading: "Request FDIC Bank Data and Research information",
    subcopy: "Use this for requests such as QBP, Call Reports, and industry analysis.",
    topicLegend: "What data or research do you need?",
    topics: [
      {
        value: "qbp_analysis",
        title: "Quarterly Banking Profile (QBP) or industry analysis",
        detail: "Questions on QBP trends, tables, and related analysis.",
        endpointKey: "fdicdirform",
      },
      {
        value: "call_report_data",
        title: "Call Report data",
        detail: "Requests involving Call Report definitions, series, or extracts.",
        endpointKey: "fdicdirform",
      },
      {
        value: "bank_history_records",
        title: "Bank history, BankFind, or failed-bank records",
        detail: "Historical institution data, location history, and failed-bank information.",
        endpointKey: "fdicdirform",
      },
      {
        value: "ffiec_data",
        title: "Central Data Repository, CALL Reports, or UBPR",
        detail: "These are managed by the FFIEC, not the FDIC.",
        endpointKey: "helpdeskform",
      },
    ],
    detailsLegend: "Describe the data or research you need",
  },
  failed: {
    heading: "Get help with a failed bank",
    subcopy: "Use this when your issue involves a closed or failed institution.",
    topicLegend: "Which failed-bank topic is closest to your request?",
    topics: [
      {
        value: "depositor_claim",
        title: "Depositor claims and account records",
        detail: "Address changes, uninsured deposit questions, dividend status, and related account servicing.",
        endpointKey: "requestformDepositor",
      },
      {
        value: "lien_release",
        title: "Lien release or collateral documentation",
        detail: "Lien release, assignment, allonge, or related loan records.",
        endpointKey: "fdicLienRelease",
      },
      {
        value: "records_research",
        title: "Failed-bank records or employment verification",
        detail: "Statements, checks, loan documents, tax history, or prior-employment verification.",
        endpointKey: "requestform-RecordsResearch",
      },
      {
        value: "asset_management",
        title: "Asset management or FDIC real estate",
        detail: "FDIC real estate purchases or questions about a retained loan.",
        endpointKey: "requestform-AssetManagement",
      },
      {
        value: "power_of_attorney",
        title: "Limited power of attorney or renewal",
        detail: "Requests for a limited power of attorney tied to a failed bank.",
        endpointKey: "powerofattorneyform",
      },
      {
        value: "records_custody",
        title: "Permission for custody of failed-bank records",
        detail: "Requests about handling or storing failed-bank records.",
        endpointKey: "recordsdestructionform",
      },
      {
        value: "tax_documents",
        title: "Request a tax form (1098, 1099, or W2)",
        detail: "Email request for tax documents from a failed bank.",
        endpointKey: "factsemailsend-taxUnit",
      },
      {
        value: "receiver_letter",
        title: "Request an Appointment of Receiver letter",
        detail: "Email request for a letter certifying FDIC receivership.",
        endpointKey: "factsemailsend-Receivership",
      },
      {
        value: "merger_certification",
        title: "Request certification of a bank merger or name change",
        detail: "Email request for merger or name-change certification.",
        endpointKey: "factsemailsend-bankMerger",
      },
      {
        value: "purchase_agreement",
        title: "Find a Purchase & Assumption Agreement",
        detail: "View the FDIC Failed Bank List to find P&A agreements.",
        endpointKey: "paAgreement",
      },
    ],
    detailsLegend: "Describe what you need from the failed-bank process",
  },
};

export const FAILED_BANK_BRANCH_CONFIG = {
  depositor_claim: {
    legend: "What do you need help with in the depositor claims process?",
    help: "Choose the request that best matches your deposit-related issue.",
    options: [
      {
        value: "Change of Address",
        title: "Change my address with the FDIC",
        detail: "Update the mailing address on your failed-bank claim.",
      },
      {
        value: "Name Change",
        title: "Change the name on my claim with the FDIC",
        detail: "Request a name correction or update on a claim.",
      },
      {
        value: "IRA Transfer",
        title: "Process an IRA transfer from a failed bank",
        detail: "Move an IRA tied to a failed-bank deposit relationship.",
      },
      {
        value: "Uninsured Deposit",
        title: "Submit a question about my uninsured deposit claim",
        detail: "Ask about an uninsured deposit or claim treatment.",
      },
      {
        value: "Locating Deposit",
        title: "Locate my deposit in a failed bank",
        detail: "Help locate deposit funds or account records.",
      },
      {
        value: "Unclaimed Dividends",
        title: "Submit a question about a dividend I should have received",
        detail: "Ask about unclaimed dividends from a failed-bank claim.",
      },
      {
        value: "Depositors",
        title: "Update the status of my deposit insurance claim",
        detail: "Check or update the status of a depositor claim.",
      },
      {
        value: "Inquiry",
        title: "Ask some other question",
        detail: "Use this when none of the depositor claim options fit.",
      },
    ],
  },
  asset_management: {
    legend: "What kind of asset-management help do you need?",
    help: "Choose the asset-management request that best matches your need.",
    options: [
      {
        value: "ORE Deed Request",
        title: "Purchase FDIC real estate",
        detail: "Questions about FDIC-owned real estate and sale requests.",
      },
      {
        value: "Retained Loan",
        title: "Inquire about my loan which was retained by the FDIC",
        detail: "Questions about a loan the FDIC retained after bank failure.",
      },
    ],
  },
};

export const DOCUMENT_REQUEST_TYPE_OPTIONS = [
  {
    value: "Request copies of bank statements or checks",
    label: "Request copies of bank statements or checks",
  },
  {
    value: "Verify my previous employment with a failed bank",
    label: "Verify my previous employment with a failed bank",
  },
  {
    value: "Request my tax payment history from R & G Mortgage Corporation",
    label: "Request my tax payment history from R & G Mortgage Corporation",
  },
  {
    value: "Request a Form 480-7A for interest paid from R & G Mortgage Corporation",
    label: "Request a Form 480-7A for interest paid from R & G Mortgage Corporation",
  },
  {
    value: "Request copies of loan documents or payment history",
    label: "Request copies of loan documents or payment history",
  },
  {
    value: "Ask some other question",
    label: "Ask some other question",
  },
];

export const SPECIFIC_BANK_TOPIC_CONFIG = {
  bank_issue: {
    legend: "Does this concern involve a specific bank?",
    help: "If your concern is about one institution, select it here so we can review the right bank context. This is optional.",
  },
  small_business: {
    legend: "Does this concern involve a specific bank?",
    help: "If your small-business concern is about one institution, select it here. This is optional.",
  },
  insured_status: {
    legend: "Is this question about a specific bank?",
    help: "If you want help confirming the FDIC-insured status of one institution, select it here. This is optional.",
  },
  bank_history_records: {
    legend: "Is your request about a specific bank?",
    help: "If your data or history request concerns one institution, select it here so we can narrow the BankFind or records context. This is optional.",
  },
};

export const APPRAISAL_ROLE_OPTIONS = [
  { value: "Borrower", label: "Borrower" },
  { value: "Property Owner", label: "Property owner" },
  { value: "Real Estate Agent", label: "Real estate agent" },
  { value: "Appraiser", label: "Appraiser" },
  { value: "Lender", label: "Lender" },
  { value: "Other", label: "Other" },
];
