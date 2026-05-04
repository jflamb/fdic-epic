import { parseJsonAttribute, escapeHtml } from "./utils.js";

export class FDICProgressTracker extends HTMLElement {
  setSteps(steps = []) {
    this.steps = Array.isArray(steps) ? steps : [];
    this.render();
  }

  connectedCallback() {
    this.steps = parseJsonAttribute(this.getAttribute("steps"), []);
    this.render();
  }

  render() {
    const steps = Array.isArray(this.steps) ? this.steps : [];
    this.innerHTML = `<section class="report-progress-aside" aria-label="Form progress">
      <div class="report-progress" aria-live="polite">
        <h3 class="report-progress-title">Sections in this request</h3>
        <ul id="progress-list" class="report-progress-list">${steps
          .map(
            (step) =>
              `<li id="${escapeHtml(step?.id || "")}" class="progress-item is-incomplete"><span class="progress-label">${escapeHtml(step?.label || "")}</span></li>`,
          )
          .join("")}</ul>
      </div>
    </section>`;
  }
}

if (!customElements.get("fdic-progress-tracker")) customElements.define("fdic-progress-tracker", FDICProgressTracker);
