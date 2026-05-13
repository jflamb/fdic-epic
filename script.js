import { escapeHtml } from "./components/utils.js";

const state = {
  data: null,
  query: "",
  selectedTopicId: "__all__",
  allTopics: [],
  searchDebounceId: null,
};

const SEARCH_DEBOUNCE_MS = 200;
const POPULAR_TOPIC_LIMIT = 5;
const SEARCH_SCORE_WEIGHTS = {
  questionToken: 7,
  topicToken: 5,
  summaryToken: 3,
  answerToken: 1,
  questionExact: 12,
  topicExact: 8,
};
const TOPIC_LABEL_ALIASES = new Map([
  ["About FDIC", "About the FDIC"],
  ["Understanding Deposit Insurance", "Deposit Insurance"],
  ["What's Covered?", "Covered Products"],
  ["Are My Accounts Insured?", "Account Coverage"],
  ["Is My Bank Insured?", "Insured Banks"],
  ["Information About My Bank", "Bank Information"],
  ["When a Bank Fails", "Bank Failures"],
  ["Bank Failures", "Failed Bank Basics"],
  ["Lien Releases from Failed Banks", "Failed Bank Lien Releases"],
  ["Institution & Asset Sales", "Institution and Asset Sales"],
  ["Deposit Tips", "Deposit Account Tips"],
  ["More About Loans", "Loans"],
  ["Loan Tips", "Loan Basics"],
  ["Overdraft Lines of Credit", "Overdraft Credit Lines"],
  ["Special Programs", "Card Special Programs"],
  ["Financial Disability Assistance", "Disability and Military Assistance"],
  ["Financial Institution Letters (FILS)", "Financial Institution Letters"],
  ["Industry Information and Data Tools", "Bank Data and Tools"],
  ["Using the Information and Support Center", "Using the Support Center"],
]);
const els = {
  search: document.getElementById("faq-search"),
  searchInlineClear: document.getElementById("faq-search-inline-clear"),
  searchScope: document.getElementById("faq-search-scope"),
  topicFilterPanel: document.getElementById("topic-filter-panel"),
  popularTopicList: document.getElementById("popular-topic-list"),
  activeFilterSummary: document.getElementById("active-filter-summary"),
  resultSummary: document.getElementById("result-summary"),
  faqList: document.getElementById("faq-list"),
};

init();

async function init() {
  try {
    const response = await fetch("data.json");
    state.data = await response.json();
    state.allTopics = flattenTopics(state.data.categories);
    applyUrlStateToFilters();

    wireEvents();
    updateInlineClearVisibility();
    updateTopicFilterPanel();
    render();
    if (typeof els.faqList.openByHash === "function") {
      els.faqList.openByHash(window.location.hash);
    }
  } catch (error) {
    console.error(error);
    els.activeFilterSummary.hidden = false;
    els.activeFilterSummary.textContent = "Unable to load FAQ content.";
    els.resultSummary.textContent = "";
  }
}

function wireEvents() {
  els.search.addEventListener("input", () => {
    if (state.searchDebounceId) {
      clearTimeout(state.searchDebounceId);
    }
    updateInlineClearVisibility();
    state.searchDebounceId = setTimeout(() => {
      state.query = els.search.value.trim();
      updateTopicFilterPanel();
      syncUrlState();
      render();
    }, SEARCH_DEBOUNCE_MS);
  });

  els.searchInlineClear.addEventListener("click", () => {
    clearSearch({ focusTarget: "search" });
  });

  window.addEventListener("hashchange", () => {
    if (typeof els.faqList.openByHash === "function") {
      els.faqList.openByHash(window.location.hash);
    }
  });

  window.addEventListener("popstate", () => {
    applyUrlStateToFilters();
    updateInlineClearVisibility();
    updateTopicFilterPanel();
    render();
  });

  els.popularTopicList.addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("[data-topic-id]") : null;
    if (!(button instanceof HTMLButtonElement)) return;
    selectTopic(button.dataset.topicId || "__all__", { focusTarget: "summary" });
  });

  els.activeFilterSummary.addEventListener("click", (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest("button") : null;
    if (!(button instanceof HTMLButtonElement)) return;
    if (button.hasAttribute("data-clear-all")) {
      clearAllFilters({ focusTarget: "search" });
      return;
    }
    if (button.hasAttribute("data-clear-topic")) {
      selectTopic("__all__", { focusTarget: "summary" });
      return;
    }
    if (button.hasAttribute("data-clear-search")) {
      clearSearch({ focusTarget: state.selectedTopicId === "__all__" ? "search" : "summary" });
    }
  });

  els.faqList.addEventListener("faq-topic-selected", (event) => {
    const topicId = event.detail?.topicId;
    if (!topicId) return;
    selectTopic(topicId, { focusTarget: "summary" });
  });

  els.faqList.addEventListener("faq-clear-search", () => {
    clearSearch({ focusTarget: state.selectedTopicId === "__all__" ? "search" : "summary" });
  });

  els.faqList.addEventListener("faq-clear-topic", () => {
    selectTopic("__all__", { focusTarget: "summary" });
  });

  els.faqList.addEventListener("faq-clear-all", () => {
    clearAllFilters({ focusTarget: "search" });
  });
}

function updateInlineClearVisibility() {
  els.searchInlineClear.hidden = !els.search.value;
}

function clearSearch(options = {}) {
  els.search.value = "";
  state.query = "";
  updateInlineClearVisibility();
  updateTopicFilterPanel();
  syncUrlState();
  render();

  if (options.focusTarget === "summary" && !els.activeFilterSummary.hidden) {
    els.activeFilterSummary.focus();
    return;
  }

  els.search.focus();
}

function clearAllFilters(options = {}) {
  els.search.value = "";
  state.query = "";
  state.selectedTopicId = "__all__";
  updateInlineClearVisibility();
  updateTopicFilterPanel();
  syncUrlState();
  render();

  if (options.focusTarget === "search") {
    els.search.focus();
  }
}

function updateTopicFilterPanel() {
  const hasActiveFilter = Boolean(state.query.trim()) || state.selectedTopicId !== "__all__";
  els.topicFilterPanel.open = !hasActiveFilter;
}

function applyUrlStateToFilters() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const topicId = params.get("topic") || "__all__";
  const topicsById = new Map(state.allTopics.map((topic) => [topic.id, topic]));

  state.query = query.trim();
  els.search.value = state.query;
  state.selectedTopicId = topicsById.has(topicId) ? topicId : "__all__";
}

function syncUrlState() {
  const params = new URLSearchParams(window.location.search);
  if (state.query) {
    params.set("q", state.query);
  } else {
    params.delete("q");
  }

  if (state.selectedTopicId !== "__all__") {
    params.set("topic", state.selectedTopicId);
  } else {
    params.delete("topic");
  }

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
  if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(null, "", nextUrl);
  }
}

function flattenTopics(items, depth = 0, parentId = null, list = []) {
  for (const item of items) {
    list.push({
      id: item.id,
      label: item.label,
      depth,
      parentId,
    });
    if (item.items && item.items.length) {
      flattenTopics(item.items, depth + 1, item.id, list);
    }
  }
  return list;
}

function buildTopicIndex() {
  const topicsById = new Map(state.allTopics.map((topic) => [topic.id, topic]));
  const childrenById = new Map();

  for (const topic of state.allTopics) {
    childrenById.set(topic.id, []);
  }

  for (const topic of state.allTopics) {
    if (!topic.parentId) continue;
    if (!childrenById.has(topic.parentId)) {
      childrenById.set(topic.parentId, []);
    }
    childrenById.get(topic.parentId).push(topic.id);
  }

  return { topicsById, childrenById };
}

function collectBranchTopicIds(topicId, childrenById, branch = new Set()) {
  if (!topicId || branch.has(topicId)) return branch;
  branch.add(topicId);
  const children = childrenById.get(topicId) || [];
  for (const childId of children) {
    collectBranchTopicIds(childId, childrenById, branch);
  }
  return branch;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeQuery(query) {
  if (!query) return [];
  return normalizeText(query).split(" ").filter(Boolean);
}

function getArticleSearchData(article) {
  const topicText = article.topics
    .map((topic) => `${topic.label} ${getTopicDisplayLabel(topic)}`)
    .join(" ");
  return {
    question: normalizeText(article.question),
    topicText: normalizeText(topicText),
    summary: normalizeText(article.summary || ""),
    answer: normalizeText(stripHtml(article.answerHtml || "")),
  };
}

function evaluateQueryMatch(article, tokens, normalizedQuery) {
  if (!tokens.length) return { matches: true, score: 0 };

  const fields = getArticleSearchData(article);
  const combined = `${fields.question} ${fields.topicText} ${fields.summary} ${fields.answer}`;

  for (const token of tokens) {
    if (!combined.includes(token)) {
      return { matches: false, score: 0 };
    }
  }

  let score = 0;
  for (const token of tokens) {
    if (fields.question.includes(token)) score += SEARCH_SCORE_WEIGHTS.questionToken;
    if (fields.topicText.includes(token)) score += SEARCH_SCORE_WEIGHTS.topicToken;
    if (fields.summary.includes(token)) score += SEARCH_SCORE_WEIGHTS.summaryToken;
    if (fields.answer.includes(token)) score += SEARCH_SCORE_WEIGHTS.answerToken;
  }

  if (normalizedQuery && fields.question.includes(normalizedQuery)) score += SEARCH_SCORE_WEIGHTS.questionExact;
  if (normalizedQuery && fields.topicText.includes(normalizedQuery)) score += SEARCH_SCORE_WEIGHTS.topicExact;

  return { matches: true, score };
}

function filterArticles() {
  const query = state.query;
  const tokens = tokenizeQuery(query);
  const normalizedQuery = normalizeText(query);
  const hasTopicFilter = state.selectedTopicId !== "__all__";
  const { childrenById } = buildTopicIndex();
  const allowedTopicIds = hasTopicFilter ? collectBranchTopicIds(state.selectedTopicId, childrenById) : null;
  const ranked = [];

  for (const article of state.data.articles) {
    const matchesTopic = !hasTopicFilter || article.topics.some((topic) => allowedTopicIds.has(topic.id));
    if (!matchesTopic) continue;

    const { matches, score } = evaluateQueryMatch(article, tokens, normalizedQuery);
    if (!matches) continue;

    ranked.push({ article, score });
  }

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.article.question.localeCompare(b.article.question);
  });

  return ranked.map((entry) => entry.article);
}

function topicCountsForAllArticles() {
  const directArticleIdsByTopic = new Map();
  const { childrenById } = buildTopicIndex();
  const articleIds = new Set();

  for (const article of state.data.articles) {
    const articleId = article.id || article.urlName || article.question;
    articleIds.add(articleId);

    for (const topic of article.topics) {
      if (!directArticleIdsByTopic.has(topic.id)) {
        directArticleIdsByTopic.set(topic.id, new Set());
      }
      directArticleIdsByTopic.get(topic.id).add(articleId);
    }
  }

  const displayCounts = new Map();
  for (const topic of state.allTopics) {
    const children = childrenById.get(topic.id) || [];
    if (!children.length) {
      displayCounts.set(topic.id, (directArticleIdsByTopic.get(topic.id) || new Set()).size);
      continue;
    }

    const branchTopicIds = collectBranchTopicIds(topic.id, childrenById);
    const branchArticleIds = new Set();
    for (const branchTopicId of branchTopicIds) {
      const ids = directArticleIdsByTopic.get(branchTopicId);
      if (!ids) continue;
      for (const articleId of ids) branchArticleIds.add(articleId);
    }
    displayCounts.set(topic.id, branchArticleIds.size);
  }

  return {
    counts: displayCounts,
    totalCount: articleIds.size,
  };
}

function render() {
  const filteredArticles = filterArticles();
  renderSearchScope();
  renderPopularTopics(topicCountsForAllArticles());
  renderActiveFilterSummary();
  renderResultSummary(filteredArticles.length);
  renderFaqList(filteredArticles);
}

function renderSearchScope() {
  const topic = getSelectedTopic();
  if (!topic) {
    if (!state.query.trim()) {
      els.searchScope.hidden = true;
      els.searchScope.textContent = "";
      return;
    }
    els.searchScope.hidden = false;
    els.searchScope.textContent = "Open Filter by topic to narrow these results.";
    return;
  }

  els.searchScope.hidden = false;
  els.searchScope.textContent = state.query.trim()
    ? `Searching within ${topic.displayLabel}.`
    : `Search within ${topic.displayLabel}, or clear the topic to search all FAQs.`;
}

function renderPopularTopics(countData) {
  const counts = countData?.counts || new Map();
  const topLevelTopics = state.allTopics
    .filter((topic) => !topic.parentId)
    .map((topic) => ({
      ...topic,
      count: counts.get(topic.id) || 0,
    }))
    .filter((topic) => topic.count > 0)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label);
    })
    .slice(0, POPULAR_TOPIC_LIMIT);

  const rows = [];

  for (const topic of topLevelTopics) {
    const isSelected = state.selectedTopicId === topic.id;
    rows.push(`
      <button
        class="popular-topic-chip ${isSelected ? "selected" : ""}"
        type="button"
        data-topic-id="${topic.id}"
        aria-pressed="${isSelected}"
      >
        <span>${escapeHtml(getTopicDisplayLabel(topic))}</span>
      </button>
    `);
  }

  els.popularTopicList.innerHTML = rows.join("");
}

function getRootTopicId(topicId, topicsById) {
  let currentId = topicId;
  const visited = new Set();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const topic = topicsById.get(currentId);
    if (!topic) return null;
    if (!topic.parentId) return topic.id;
    currentId = topic.parentId;
  }

  return null;
}

function renderActiveFilterSummary() {
  const topic = getSelectedTopic();
  const query = state.query.trim();

  if (!topic && !query) {
    els.activeFilterSummary.hidden = true;
    els.activeFilterSummary.innerHTML = "";
    return;
  }

  const filters = [];
  if (topic) {
    filters.push(`
      <span class="active-filter-pill">
        <span>Topic: <strong>${escapeHtml(topic.displayLabel)}</strong></span>
        <button type="button" data-clear-topic aria-label="Clear topic filter">
          <span aria-hidden="true">&times;</span>
        </button>
      </span>
    `);
  }

  if (query) {
    filters.push(`
      <span class="active-filter-pill">
        <span>Search: <strong>&ldquo;${escapeHtml(query)}&rdquo;</strong></span>
        <button type="button" data-clear-search aria-label="Clear search filter">
          <span aria-hidden="true">&times;</span>
        </button>
      </span>
    `);
  }

  if (topic || query) {
    filters.push(`
      <button class="clear-all-filters" type="button" data-clear-all>Clear all filters</button>
    `);
  }

  els.activeFilterSummary.hidden = false;
  els.activeFilterSummary.innerHTML = filters.join("");
}

function renderResultSummary(filteredCount) {
  const topic = getSelectedTopic();
  const query = state.query.trim();
  const faqLabel = filteredCount === 1 ? "FAQ" : "FAQs";
  const sortText = filteredCount > 0 && query ? " Sorted by relevance." : "";

  if (topic && query) {
    els.resultSummary.textContent = `Showing ${filteredCount} ${faqLabel} matching "${query}" in ${topic.displayLabel}.${sortText}`;
    return;
  }

  if (topic) {
    els.resultSummary.textContent = `Showing ${filteredCount} ${faqLabel} in ${topic.displayLabel}.${sortText}`;
    return;
  }

  if (query) {
    els.resultSummary.textContent = `Showing ${filteredCount} ${faqLabel} matching "${query}".${sortText}`;
    return;
  }

  els.resultSummary.textContent = `Showing ${filteredCount} ${faqLabel}.${sortText}`;
}

function getSelectedTopic() {
  if (state.selectedTopicId === "__all__") return null;
  const topicsById = new Map(state.allTopics.map((topic) => [topic.id, topic]));
  const topic = topicsById.get(state.selectedTopicId);
  return topic ? { ...topic, displayLabel: getTopicDisplayLabel(topic) } : null;
}

function getTopicDisplayLabel(topic) {
  return TOPIC_LABEL_ALIASES.get(topic?.label) || topic?.label || "";
}

function selectTopic(topicId, options = {}) {
  state.selectedTopicId = topicId;
  updateTopicFilterPanel();
  syncUrlState();
  render();

  if (options.restoreFocus) {
    const next = els.popularTopicList.querySelector(`[data-topic-id="${cssEscape(topicId)}"]`);
    if (next instanceof HTMLElement) {
      next.focus();
    }
    return;
  }

  if (options.focusTarget === "summary") {
    const target = els.activeFilterSummary.hidden ? els.search : els.activeFilterSummary;
    target.focus();
  }

}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return String(value).replace(/["\\]/g, "\\$&");
}

function renderFaqList(articles) {
  if (typeof els.faqList.renderArticles === "function") {
    els.faqList.renderArticles(articles, state.query, state.selectedTopicId);
    return;
  }

  els.faqList.innerHTML = `
    <div class="empty-state">
      <p><strong>Unable to render FAQ list.</strong></p>
      <p>Please refresh the page.</p>
    </div>
  `;
}
