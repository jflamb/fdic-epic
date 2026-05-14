import { sanitizeCaseHistory } from "./components/prototype-storage.mjs";
import { escapeHtml } from "./components/utils.js";

const CASE_HISTORY_STORAGE_KEY = "fdicSupportCaseHistory";

const table = document.getElementById("cases-table");
const tbody = document.getElementById("cases-tbody");
const empty = document.getElementById("cases-empty");
const sortSelect = document.getElementById("cases-sort");
const clearCaseHistoryBtn = document.getElementById("clear-case-history-btn");

let cases = [];

function loadCases() {
  try {
    const raw = localStorage.getItem(CASE_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const history = sanitizeCaseHistory(parsed);
    if (raw !== JSON.stringify(history)) {
      localStorage.setItem(CASE_HISTORY_STORAGE_KEY, JSON.stringify(history));
    }
    return history;
  } catch {
    return [];
  }
}

function sortByRecency(cases, sortValue) {
  const sorted = cases.slice();
  sorted.sort((a, b) => {
    const aTime = a?.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const bTime = b?.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return sortValue === "oldest" ? aTime - bTime : bTime - aTime;
  });
  return sorted;
}

function renderCases(cases, sortValue = "newest") {
  if (!cases.length) {
    empty.hidden = false;
    table.hidden = true;
    if (clearCaseHistoryBtn instanceof HTMLElement) {
      clearCaseHistoryBtn.hidden = true;
    }
    if (sortSelect) {
      sortSelect.disabled = true;
    }
    return;
  }

  const rows = sortByRecency(cases, sortValue)
    .map((item) => {
      const submitted = item.submittedAt ? new Date(item.submittedAt).toLocaleString() : "Unknown";
      return `<tr>
        <td>${escapeHtml(item.caseId || "Unknown")}</td>
        <td>${escapeHtml(submitted)}</td>
        <td>${escapeHtml(item.workflowHeading || "Unknown")}</td>
        <td>${escapeHtml(item.topicTitle || "Unknown")}</td>
        <td>${escapeHtml(item.status || "Submitted")}</td>
      </tr>`;
    })
    .join("");

  tbody.innerHTML = rows;
  empty.hidden = true;
  table.hidden = false;
  if (clearCaseHistoryBtn instanceof HTMLElement) {
    clearCaseHistoryBtn.hidden = false;
  }
  if (sortSelect) {
    sortSelect.disabled = false;
  }
}

cases = loadCases();
const initialSort = sortSelect?.value || "newest";
renderCases(cases, initialSort);

if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    renderCases(cases, sortSelect.value);
  });
}

if (clearCaseHistoryBtn) {
  clearCaseHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem(CASE_HISTORY_STORAGE_KEY);
    cases = [];
    renderCases(cases, sortSelect?.value || "newest");
  });
}
