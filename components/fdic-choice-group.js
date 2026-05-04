import { escapeHtml } from "./utils.js";

export class FDICChoiceGroup extends HTMLElement {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  setConfig(config, selectedValue = "") {
    const prevConfig = this.config;
    this.config = config;
    this.selectedValue = selectedValue;

    // Skip full re-render when the options haven't changed —
    // a full innerHTML rebuild destroys DOM nodes and breaks keyboard
    // focus (arrow key navigation within the radio group).
    if (prevConfig && prevConfig.name === config.name
        && prevConfig.legend === config.legend
        && this.optionsMatch(prevConfig.options, config.options)) {
      this.syncSelection();
      this.syncRequired();
      return;
    }
    this.render();
  }

  optionsMatch(a, b) {
    if (a === b) return true;
    if (!a || !b || a.length !== b.length) return false;
    return a.every((opt, i) => opt.value === b[i].value && opt.title === b[i].title && opt.detail === b[i].detail);
  }

  syncSelection() {
    this.querySelectorAll(".report-option").forEach((label) => {
      const input = label.querySelector("input[type='radio']");
      if (input instanceof HTMLInputElement) {
        const selected = input.value === this.selectedValue;
        input.checked = selected;
        label.classList.toggle("is-selected", selected);
      }
    });
  }

  syncRequired() {
    const required = this.config?.required;
    const marker = this.querySelector(".report-required-marker");
    if (marker) {
      marker.hidden = !required;
    }
    this.querySelectorAll("input[type='radio']").forEach((input) => {
      if (required) {
        input.setAttribute("aria-required", "true");
      } else {
        input.removeAttribute("aria-required");
      }
    });
  }

  connectedCallback() {
    this.addEventListener("change", this.handleChange);
    if (this.config) {
      this.render();
    }
  }

  disconnectedCallback() {
    this.removeEventListener("change", this.handleChange);
  }

  handleChange(event) {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    this.querySelectorAll(".report-option").forEach((node) => {
      node.classList.remove("is-selected");
    });
    const selectedLabel = event.target.closest("label.report-option");
    if (selectedLabel) {
      selectedLabel.classList.add("is-selected");
    }
    const targetInput = event.target;
    this.dispatchEvent(
      new CustomEvent("choicechange", {
        bubbles: true,
        detail: {
          name: this.config?.name,
          value: event.target.value,
        },
      }),
    );
    // Restore focus after downstream handlers may have manipulated the DOM
    requestAnimationFrame(() => {
      if (document.activeElement !== targetInput && this.contains(targetInput)) {
        targetInput.focus();
      }
    });
  }

  render() {
    if (!this.config) {
      return;
    }

    const legendRequired = this.config.required ? '&nbsp;<span class="report-required-marker" aria-hidden="true">*</span>' : "";
    const safeName = escapeHtml(this.config.name || "");

    const radios = this.config.options
      .map((option, index) => {
        const checked = option.value === this.selectedValue;
        const id = `${safeName}-${index}`;
        const selectedClass = checked ? " is-selected" : "";
        const safeTitle = escapeHtml(option.title || "");
        const safeValue = escapeHtml(option.value || "");
        const safeDetail = option.detail ? escapeHtml(option.detail) : "";
        const detail = safeDetail ? `<span class="report-option-detail">${safeDetail}</span>` : "";

        return `<label class="report-option${selectedClass}" for="${id}">
            <input id="${id}" type="radio" name="${safeName}" value="${safeValue}" ${checked ? "checked" : ""} ${this.config.required ? 'aria-required="true"' : ""} />
            <span class="report-option__text">
              <strong>${safeTitle}</strong>
              ${detail}
            </span>
          </label>`;
      })
      .join("");

    // config.legend and config.help are trusted caller-provided HTML (may contain markup like required markers).
    this.innerHTML = `<fieldset class="report-fieldset" data-group-name="${safeName}">
        <legend id="${safeName}-legend">${this.config.legend}${legendRequired}</legend>
        ${this.config.help ? `<p class="report-subcopy">${this.config.help}</p>` : ""}
        <div class="report-grid">${radios}</div>
      </fieldset>`;
  }
}

if (!customElements.get("fdic-choice-group")) {
  customElements.define("fdic-choice-group", FDICChoiceGroup);
}
