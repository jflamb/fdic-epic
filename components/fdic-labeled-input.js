import { escapeHtml, parseJsonAttribute } from "./utils.js";

export class FDICLabeledInput extends HTMLElement {
  connectedCallback() {
    const label = escapeHtml(this.getAttribute("label") || "");
    const inputId = this.getAttribute("input-id") || "";
    const type = this.getAttribute("input-type") || "text";
    const autocomplete = this.getAttribute("autocomplete");
    const placeholder = this.getAttribute("placeholder");
    const required = this.hasAttribute("required");
    const wrapperClass = this.getAttribute("wrapper-class");
    const isSelect = (this.getAttribute("input-tag") || "").toLowerCase() === "select" || type.toLowerCase() === "select";
    const markerId = this.getAttribute("required-marker-id");
    const markerHidden = this.hasAttribute("required-marker-hidden");
    const describedby = this.getAttribute("describedby");

    const requiredMarker = required || markerId
      ? `&nbsp;<span${markerId ? ` id="${escapeHtml(markerId)}"` : ""} class="report-required-marker" aria-hidden="true"${markerHidden ? " hidden" : ""}>*</span>`
      : "";
    const requiredAttrs = required ? ' required aria-required="true"' : "";
    const autocompleteAttr = autocomplete ? ` autocomplete="${escapeHtml(autocomplete)}"` : "";
    const placeholderAttr = placeholder ? ` placeholder="${escapeHtml(placeholder)}"` : "";
    const classAttr = wrapperClass ? ` class="${escapeHtml(wrapperClass)}"` : "";
    const describedbyAttr = describedby ? ` aria-describedby="${escapeHtml(describedby)}"` : "";

    let control = "";
    if (isSelect) {
      const options = parseJsonAttribute(this.getAttribute("options"), []);
      const optionMarkup = Array.isArray(options)
        ? options
            .map((opt) => `<option value="${escapeHtml(opt?.value ?? "")}">${escapeHtml(opt?.label ?? "")}</option>`)
            .join("")
        : "";
      control = `<select id="${escapeHtml(inputId)}" class="report-select" data-fdic-input${autocompleteAttr}${requiredAttrs}${describedbyAttr}>${optionMarkup}</select>`;
    } else {
      control = `<input id="${escapeHtml(inputId)}" class="report-input" type="${escapeHtml(type)}" data-fdic-input${autocompleteAttr}${placeholderAttr}${requiredAttrs}${describedbyAttr} />`;
    }

    this.innerHTML = `<div${classAttr}>
      <label class="report-label report-label--compact" for="${escapeHtml(inputId)}">${label}${requiredMarker}</label>
      ${control}
    </div>`;
  }
}

if (!customElements.get("fdic-labeled-input")) customElements.define("fdic-labeled-input", FDICLabeledInput);
