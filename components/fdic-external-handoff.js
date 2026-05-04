import { escapeHtml } from "./utils.js";

export class FDICExternalHandoff extends HTMLElement {
  setProfile(profile, pattern) {
    this.profile = profile || null;
    this.pattern = pattern || "";
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const description = escapeHtml(this.profile?.description || "");
    const url = escapeHtml(this.profile?.url || "#");
    const isExternal = this.pattern === "external-handoff";
    const showFailedBankPhone = Boolean(this.profile?.failedBankPhoneFallback);
    const notice = isExternal
      ? "You are about to leave the FDIC Information and Support Center."
      : "This information is available directly on FDIC.gov.";
    const cta = isExternal ? "Continue to external site" : "Go to FDIC.gov";

    this.innerHTML = `<div class="external-handoff-container">
      <div class="external-handoff-card">
        <p class="external-handoff-description">${description}</p>
        <p class="external-handoff-notice">${escapeHtml(notice)}</p>
        <a class="step-btn next external-handoff-link" href="${url}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(cta)}
          <span class="icon" aria-hidden="true">&#8250;</span>
        </a>
      </div>
      ${showFailedBankPhone ? '<div class="failed-bank-phone-fallback"><p>For other failed-bank questions, contact the <a href="https://resolutions.fdic.gov/fbcsc">Customer Service Center</a> at <a href="tel:+18882064662"><strong>1\u2011888\u2011206\u20114662</strong></a> (Mon\u2013Fri, 8\u202fa.m.\u20135\u202fp.m.\u00a0ET).</p></div>' : ""}
    </div>`;
  }
}

if (!customElements.get("fdic-external-handoff")) customElements.define("fdic-external-handoff", FDICExternalHandoff);
