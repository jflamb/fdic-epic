import { escapeHtml } from "./utils.js";

export class FDICEmailSend extends HTMLElement {
  setProfile(profile) {
    this.profile = profile || null;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const to = escapeHtml(this.profile?.prefilled?.to || "");
    const subject = escapeHtml(this.profile?.prefilled?.subject || "");
    const showPhoneFallback = Boolean(this.profile?.phoneFallback);
    const showFailedBankPhone = Boolean(this.profile?.failedBankPhoneFallback);
    const rawTo = this.profile?.prefilled?.to || "";
    const rawSubject = this.profile?.prefilled?.subject || "";

    this.innerHTML = `<div class="email-send-container">
      <fieldset class="report-fieldset">
        <legend>Send an email request</legend>
        <p class="report-subcopy">This request is handled by email. The destination and subject are prefilled \u2014 add your message below, then select <strong>Open in email client</strong> to send.</p>
        <div class="email-send-fields">
          <div class="email-send-readonly">
            <span class="report-label">To:</span>
            <span class="email-send-value">${to}</span>
          </div>
          <div class="email-send-readonly">
            <span class="report-label">Subject:</span>
            <span class="email-send-value">${subject}</span>
          </div>
          <!-- Optional CC field deferred - no crawled profiles require it. -->
          <div>
            <label class="report-label" for="email-send-body">Your message&nbsp;<span class="report-required-marker" aria-hidden="true">*</span></label>
            <textarea id="email-send-body" class="report-input report-textarea" rows="6" required aria-required="true"></textarea>
          </div>
        </div>
        <div class="email-send-actions">
          <button type="button" id="email-send-open" class="step-btn next">Open in email client <span class="icon" aria-hidden="true">&#8250;</span></button>
        </div>
        ${showPhoneFallback ? '<p class="email-send-phone-fallback report-subcopy">You can also call the FDIC at <strong>1-800-925-4618</strong> for this request.</p>' : ""}
        ${showFailedBankPhone ? '<div class="failed-bank-phone-fallback report-subcopy"><p>For other failed-bank questions, contact the <a href="https://resolutions.fdic.gov/fbcsc">Customer Service Center</a> at <a href="tel:+18882064662"><strong>1\u2011888\u2011206\u20114662</strong></a> (Mon\u2013Fri, 8\u202fa.m.\u20135\u202fp.m.\u00a0ET).</p></div>' : ""}
      </fieldset>
    </div>`;

    const openBtn = this.querySelector("#email-send-open");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        const bodyEl = this.querySelector("#email-send-body");
        const body = bodyEl instanceof HTMLTextAreaElement ? bodyEl.value.trim() : "";
        if (!body) {
          bodyEl?.focus();
          return;
        }
        const params = new URLSearchParams({ subject: rawSubject, body });
        window.location.href = "mailto:" + encodeURIComponent(rawTo) + "?" + params.toString();
      });
    }
  }
}

if (!customElements.get("fdic-email-send")) customElements.define("fdic-email-send", FDICEmailSend);
