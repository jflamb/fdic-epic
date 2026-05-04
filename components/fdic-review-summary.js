import { escapeHtml } from "./utils.js";

export class FDICReviewSummary extends HTMLElement {
  connectedCallback() {
    if (this.querySelector(".review-summary")) return;

    const dlId = escapeHtml(this.getAttribute("dl-id") || "review-summary");
    const idPrefix = escapeHtml(this.getAttribute("id-prefix") || "review");
    const endpointLabel = escapeHtml(this.getAttribute("endpoint-label") || "Routing destination");

    this.innerHTML = `<dl id="${dlId}" class="review-summary" hidden>
      <dt>Request type</dt>
      <dd id="${idPrefix}-intent"></dd>
      <dt>Concern topic</dt>
      <dd id="${idPrefix}-topic"></dd>
      <dt id="${idPrefix}-sub-dt" hidden>Request subtype</dt>
      <dd id="${idPrefix}-sub" hidden></dd>
      <dt id="${idPrefix}-specific-bank-dt" hidden>Specific bank</dt>
      <dd id="${idPrefix}-specific-bank" hidden></dd>
      <dt id="${idPrefix}-failed-bank-dt" hidden>Failed bank</dt>
      <dd id="${idPrefix}-failed-bank" hidden></dd>
      <dt id="${idPrefix}-document-type-dt" hidden>Document request type</dt>
      <dd id="${idPrefix}-document-type" hidden></dd>
      <dt id="${idPrefix}-appraisal-dt" hidden>Appraisal details</dt>
      <dd id="${idPrefix}-appraisal" hidden></dd>
      <dt>Issue details</dt>
      <dd id="${idPrefix}-details"></dd>
      <dt id="${idPrefix}-outcome-dt" hidden>Desired outcome</dt>
      <dd id="${idPrefix}-outcome" hidden></dd>
      <dt>Name</dt>
      <dd id="${idPrefix}-name"></dd>
      <dt>Email</dt>
      <dd id="${idPrefix}-email"></dd>
      <dt>Business phone</dt>
      <dd id="${idPrefix}-phone"></dd>
      <dt>Mailing address</dt>
      <dd id="${idPrefix}-address"></dd>
      <dt id="${idPrefix}-resolution-dt" hidden>Desired resolution details</dt>
      <dd id="${idPrefix}-resolution" hidden></dd>
      <dt>${endpointLabel}</dt>
      <dd id="${idPrefix}-endpoint"></dd>
    </dl>`;
  }
}

if (!customElements.get("fdic-review-summary")) customElements.define("fdic-review-summary", FDICReviewSummary);
