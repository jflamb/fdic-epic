import { escapeHtml } from "./utils.js";

export class FDICStepActions extends HTMLElement {
  connectedCallback() {
    if (this.innerHTML.trim()) return;
    const backHref = this.getAttribute("back-href");
    const backId = this.getAttribute("back-id");
    const backLabel = escapeHtml(this.getAttribute("back-label") || "Back");
    const nextId = escapeHtml(this.getAttribute("next-id") || "");
    const nextLabel = escapeHtml(this.getAttribute("next-label") || "Continue");
    const nextType = escapeHtml(this.getAttribute("next-type") || "button");
    const nextHref = this.getAttribute("next-href");
    const actionsLabel = escapeHtml(this.getAttribute("actions-label") || "Form actions");
    const extraClass = this.getAttribute("extra-class");

    const backButton = backHref
      ? `<a${backId ? ` id="${escapeHtml(backId)}"` : ""} class="step-btn prev" href="${escapeHtml(backHref)}"><span class="icon" aria-hidden="true">&#8249;</span>${backLabel}</a>`
      : "";

    const nextControl = nextHref
      ? `<a${nextId ? ` id="${nextId}"` : ""} class="step-btn next" href="${escapeHtml(nextHref)}">${nextLabel}<span class="icon" aria-hidden="true">&#8250;</span></a>`
      : `<button${nextId ? ` id="${nextId}"` : ""} type="${nextType}" class="step-btn next">${nextLabel}<span class="icon" aria-hidden="true">&#8250;</span></button>`;

    this.innerHTML = `<div role="group" class="report-actions${extraClass ? ` ${escapeHtml(extraClass)}` : ""}" aria-label="${actionsLabel}">${backButton}${nextControl}</div>`;
  }
}

if (!customElements.get("fdic-step-actions")) customElements.define("fdic-step-actions", FDICStepActions);
