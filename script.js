import { escapeHtml } from "./components/utils.js";

const state = {
  data: null,
  query: "",
  selectedTopicId: "__all__",
  activeTreeItemId: "__all__",
  allTopics: [],
  searchDebounceId: null,
};

const SEARCH_DEBOUNCE_MS = 200;
const TREE_BASE_INDENT_PX = 16;
const TREE_DEPTH_INDENT_PX = 16;
const SEARCH_SCORE_WEIGHTS = {
  questionToken: 7,
  topicToken: 5,
  summaryToken: 3,
  answerToken: 1,
  questionExact: 12,
  topicExact: 8,
};

const els = {
  search: document.getElementById("faq-search"),
  searchInlineClear: document.getElementById("faq-search-inline-clear"),
  clear: document.getElementById("clear-search"),
  resultCount: document.getElementById("result-count"),
  categoryTree: document.getElementById("category-tree"),
  faqList: document.getElementById("faq-list"),
};

init();

async function init() {
  try {
    const response = await fetch("data.json");
    state.data = await response.json();
    state.allTopics = flattenTopics(state.data.categories);
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery) {
      state.query = initialQuery.trim();
      els.search.value = state.query;
    }

    wireEvents();
    updateInlineClearVisibility();
    render();
    if (typeof els.faqList.openByHash === "function") {
      els.faqList.openByHash(window.location.hash);
    }
  } catch (error) {
    console.error(error);
    els.resultCount.textContent = "Unable to load FAQ content.";
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
      render();
    }, SEARCH_DEBOUNCE_MS);
  });

  els.searchInlineClear.addEventListener("click", () => {
    els.search.value = "";
    state.query = "";
    updateInlineClearVisibility();
    render();
    els.search.focus();
  });

  els.clear.addEventListener("click", () => {
    els.search.value = "";
    state.query = "";
    updateInlineClearVisibility();
    render();
    els.search.focus();
  });

  window.addEventListener("hashchange", () => {
    if (typeof els.faqList.openByHash === "function") {
      els.faqList.openByHash(window.location.hash);
    }
  });
  els.categoryTree.addEventListener("keydown", handleCategoryTreeKeydown);
}

function updateInlineClearVisibility() {
  els.searchInlineClear.hidden = !els.search.value;
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
  const topicText = article.topics.map((topic) => topic.label).join(" ");
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

function topicCountsForQuery() {
  const directArticleIdsByTopic = new Map();
  const query = state.query;
  const tokens = tokenizeQuery(query);
  const normalizedQuery = normalizeText(query);
  const { childrenById } = buildTopicIndex();
  const matchingArticleIds = new Set();

  for (const article of state.data.articles) {
    const { matches } = evaluateQueryMatch(article, tokens, normalizedQuery);
    if (!matches) continue;
    const articleId = article.id || article.urlName || article.question;
    matchingArticleIds.add(articleId);

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
    totalCount: matchingArticleIds.size,
  };
}

function render() {
  const filteredArticles = filterArticles();
  renderResultCount(filteredArticles.length);
  renderCategoryTree(topicCountsForQuery());
  renderFaqList(filteredArticles);
}

function renderResultCount(count) {
  const total = state.data.articles.length;
  els.resultCount.textContent = `${count} of ${total} FAQs`;
}

function renderCategoryTree(countData) {
  const counts = countData?.counts || new Map();
  const allTopicsCount = countData?.totalCount ?? state.data.articles.length;
  const rows = [];
  const topicsById = new Map(state.allTopics.map((topic) => [topic.id, topic]));
  const expandedRootTopicId = getExpandedRootTopicId(topicsById);

  rows.push(`
    <button
      class="category-row ${state.selectedTopicId === "__all__" ? "selected" : ""}"
      type="button"
      data-topic-id="__all__"
      data-depth="0"
      role="option"
      aria-selected="${state.selectedTopicId === "__all__"}"
      tabindex="${state.activeTreeItemId === "__all__" ? "0" : "-1"}"
    >
      <span>All topics</span>
      <span class="category-count">${allTopicsCount}</span>
    </button>
  `);

  for (const topic of state.allTopics) {
    const count = counts.get(topic.id) || 0;
    const isSelected = state.selectedTopicId === topic.id;
    const isSubtopic = topic.depth > 0;
    const topicRootId = isSubtopic ? getRootTopicId(topic.id, topicsById) : topic.id;
    const isInExpandedBranch = Boolean(expandedRootTopicId && topicRootId === expandedRootTopicId);

    if (isSubtopic && !isInExpandedBranch && !isSelected) {
      continue;
    }
    if (count === 0 && !isSelected && allTopicsCount < state.data.articles.length) {
      continue;
    }
    if (isSubtopic && count === 0 && !isSelected) {
      continue;
    }
    const indent = topic.depth * TREE_DEPTH_INDENT_PX;

    rows.push(`
      <button
        class="category-row ${isSelected ? "selected" : ""}"
        type="button"
        style="padding-left:${TREE_BASE_INDENT_PX + indent}px"
        data-topic-id="${topic.id}"
        data-depth="${topic.depth}"
        role="option"
        aria-selected="${isSelected}"
        tabindex="${state.activeTreeItemId === topic.id ? "0" : "-1"}"
      >
        <span>${escapeHtml(topic.label)}</span>
        <span class="category-count">${count}</span>
      </button>
    `);
  }

  els.categoryTree.innerHTML = rows.join("");

  for (const button of els.categoryTree.querySelectorAll(".category-row")) {
    button.addEventListener("click", () => {
      const topicId = button.dataset.topicId || "__all__";
      selectTopic(topicId, false);
    });
  }
}

function getExpandedRootTopicId(topicsById) {
  if (state.selectedTopicId === "__all__") return null;
  return getRootTopicId(state.selectedTopicId, topicsById);
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

function handleCategoryTreeKeydown(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("category-row")) return;

  const buttons = getTreeButtons();
  if (!buttons.length) return;

  const currentIndex = buttons.indexOf(target);
  if (currentIndex < 0) return;

  const key = event.key;

  if (key === "ArrowDown") {
    event.preventDefault();
    focusTreeButtonByIndex(buttons, Math.min(currentIndex + 1, buttons.length - 1));
    return;
  }

  if (key === "ArrowUp") {
    event.preventDefault();
    focusTreeButtonByIndex(buttons, Math.max(currentIndex - 1, 0));
    return;
  }

  if (key === "Home") {
    event.preventDefault();
    focusTreeButtonByIndex(buttons, 0);
    return;
  }

  if (key === "End") {
    event.preventDefault();
    focusTreeButtonByIndex(buttons, buttons.length - 1);
    return;
  }

  if (key === "Enter" || key === " ") {
    event.preventDefault();
    selectTopic(target.dataset.topicId || "__all__", true);
  }
}

function selectTopic(topicId, restoreFocus) {
  state.selectedTopicId = topicId;
  state.activeTreeItemId = topicId;
  render();

  if (!restoreFocus) return;
  const next = els.categoryTree.querySelector(`.category-row[data-topic-id="${cssEscape(topicId)}"]`);
  if (next instanceof HTMLElement) {
    next.focus();
  }
}

function getTreeButtons() {
  return Array.from(els.categoryTree.querySelectorAll(".category-row"));
}

function focusTreeButtonByIndex(buttons, index) {
  const button = buttons[index];
  if (!button) return;
  state.activeTreeItemId = button.dataset.topicId || "__all__";
  for (const candidate of buttons) {
    candidate.tabIndex = candidate === button ? 0 : -1;
  }
  button.focus();
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return String(value).replace(/["\\]/g, "\\$&");
}

function renderFaqList(articles) {
  if (typeof els.faqList.renderArticles === "function") {
    els.faqList.renderArticles(articles, state.query);
    return;
  }

  els.faqList.innerHTML = `
    <div class="empty-state">
      <p><strong>Unable to render FAQ list.</strong></p>
      <p>Please refresh the page.</p>
    </div>
  `;
}
