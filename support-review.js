import { ROUTES } from "./components/routes.js";
import { buildSalesforcePayload } from "./components/fdic-salesforce-payload.mjs";
import { createCaseHistoryEntry, isPrototypeSessionRecordFresh, sanitizeCaseHistory } from "./components/prototype-storage.mjs";
import { escapeHtml, stripQuestionPrefix } from "./components/utils.js";

const DRAFT_STORAGE_KEY = "fdicSupportIntakeDraft";
const SUBMITTED_STORAGE_KEY = "fdicSupportSubmittedCase";
const CASE_HISTORY_STORAGE_KEY = "fdicSupportCaseHistory";

const search = new URLSearchParams(window.location.search);
const mode = search.get("mode") || "report";
const routes = ROUTES;

const summary = document.getElementById("review-summary");
const missing = document.getElementById("review-missing");
const backLink = document.getElementById("review-back");
const submitButton = document.getElementById("submit-request");
const submitStatus = document.getElementById("submit-status");
const reviewMain = document.querySelector(".review-main");

const intentNode = document.getElementById("review-intent");
const topicNode = document.getElementById("review-topic");
const subDt = document.getElementById("review-sub-dt");
const subNode = document.getElementById("review-sub");
const specificBankDt = document.getElementById("review-specific-bank-dt");
const specificBankNode = document.getElementById("review-specific-bank");
const failedBankDt = document.getElementById("review-failed-bank-dt");
const failedBankNode = document.getElementById("review-failed-bank");
const documentTypeDt = document.getElementById("review-document-type-dt");
const documentTypeNode = document.getElementById("review-document-type");
const appraisalDt = document.getElementById("review-appraisal-dt");
const appraisalNode = document.getElementById("review-appraisal");
const detailsNode = document.getElementById("review-details");
const outcomeDt = document.getElementById("review-outcome-dt");
const outcomeNode = document.getElementById("review-outcome");
const nameNode = document.getElementById("review-name");
const emailNode = document.getElementById("review-email");
const phoneNode = document.getElementById("review-phone");
const addressNode = document.getElementById("review-address");
const resolutionDt = document.getElementById("review-resolution-dt");
const resolutionNode = document.getElementById("review-resolution");
const endpointNode = document.getElementById("review-endpoint");
const payloadPreview = document.getElementById("salesforce-payload-preview");
const payloadPreviewCode = document.getElementById("salesforce-payload-code");
const faqSuggestions = document.getElementById("faq-suggestions");
const faqSuggestionsList = document.getElementById("faq-suggestions-list");
const FAQ_DATA_PATH = "data.json";
const SUBMIT_BUTTON_DEFAULT_LABEL = submitButton?.textContent?.trim() || "Submit request";
let isSubmitting = false;
let faqSuggestionsController = null;

const FAQ_HINTS = {
  bank_issue: [
    "bank fee",
    "open bank account fees",
    "banking services",
  ],
  small_business: [
    "small business banking",
    "business banking services",
    "business account concerns",
  ],
  fdic_issue: [
    "contact FDIC",
    "file complaint",
    "FDIC services",
  ],
  appraisal: [
    "appraisal problem",
    "appraisal complaint",
    "property appraisal",
  ],
  deposit_question: [
    "deposit insurance",
    "accounts insured",
    "is my bank insured",
  ],
  process_help: [
    "FDIC services",
    "banking guidance",
  ],
  general_fdic_info: [
    "FDIC hours",
    "deposit insurance",
    "FDIC FAQ",
  ],
  dir: [
    "bank data",
    "DIR",
    "QBP",
    "Call Report",
  ],
  qbp_analysis: [
    "Quarterly Banking Profile",
    "QBP",
    "industry analysis",
  ],
  call_report_data: [
    "Call Report",
    "reporting data",
    "series definitions",
  ],
  bank_history_records: [
    "bank history",
    "BankFind",
    "failed bank records",
  ],
  ffiec_data: [
    "FFIEC",
    "CDR",
    "call report",
    "UBPR",
  ],
  bank_data: [
    "bank data",
    "bank history",
    "bank fails",
  ],
  general_question: [
    "regulatory question",
    "banking guidance",
  ],
  depositor_claim: [
    "bank failures",
    "deposit claims",
    "unclaimed dividends",
  ],
  lien_release: [
    "lien release",
    "failed bank records",
  ],
  tax_documents: [
    "tax form",
    "1098",
    "1099",
    "W2",
    "failed bank tax",
  ],
  receiver_letter: [
    "receiver letter",
    "receivership",
    "appointment of receiver",
  ],
  merger_certification: [
    "bank merger",
    "name change",
    "certification",
  ],
  purchase_agreement: [
    "purchase assumption",
    "P&A agreement",
    "failed bank list",
  ],
  insured_status: [
    "FDIC insured",
    "deposit insurance",
  ],
};

const FAQ_TOPIC_CONTEXT = {
  report: ["Information About My Bank", "Bank Regulations"],
  bank_issue: ["Information About My Bank", "Bank Regulations"],
  small_business: ["Bank Regulations", "Information About My Bank"],
  fdic_issue: ["About FDIC"],
  appraisal: ["Appraisals", "Real Estate"],
  ask: ["About FDIC", "Bank Regulations"],
  deposit_question: ["Understanding Deposit Insurance", "What's Covered?", "Is My Bank Insured?", "Are My Accounts Insured?"],
  general_question: ["Bank Regulations", "About FDIC"],
  process_help: ["About FDIC", "Bank Regulations"],
  general_fdic_info: ["About FDIC", "Understanding Deposit Insurance"],
  dir: ["Industry Information and Data Tools"],
  qbp_analysis: ["Industry Information and Data Tools"],
  call_report_data: ["Industry Information and Data Tools"],
  bank_history_records: ["Industry Information and Data Tools", "Information About My Bank", "Bank Failures"],
  ffiec_data: ["Industry Information and Data Tools"],
  failed: ["When a Bank Fails", "Bank Failures"],
  depositor_claim: ["When a Bank Fails", "Bank Failures"],
  lien_release: ["Lien Releases from Failed Banks", "Institution & Asset Sales"],
  tax_documents: ["When a Bank Fails", "Bank Failures"],
  receiver_letter: ["When a Bank Fails", "Bank Failures"],
  merger_certification: ["Institution & Asset Sales", "Bank Failures"],
  purchase_agreement: ["Institution & Asset Sales", "Bank Failures"],
  insured_status: ["Information About My Bank", "Is My Bank Insured?", "Understanding Deposit Insurance"],
};

function getContextTopicLabels(draft) {
  return [...new Set([
    ...(FAQ_TOPIC_CONTEXT[draft.intent] || []),
    ...(FAQ_TOPIC_CONTEXT[draft.topic] || []),
  ])];
}

function hasContextTopicMatch(article, contextLabels) {
  if (!contextLabels.length) {
    return false;
  }
  const articleLabels = Array.isArray(article?.topics)
    ? article.topics.map((topic) => (topic?.label || "").trim().toLowerCase()).filter(Boolean)
    : [];
  if (!articleLabels.length) {
    return false;
  }
  const contextLabelSet = new Set(contextLabels.map((label) => label.toLowerCase()));
  return articleLabels.some((label) => contextLabelSet.has(label));
}

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!isPrototypeSessionRecordFresh(draft)) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function showConditionalRow(dtEl, ddEl, value) {
  if (!dtEl || !ddEl) return;
  if (value) {
    ddEl.textContent = value;
    dtEl.hidden = false;
    ddEl.hidden = false;
  } else {
    dtEl.hidden = true;
    ddEl.hidden = true;
  }
}

function formatAppraisalSummary(draft) {
  const parts = [];
  if (draft.appraisalRole) parts.push("Role: " + draft.appraisalRole);
  if (draft.propertyStreet || draft.propertyCity) {
    parts.push([draft.propertyStreet, draft.propertyCity].filter(Boolean).join(", "));
  }
  return parts.join(" \u2014 ");
}

function renderDraft(draft) {
  intentNode.textContent = draft.workflowHeading || "Not provided";
  topicNode.textContent = draft.topicTitle || "Not provided";
  showConditionalRow(subDt, subNode, draft.subLabel);
  showConditionalRow(specificBankDt, specificBankNode, draft.specificBankSearch);
  showConditionalRow(failedBankDt, failedBankNode, draft.failedBankSearch);
  showConditionalRow(documentTypeDt, documentTypeNode, draft.documentRequestType);
  showConditionalRow(appraisalDt, appraisalNode, formatAppraisalSummary(draft));
  detailsNode.textContent = draft.details || "Not provided";
  showConditionalRow(outcomeDt, outcomeNode, draft.outcomeTitle);
  nameNode.textContent = formatName(draft);
  emailNode.textContent = draft.email || "Not provided";
  phoneNode.textContent = draft.businessPhone || "Not provided";
  addressNode.textContent = formatAddress(draft);
  showConditionalRow(resolutionDt, resolutionNode, draft.desiredResolution);
  endpointNode.textContent = draft.endpointLabel || "Not provided";
  renderPayloadPreview(draft);
  renderFaqSuggestions(draft);

  summary.hidden = false;
  missing.hidden = true;
}

function renderPayloadPreview(draft) {
  if (!(payloadPreview instanceof HTMLElement) || !(payloadPreviewCode instanceof HTMLElement)) {
    return;
  }

  payloadPreview.hidden = false;
  payloadPreviewCode.textContent = JSON.stringify(buildSalesforcePayload(draft), null, 2);
}

function renderFaqSuggestions(draft) {
  if (!faqSuggestions || !faqSuggestionsList) {
    return;
  }
  if (faqSuggestionsController) {
    faqSuggestionsController.abort();
  }
  faqSuggestionsController = new AbortController();
  faqSuggestionsList.innerHTML = '<li><span>Loading related FAQs...</span></li>';
  faqSuggestions.hidden = false;

  fetch(FAQ_DATA_PATH, { signal: faqSuggestionsController.signal })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to load FAQ data.");
      }
      return response.json();
    })
    .then((data) => {
      const articles = Array.isArray(data?.articles) ? data.articles : [];
      const matches = getFaqSuggestions(articles, draft, 3);

      if (!matches.length) {
        renderFallbackTopicHints(draft);
        return;
      }

      faqSuggestionsList.innerHTML = matches
        .map((article) => {
          const hash = `faq-${article.urlName || article.id}`;
          const href = `${routes.faq}#${hash}`;
          const label = escapeHtml(stripQuestionPrefix(article.question || "Untitled FAQ"));
          return `<li><a href="${href}">${label}</a></li>`;
        })
        .join("");
    })
    .catch((err) => {
      if (err?.name === "AbortError") return;
      renderFallbackTopicHints(draft);
    });
}

function renderFallbackTopicHints(draft) {
  const suggestions = FAQ_HINTS[draft.topic] || FAQ_HINTS[draft.intent] || [];
  if (!suggestions.length) {
    faqSuggestions.hidden = true;
    faqSuggestionsList.innerHTML = "";
    return;
  }

  faqSuggestionsList.innerHTML = suggestions
    .slice(0, 3)
    .map((query) => `<li><a href="${routes.faq}?q=${encodeURIComponent(query)}">${escapeHtml(query)}</a></li>`)
    .join("");
}

function getFaqSuggestions(articles, draft, limit = 3) {
  const contextLabels = getContextTopicLabels(draft);
  const narrowed = contextLabels.length
    ? articles.filter((article) => hasContextTopicMatch(article, contextLabels))
    : [];
  const candidatePool = narrowed.length >= limit ? narrowed : articles;

  const keywords = [
    ...(FAQ_HINTS[draft.topic] || []),
    ...(FAQ_HINTS[draft.intent] || []),
    draft.topicTitle || "",
    draft.outcomeTitle || "",
    draft.workflowHeading || "",
  ]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  if (!keywords.length) {
    return [];
  }

  const ranked = candidatePool
    .map((article) => {
      const question = (article.question || "").toLowerCase();
      const summary = (article.summary || "").toLowerCase();
      const topicText = Array.isArray(article.topics)
        ? article.topics.map((topic) => (topic?.label || "").toLowerCase()).join(" ")
        : "";
      let score = 0;
      const contextMatch = hasContextTopicMatch(article, contextLabels);

      if (contextMatch) score += 15;

      for (const term of keywords) {
        if (question.includes(term)) score += 6;
        if (topicText.includes(term)) score += 5;
        if (summary.includes(term)) score += 2;
      }

      return { article, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const deduped = [];
  const seen = new Set();
  for (const entry of ranked) {
    const key = entry.article?.urlName || entry.article?.id;
    if (!key || seen.has(key)) continue;
    deduped.push(entry.article);
    seen.add(key);
    if (deduped.length >= limit) break;
  }

  return deduped;
}

function renderMissingState() {
  summary.hidden = true;
  missing.hidden = false;
  submitButton.disabled = true;
  submitButton.setAttribute("aria-disabled", "true");
}

function setSubmitting(submitting) {
  isSubmitting = submitting;
  submitButton.disabled = submitting;
  submitButton.setAttribute("aria-disabled", submitting ? "true" : "false");
  submitButton.classList.toggle("is-loading", submitting);
  submitButton.textContent = submitting ? "Submitting..." : SUBMIT_BUTTON_DEFAULT_LABEL;
  if (reviewMain) {
    reviewMain.setAttribute("aria-busy", submitting ? "true" : "false");
  }
}

function formatName(draft) {
  const first = (draft.firstName || "").trim();
  const last = (draft.lastName || "").trim();
  return [first, last].filter(Boolean).join(" ") || "Not provided";
}

function formatAddress(draft) {
  const parts = [
    draft.mailingStreet,
    [draft.mailingCity, draft.mailingState].filter(Boolean).join(", "),
    draft.mailingPostal,
    draft.mailingCountry,
  ]
    .map((part) => (part || "").trim())
    .filter(Boolean);
  return parts.join(" • ") || "Not provided";
}

function updateBreadcrumb(draft) {
  const breadcrumb = document.querySelector("fdic-breadcrumb");
  if (!breadcrumb || !draft?.workflowHeading) {
    return;
  }
  const crumbs = [
    { label: "Home", href: "https://www.fdic.gov" },
    { label: "Information and Support Center", href: "index.html" },
    { label: draft.workflowHeading, href: "report-problem.html" },
    { label: "Review Submission" },
  ];
  breadcrumb.setAttribute("crumbs", JSON.stringify(crumbs));
}

function hasReviewableDraft(draft) {
  return Boolean(
    draft &&
      draft.intent &&
      draft.topic &&
      (draft.endpointProfile || draft.endpointLabel) &&
      (draft.pattern || "intake") === "intake",
  );
}

backLink.setAttribute("href", routes.reportEdit(mode));

const draft = loadDraft();
if (!hasReviewableDraft(draft)) {
  renderMissingState();
} else {
  updateBreadcrumb(draft);
  renderDraft(draft);
}

submitButton.addEventListener("click", () => {
  if (isSubmitting) {
    return;
  }

  const latestDraft = loadDraft();
  if (!latestDraft) {
    submitStatus.textContent = "No complete draft found. Return to the form and try again.";
    return;
  }

  setSubmitting(true);
  submitStatus.textContent = "Submitting your request...";

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  const randPart = Math.floor(1000 + Math.random() * 9000);
  const caseId = `FDIC-${datePart}-${randPart}`;

  const submittedCase = {
    caseId,
    submittedAt: now.toISOString(),
    status: "Submitted",
    ...latestDraft,
  };
  submittedCase.salesforcePayload = buildSalesforcePayload(submittedCase, {
    caseId,
    submittedAt: submittedCase.submittedAt,
  });

  sessionStorage.setItem(SUBMITTED_STORAGE_KEY, JSON.stringify(submittedCase));
  try {
    const existing = JSON.parse(localStorage.getItem(CASE_HISTORY_STORAGE_KEY) || "[]");
    const history = sanitizeCaseHistory(existing);
    history.push(createCaseHistoryEntry(submittedCase));
    localStorage.setItem(CASE_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Ignore localStorage failures in prototype mode.
  }
  try {
    window.setTimeout(() => {
      window.location.href = `${routes.submissionConfirmation}?mode=${encodeURIComponent(mode)}`;
    }, 150);
  } catch {
    setSubmitting(false);
    submitStatus.textContent = "We could not submit your request. Please try again.";
  }
});

window.addEventListener("pagehide", () => {
  if (faqSuggestionsController) {
    faqSuggestionsController.abort();
    faqSuggestionsController = null;
  }
});
