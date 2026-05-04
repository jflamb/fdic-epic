import { escapeHtml, stripQuestionPrefix, escapeCssSelector, copyTextToClipboard } from "./utils.js";

const ANIM_DURATION = 200;
const ANIM_EASING = "ease";
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export class FDICFAQList extends HTMLElement {
  constructor() {
    super();
    this.activeFaqItemId = null;
    this._copyLinkTimerId = null;
    this._animations = new WeakMap();
    this.handleClick = this.handleClick.bind(this);
    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  connectedCallback() {
    this.addEventListener("click", this.handleClick);
    this.addEventListener("focusin", this.handleFocusIn);
    this.addEventListener("keydown", this.handleKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick);
    this.removeEventListener("focusin", this.handleFocusIn);
    this.removeEventListener("keydown", this.handleKeydown);
    if (this._copyLinkTimerId != null) {
      clearTimeout(this._copyLinkTimerId);
      this._copyLinkTimerId = null;
    }
  }

  highlightQuery(text, query) {
    if (!query || !query.trim()) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const tokens = query.trim().split(/\s+/).filter(Boolean).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!tokens.length) return escaped;
    const pattern = new RegExp(`(${tokens.join("|")})`, "gi");
    return escaped.replace(pattern, "<mark>$1</mark>");
  }

  renderArticles(articles, query = "") {
    if (!Array.isArray(articles) || !articles.length) {
      this.activeFaqItemId = null;
      this.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9da6b1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
          <p class="empty-state-heading">No matching FAQs</p>
          <p class="empty-state-body">Try a different keyword or choose a different topic.</p>
          <p class="empty-state-body">Still can't find what you need? <a href="index.html">Submit a request</a> through the Information and Support Center.</p>
        </div>
      `;
      return;
    }

    const listItems = articles
      .map((article) => {
        const safeId = `faq-${escapeHtml(article.urlName)}`;
        const question = stripQuestionPrefix(article.question);

        const highlighted = this.highlightQuery(question, query);
        return `
          <li class="faq-list-item">
            <article class="faq-item" id="${safeId}">
              <details>
                <summary>
                  <div class="faq-head">
                    <h3>${highlighted}</h3>
                  </div>
                </summary>
                <!-- answerHtml is pre-sanitized HTML from the trusted data.json corpus -->
                <div class="answer">
                  ${article.answerHtml || ""}
                  <div class="answer-actions">
                    <button
                      class="copy-link-btn"
                      type="button"
                      data-link="#${safeId}"
                      aria-label="Copy link to: ${escapeHtml(question)}"
                    >
                      Copy link
                    </button>
                  </div>
                </div>
              </details>
            </article>
          </li>
        `;
      })
      .join("");

    this.innerHTML = `<ul class="faq-list-items" role="list">${listItems}</ul>`;
    this.setupKeyboardNavigation();
    this.openByHash(window.location.hash);
  }

  openByHash(hash = window.location.hash) {
    if (!hash) return;
    const selector = hash.startsWith("#") ? hash : `#${hash}`;
    const target = this.querySelector(selector);
    if (!target) return;

    const details = target.querySelector("details");
    if (details instanceof HTMLDetailsElement) details.open = true;

    const summary = target.querySelector("summary");
    if (summary instanceof HTMLElement) {
      this.setActiveFaqSummary(summary, false);
    }

    requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }

  getFaqSummaries() {
    return Array.from(this.querySelectorAll(".faq-item summary"));
  }

  setActiveFaqSummary(summary, focus = false) {
    const summaries = this.getFaqSummaries();
    if (!summary || !summaries.includes(summary)) return;

    for (const candidate of summaries) {
      candidate.tabIndex = candidate === summary ? 0 : -1;
    }

    const item = summary.closest(".faq-item");
    this.activeFaqItemId = item?.id || null;

    if (focus) summary.focus();
  }

  setupKeyboardNavigation() {
    const summaries = this.getFaqSummaries();
    if (!summaries.length) return;

    let preferred = null;
    if (this.activeFaqItemId) {
      preferred = this.querySelector(`#${escapeCssSelector(this.activeFaqItemId)} summary`);
    }
    if (!preferred && window.location.hash) {
      preferred = this.querySelector(`${window.location.hash} summary`);
    }

    this.setActiveFaqSummary(preferred || summaries[0], false);
  }

  toggleDetails(details) {
    if (!(details instanceof HTMLDetailsElement)) return;

    // Cancel any in-flight animation on this element
    const prev = this._animations.get(details);
    if (prev) { prev.cancel(); this._animations.delete(details); }

    const answer = details.querySelector(".answer");
    const isOpen = details.open;

    if (prefersReducedMotion()) {
      details.open = !isOpen;
      return;
    }

    if (isOpen) {
      // Closing: animate out, then remove [open]
      if (answer) {
        const startHeight = answer.offsetHeight;
        const anim = answer.animate(
          [
            { opacity: 1, maxHeight: `${startHeight}px`, transform: "translateY(0)" },
            { opacity: 0, maxHeight: "0px", transform: "translateY(-4px)" },
          ],
          { duration: ANIM_DURATION, easing: ANIM_EASING, fill: "forwards" }
        );
        this._animations.set(details, anim);
        anim.onfinish = () => {
          details.open = false;
          anim.cancel();
          this._animations.delete(details);
        };
      } else {
        details.open = false;
      }
    } else {
      // Opening: set [open], then animate in
      details.open = true;
      if (answer) {
        const targetHeight = answer.offsetHeight;
        const anim = answer.animate(
          [
            { opacity: 0, maxHeight: "0px", overflow: "hidden", transform: "translateY(-4px)" },
            { opacity: 1, maxHeight: `${targetHeight}px`, overflow: "hidden", transform: "translateY(0)" },
          ],
          { duration: ANIM_DURATION, easing: ANIM_EASING }
        );
        this._animations.set(details, anim);
        anim.onfinish = () => this._animations.delete(details);
      }
    }
  }

  async handleCopyLink(button) {
    const hash = button.dataset.link;
    if (!hash) return;

    const url = new URL(hash, window.location.href).href;
    const copied = await copyTextToClipboard(url);
    if (!copied) return;

    button.textContent = "Copied";
    button.setAttribute("aria-label", "Link copied to clipboard");
    this._copyLinkTimerId = window.setTimeout(() => {
      this._copyLinkTimerId = null;
      button.textContent = "Copy link";
      const article = button.closest(".faq-item");
      const question = article?.querySelector("h3")?.textContent?.trim();
      button.setAttribute("aria-label", question ? `Copy link to: ${question}` : "Copy link to this question");
    }, 1300);
  }

  handleFocusIn(event) {
    const summary = event.target instanceof HTMLElement ? event.target.closest(".faq-item summary") : null;
    if (summary instanceof HTMLElement) this.setActiveFaqSummary(summary, false);
  }

  handleClick(event) {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target) return;

    const copyButton = target.closest(".copy-link-btn");
    if (copyButton instanceof HTMLButtonElement) {
      this.handleCopyLink(copyButton);
      return;
    }

    const summary = target.closest(".faq-item summary");
    if (summary instanceof HTMLElement) {
      event.preventDefault();
      this.setActiveFaqSummary(summary, false);
      this.toggleDetails(summary.closest("details"));
    }
  }

  handleKeydown(event) {
    const summary = event.target instanceof HTMLElement ? event.target.closest(".faq-item summary") : null;
    if (!summary) return;

    const summaries = this.getFaqSummaries();
    if (!summaries.length) return;

    const currentIndex = summaries.indexOf(summary);
    if (currentIndex < 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.setActiveFaqSummary(summaries[Math.min(currentIndex + 1, summaries.length - 1)], true);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.setActiveFaqSummary(summaries[Math.max(currentIndex - 1, 0)], true);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      this.setActiveFaqSummary(summaries[0], true);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      this.setActiveFaqSummary(summaries[summaries.length - 1], true);
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this.toggleDetails(summary.closest("details"));
    }
  }
}

if (!customElements.get("fdic-faq-list")) customElements.define("fdic-faq-list", FDICFAQList);
