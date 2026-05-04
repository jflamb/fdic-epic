import { escapeHtml } from "./utils.js";

export class FDICSupportCard extends HTMLElement {
  connectedCallback() {
    if (this.innerHTML.trim()) return;
    const href = this.getAttribute("href") || "#";
    const heading = escapeHtml(this.getAttribute("heading") || "");
    const description = escapeHtml(this.getAttribute("description") || "");
    const cta = escapeHtml(this.getAttribute("cta") || "");

    this.innerHTML = `<article class="support-card">
      <a class="support-card-link" href="${escapeHtml(href)}">
        <h3>${heading}</h3>
        <p>${description}</p>
        <span class="support-card-cta">${cta}</span>
      </a>
    </article>`;
  }
}

if (!customElements.get("fdic-support-card")) customElements.define("fdic-support-card", FDICSupportCard);
