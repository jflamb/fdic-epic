import { escapeCssSelector, escapeHtml } from "./utils.js";
import {
  buildInstitutionFilterVariants,
  rankInstitutionOptions,
  scoreBankMatch,
  tokenizeBankSearchText,
} from "./fdic-bank-selector-utils.mjs";

const BANKFIND_API_URL = "https://api.fdic.gov/banks/institutions";
const BANKFIND_LOCATIONS_API_URL = "https://api.fdic.gov/banks/locations";
const BANKFIND_FIELDS = ["NAME", "CERT", "CITY", "STALP", "ACTIVE", "WEBADDR", "MAINOFF", "REGAGNT", "ASSET"];
const BANKFIND_LOCATION_FIELDS = ["OFFNAME", "NAME", "CERT", "ADDRESS", "CITY", "STALP", "ZIP", "LATITUDE", "LONGITUDE", "MAINOFF"];
const DEFAULT_LIMIT = 7;
const CANDIDATE_LIMIT = 50;
const BRANCH_CANDIDATE_LIMIT = 5000;
const BRANCH_RESULT_LIMIT = 3;
const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 220;

// Pre-baked top ~200 active banks by asset size — see scripts/build-fdic-epic-popular-banks.mjs.
// We match against this list locally before falling through to the live API
// so the head of the distribution returns instantly without a network round-trip.
const POPULAR_BANKS_URL = "popular-banks.json";
// If the local match against the top-200 list returns at least one true
// match (Number.isFinite score), use the local results and skip the live
// API entirely. The user can still refine by typing more if they're after
// a long-tail bank not in the popular list.
const POPULAR_BANKS_LOCAL_THRESHOLD = 1;
let popularBanksPromise = null;

function loadPopularBanks() {
  if (!popularBanksPromise) {
    popularBanksPromise = fetch(POPULAR_BANKS_URL, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error("popular-banks.json missing");
        return response.json();
      })
      .then((payload) => (Array.isArray(payload?.banks) ? payload.banks : []))
      .catch(() => {
        // Reset the promise so a future call can retry; but never throw —
        // the live API is the fallback path.
        popularBanksPromise = null;
        return [];
      });
  }
  return popularBanksPromise;
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function formatBankLabel(bank) {
  if (!bank) return "";
  return bank.cert ? `${bank.name} (Cert ${bank.cert})` : bank.name;
}

function formatBankMeta(bank) {
  const mainOfficeLocation = bank.city && bank.state ? `${bank.city}, ${bank.state}` : bank.city || bank.state || "";
  return [
    mainOfficeLocation ? `Main office: ${mainOfficeLocation}` : "",
    bank.website ? `Website: ${bank.website}` : "",
    bank.cert ? `Cert ${bank.cert}` : "",
    bank.active ? "Active" : "Inactive",
  ].filter(Boolean).join(" | ");
}

function formatBranchAddress(branch) {
  return [
    branch.address,
    [branch.city, branch.state].filter(Boolean).join(", "),
    branch.zip,
  ].filter(Boolean).join(" ");
}

function formatDistance(miles) {
  if (!Number.isFinite(miles)) return "";
  return miles < 10 ? `${miles.toFixed(1)} miles away` : `${Math.round(miles)} miles away`;
}

function getDistanceMiles(origin, branch) {
  const lat = Number(branch.latitude);
  const lon = Number(branch.longitude);
  if (!Number.isFinite(origin.latitude) || !Number.isFinite(origin.longitude) || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return Number.POSITIVE_INFINITY;
  }

  const toRadians = (degrees) => degrees * Math.PI / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(lat - origin.latitude);
  const deltaLon = toRadians(lon - origin.longitude);
  const originLat = toRadians(origin.latitude);
  const branchLat = toRadians(lat);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(originLat) * Math.cos(branchLat) * Math.sin(deltaLon / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mapInstitutionRecord(record) {
  const data = record?.data || {};
  return {
    name: data.NAME || "",
    cert: data.CERT != null ? String(data.CERT) : "",
    city: data.CITY || "",
    state: data.STALP || "",
    active: Number(data.ACTIVE) === 1,
    website: data.WEBADDR || "",
    mainOffice: data.MAINOFF || "",
    regulator: data.REGAGNT || "",
    asset: Number(data.ASSET) || 0,
  };
}

function mapLocationRecord(record) {
  const data = record?.data || {};
  return {
    officeName: data.OFFNAME || "",
    bankName: data.NAME || "",
    cert: data.CERT != null ? String(data.CERT) : "",
    address: data.ADDRESS || "",
    city: data.CITY || "",
    state: data.STALP || "",
    zip: data.ZIP || "",
    latitude: Number(data.LATITUDE),
    longitude: Number(data.LONGITUDE),
    mainOffice: Number(data.MAINOFF) === 1,
  };
}

export class FDICBankSelector extends HTMLElement {
  static get observedAttributes() {
    return ["label", "input-id", "placeholder", "description", "required"];
  }

  constructor() {
    super();
    this._didRender = false;
    this._searchTimer = null;
    this._searchController = null;
    this._options = [];
    this._activeIndex = -1;
    this._open = false;
    this._selectedBank = null;
    this._branchSearchController = null;
    this._elements = {};
    this._boundOutsideClick = this._handleOutsideClick.bind(this);
  }

  connectedCallback() {
    if (!this._didRender) {
      this._render();
      this._bindEvents();
      this._didRender = true;
    }

    document.addEventListener("click", this._boundOutsideClick);
  }

  disconnectedCallback() {
    if (this._searchTimer) {
      window.clearTimeout(this._searchTimer);
      this._searchTimer = null;
    }
    if (this._searchController) {
      this._searchController.abort();
      this._searchController = null;
    }
    if (this._branchSearchController) {
      this._branchSearchController.abort();
      this._branchSearchController = null;
    }
    document.removeEventListener("click", this._boundOutsideClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._didRender || oldValue === newValue) return;

    if ((name === "label" || name === "required") && this._elements.label) {
      this._elements.label.innerHTML = `${escapeHtml(this.labelText)}${this.required ? ' <span class="report-required-marker" aria-hidden="true">*</span>' : ""}`;
    }

    if (name === "placeholder" && this._elements.input) {
      this._elements.input.setAttribute("placeholder", this.placeholderText);
    }

    if (name === "description" && this._elements.description) {
      const hasDescription = Boolean(this.descriptionText);
      this._elements.description.textContent = this.descriptionText;
      this._elements.description.hidden = !hasDescription;
    }

    if (name === "required" && this._elements.input) {
      this._elements.input.toggleAttribute("required", this.required);
      this._elements.input.setAttribute("aria-required", this.required ? "true" : "false");
    }
  }

  get required() {
    return this.hasAttribute("required");
  }

  get includeInactive() {
    return this.hasAttribute("include-inactive");
  }

  get labelText() {
    return this.getAttribute("label") || "Bank name or FDIC certificate number";
  }

  get placeholderText() {
    return this.getAttribute("placeholder") || "Start typing a bank name or enter an exact certificate number";
  }

  get descriptionText() {
    return this.getAttribute("description") || "";
  }

  get resultLimit() {
    const raw = Number.parseInt(this.getAttribute("limit") || "", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_LIMIT;
  }

  get minQueryLength() {
    const raw = Number.parseInt(this.getAttribute("min-query-length") || "", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : MIN_QUERY_LENGTH;
  }

  get selectedBank() {
    return this._selectedBank ? { ...this._selectedBank } : null;
  }

  get value() {
    return this._elements.input?.value || "";
  }

  set value(nextValue) {
    if (this._elements.input instanceof HTMLInputElement) {
      this._elements.input.value = typeof nextValue === "string" ? nextValue : "";
      this._selectedBank = null;
    }
  }

  setSelectedBank(bank) {
    if (!(this._elements.input instanceof HTMLInputElement) || !bank || !bank.name) return;
    this._selectedBank = { ...bank };
    this._elements.input.value = formatBankLabel(bank);
    this._resetBranchLookup();
    this._renderBranchLookup();
  }

  clear() {
    if (!(this._elements.input instanceof HTMLInputElement)) return;
    this._elements.input.value = "";
    this._selectedBank = null;
    this._resetBranchLookup();
    this._renderBranchLookup();
    this._renderInstructionState();
    this._closeListbox();
    this.dispatchEvent(new CustomEvent("fdic-bank-clear", {
      bubbles: true,
      detail: { reason: "programmatic" },
    }));
  }

  _render() {
    const inputId = this.getAttribute("input-id") || `fdic-bank-selector-${Math.random().toString(36).slice(2, 10)}`;
    const listboxId = `${inputId}-listbox`;
    const statusId = `${inputId}-status`;
    const descriptionId = `${inputId}-description`;
    const branchRegionId = `${inputId}-branch-lookup`;
    const branchZipId = `${inputId}-branch-zip`;
    const branchStatusId = `${inputId}-branch-status`;
    const ariaDescribedBy = this.descriptionText ? ` aria-describedby="${descriptionId}"` : "";

    this.classList.add("fdic-bank-selector");
    this.innerHTML = `
      <div class="report-inline-grid__full">
        <label class="report-label report-label--compact" for="${escapeHtml(inputId)}">
          ${escapeHtml(this.labelText)}${this.required ? ' <span class="report-required-marker" aria-hidden="true">*</span>' : ""}
        </label>
        <p id="${escapeHtml(descriptionId)}" class="report-subcopy report-subcopy--tight"${this.descriptionText ? "" : " hidden"}>${escapeHtml(this.descriptionText)}</p>
        <div class="combobox-wrapper">
          <div class="combobox-input-row">
            <input
              id="${escapeHtml(inputId)}"
              class="report-input"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="false"
              aria-controls="${escapeHtml(listboxId)}"
              aria-activedescendant=""
              placeholder="${escapeHtml(this.placeholderText)}"
              autocomplete="off"
              spellcheck="false"
              ${this.required ? 'required aria-required="true"' : ""}
              ${ariaDescribedBy}
            />
            <button
              type="button"
              class="combobox-toggle"
              aria-label="Show bank search guidance"
              aria-expanded="false"
              aria-controls="${escapeHtml(listboxId)}"
              tabindex="-1"
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor"><path d="M8 10.94 3.53 6.47a.75.75 0 0 1 1.06-1.06L8 8.82l3.41-3.41a.75.75 0 1 1 1.06 1.06L8 10.94Z"/></svg>
            </button>
          </div>
          <ul id="${escapeHtml(listboxId)}" class="combobox-listbox" role="listbox" aria-label="Bank matches" hidden></ul>
          <div id="${escapeHtml(statusId)}" class="visually-hidden" role="status" aria-live="polite"></div>
        </div>
        <div id="${escapeHtml(branchRegionId)}" class="bank-branch-lookup" hidden>
          <div class="bank-branch-lookup__header">
            <p class="bank-branch-lookup__title">Want to confirm with a nearby branch?</p>
            <p class="bank-branch-lookup__copy">Nearby branches can help confirm you selected the right bank. Your submission will include the selected legal institution, not a branch location. Browser location is used only if you choose that option.</p>
          </div>
          <div class="bank-branch-lookup__controls">
            <button type="button" class="bank-branch-lookup__button" data-branch-action="location">Use my location</button>
            <div class="bank-branch-lookup__zip">
              <label class="visually-hidden" for="${escapeHtml(branchZipId)}">ZIP code</label>
              <input id="${escapeHtml(branchZipId)}" class="report-input bank-branch-lookup__input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="5" placeholder="ZIP code" autocomplete="postal-code" />
              <button type="button" class="bank-branch-lookup__button bank-branch-lookup__button--secondary" data-branch-action="zip">Find nearest</button>
            </div>
          </div>
          <div id="${escapeHtml(branchStatusId)}" class="bank-branch-lookup__status" role="status" aria-live="polite"></div>
          <ul class="bank-branch-lookup__results" role="list"></ul>
        </div>
      </div>
    `;

    this._elements = {
      label: this.querySelector("label"),
      input: this.querySelector("input[role='combobox']"),
      toggle: this.querySelector(".combobox-toggle"),
      listbox: this.querySelector(".combobox-listbox"),
      status: this.querySelector(`#${escapeCssSelector(statusId)}`),
      description: this.querySelector(`#${escapeCssSelector(descriptionId)}`),
      branchLookup: this.querySelector(`#${escapeCssSelector(branchRegionId)}`),
      branchZip: this.querySelector(`#${escapeCssSelector(branchZipId)}`),
      branchStatus: this.querySelector(`#${escapeCssSelector(branchStatusId)}`),
      branchResults: this.querySelector(".bank-branch-lookup__results"),
      branchLocationButton: this.querySelector("[data-branch-action='location']"),
      branchZipButton: this.querySelector("[data-branch-action='zip']"),
    };
  }

  _bindEvents() {
    const { input, toggle, listbox, branchLocationButton, branchZipButton, branchZip } = this._elements;
    if (!(input instanceof HTMLInputElement) || !(toggle instanceof HTMLButtonElement) || !(listbox instanceof HTMLElement)) {
      return;
    }

    toggle.addEventListener("click", () => {
      if (this._open) {
        this._closeListbox();
      } else {
        this._renderInstructionState();
        this._setExpanded(true);
      }
      input.focus();
    });

    // Pre-warm the popular-banks index so the first keystroke can match locally
    // without waiting on a network round-trip.
    input.addEventListener("focus", () => { loadPopularBanks(); }, { once: true });

    input.addEventListener("input", () => {
      if (this._selectedBank && input.value !== formatBankLabel(this._selectedBank)) {
        this._selectedBank = null;
        this._resetBranchLookup();
        this._renderBranchLookup();
      }

      this.dispatchEvent(new Event("input", { bubbles: true }));
      this._queueSearch(input.value);
    });

    input.addEventListener("keydown", (event) => {
      if (!this._open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        event.preventDefault();
        if (this._options.length) {
          this._setExpanded(true);
          this._activeIndex = event.key === "ArrowDown" ? 0 : this._options.length - 1;
          this._syncActiveOption();
        } else {
          this._queueSearch(input.value);
        }
        return;
      }

      if (!this._open) return;

      const optionCount = this._options.length;
      if (!optionCount && event.key !== "Escape" && event.key !== "Tab") return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        this._activeIndex = this._activeIndex < optionCount - 1 ? this._activeIndex + 1 : 0;
        this._syncActiveOption();
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        this._activeIndex = this._activeIndex > 0 ? this._activeIndex - 1 : optionCount - 1;
        this._syncActiveOption();
        return;
      }

      if (event.key === "Enter") {
        if (this._activeIndex >= 0) {
          event.preventDefault();
          this._selectOption(this._activeIndex);
        }
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        this._closeListbox();
        return;
      }

      if (event.key === "Tab") {
        this._closeListbox();
      }
    });

    listbox.addEventListener("pointerdown", (event) => {
      event.preventDefault();
    });

    listbox.addEventListener("click", (event) => {
      const option = event.target instanceof Element ? event.target.closest("[role='option']") : null;
      if (!(option instanceof HTMLElement)) return;
      const index = Number.parseInt(option.dataset.optionIndex || "", 10);
      if (Number.isFinite(index)) {
        this._selectOption(index);
      }
    });

    if (branchLocationButton instanceof HTMLButtonElement) {
      branchLocationButton.addEventListener("click", () => this._findBranchesNearBrowserLocation());
    }

    if (branchZipButton instanceof HTMLButtonElement) {
      branchZipButton.addEventListener("click", () => this._findBranchesByZip());
    }

    if (branchZip instanceof HTMLInputElement) {
      branchZip.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this._findBranchesByZip();
        }
      });
    }
  }

  _handleOutsideClick(event) {
    if (!this._open || !(event.target instanceof Node)) return;
    if (!this.contains(event.target)) {
      this._closeListbox();
    }
  }

  _queueSearch(rawValue) {
    const query = normalizeWhitespace(rawValue);
    if (this._searchTimer) {
      window.clearTimeout(this._searchTimer);
      this._searchTimer = null;
    }

    if (!query) {
      this._renderInstructionState();
      this._setExpanded(true);
      return;
    }

    const digitsOnly = /^\d+$/.test(query);
    if (!digitsOnly && tokenizeBankSearchText(query).join("").length < this.minQueryLength) {
      this._renderInstructionState(`Type at least ${this.minQueryLength} letters to search by bank name, or enter a full certificate number.`);
      this._setExpanded(true);
      return;
    }

    this._searchTimer = window.setTimeout(() => {
      this._searchBanks(query);
    }, SEARCH_DEBOUNCE_MS);
  }

  async _searchBanks(query) {
    const filterVariants = buildInstitutionFilterVariants(query, this.includeInactive);
    if (!filterVariants.length) {
      this._renderInstructionState();
      this._setExpanded(true);
      return;
    }

    if (this._searchController) {
      this._searchController.abort();
    }

    this._searchController = new AbortController();
    this._setExpanded(true);

    // Try the pre-baked top-200 banks first. Skip for digit-only (cert) queries
    // since most of the long tail of certs are not in the popular list.
    const digitsOnlyQuery = /^\d+$/.test(normalizeWhitespace(query));
    const localSearchController = this._searchController;
    if (!digitsOnlyQuery) {
      const popular = await loadPopularBanks();
      // The popular-banks fetch is async; by the time it resolves, the user
      // may have typed something else (which aborted this search and started
      // a new one). Bail out so we don't paint stale results over the new query.
      if (localSearchController.signal.aborted || this._searchController !== localSearchController) {
        return;
      }
      if (popular.length) {
        // rankInstitutionOptions sorts but does not filter, so a popular bank
        // that doesn't match the query gets a Number.POSITIVE_INFINITY score
        // and would still slip into the top N. Pre-filter by score so the
        // local path only returns true matches.
        const matches = popular.filter((bank) => Number.isFinite(scoreBankMatch(bank, query)));
        const localOptions = rankInstitutionOptions(matches, query, this.resultLimit);
        if (localOptions.length >= POPULAR_BANKS_LOCAL_THRESHOLD) {
          this._renderOptions(localOptions, query);
          this._setStatus(
            `${localOptions.length} bank suggestion${localOptions.length === 1 ? "" : "s"} available. Use arrow keys to navigate.`,
          );
          return;
        }
      }
    }

    this._renderStatusMessage("Searching FDIC bank records...");
    this._setStatus("Searching FDIC bank records...");

    try {
      const payloads = await Promise.all(filterVariants.map(async (filters) => {
        const params = new URLSearchParams({
          filters,
          fields: BANKFIND_FIELDS.join(","),
          limit: String(Math.max(this.resultLimit, CANDIDATE_LIMIT)),
          offset: "0",
          sort_by: "NAME",
          sort_order: "ASC",
        });

        const response = await fetch(`${BANKFIND_API_URL}?${params.toString()}`, {
          signal: this._searchController.signal,
        });

        if (!response.ok) {
          throw new Error(`BankFind lookup failed with status ${response.status}`);
        }

        return response.json();
      }));

      const candidatesByCert = new Map();
      payloads.forEach((payload) => {
        const candidates = Array.isArray(payload?.data) ? payload.data.map(mapInstitutionRecord).filter((bank) => bank.name) : [];
        candidates.forEach((bank) => {
          candidatesByCert.set(bank.cert || bank.name, bank);
        });
      });

      const candidates = [...candidatesByCert.values()];
      const options = rankInstitutionOptions(candidates, query, this.resultLimit);
      this._renderOptions(options, query);
      this._setStatus(
        options.length
          ? `${options.length} bank suggestion${options.length === 1 ? "" : "s"} available. Use arrow keys to navigate.`
          : "No matching banks found."
      );
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Unable to load BankFind institutions:", error);
      this._renderStatusMessage("We could not load BankFind suggestions right now. You can keep typing or try again.");
      this._setStatus("BankFind suggestions are currently unavailable.");
    }
  }

  _renderInstructionState(message = `Type at least ${this.minQueryLength} letters to search by bank name, or enter a full certificate number.`) {
    this._renderStatusMessage(message);
    this._setStatus(message);
  }

  _renderStatusMessage(message) {
    this._options = [];
    this._activeIndex = -1;
    const { listbox } = this._elements;
    if (!(listbox instanceof HTMLElement)) return;
    listbox.textContent = "";
    const statusItem = document.createElement("li");
    statusItem.className = "combobox-listbox-status";
    statusItem.setAttribute("role", "presentation");
    statusItem.textContent = message;
    listbox.appendChild(statusItem);
    this._syncActiveOption();
  }

  _renderOptions(options, queryText = "") {
    this._options = options;
    this._activeIndex = -1;

    const { listbox } = this._elements;
    if (!(listbox instanceof HTMLElement)) return;

    listbox.textContent = "";

    if (!options.length) {
      const noResultsMessage = /^\d+$/.test(normalizeWhitespace(queryText))
        ? "No bank matched that certificate number. Certificate searches require the full exact number."
        : "No banks matched that search. Try a broader name or a full certificate number.";
      this._renderStatusMessage(noResultsMessage);
      return;
    }

    options.forEach((bank, index) => {
      const item = document.createElement("li");
      item.id = `${this._elements.input.id}-option-${index}`;
      item.className = "combobox-option";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", "false");
      item.dataset.optionIndex = String(index);

      const title = document.createElement("span");
      title.className = "combobox-option__title";
      title.textContent = bank.name;
      item.appendChild(title);

      const meta = document.createElement("span");
      meta.className = "combobox-option__meta";
      meta.textContent = formatBankMeta(bank);
      item.appendChild(meta);

      listbox.appendChild(item);
    });

    this._syncActiveOption();
  }

  _selectOption(index) {
    const bank = this._options[index];
    if (!bank || !(this._elements.input instanceof HTMLInputElement)) return;

    this._selectedBank = { ...bank };
    this._elements.input.value = formatBankLabel(bank);
    this._resetBranchLookup();
    this._renderBranchLookup();
    this._closeListbox();
    this._setStatus(`Selected ${bank.name}.`);
    this._elements.input.focus();

    this.dispatchEvent(new CustomEvent("fdic-bank-select", {
      bubbles: true,
      detail: {
        bank: { ...bank },
        value: this._elements.input.value,
      },
    }));
    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  _setExpanded(expanded) {
    this._open = expanded;
    const { input, toggle, listbox } = this._elements;
    if (input instanceof HTMLElement) {
      input.setAttribute("aria-expanded", String(expanded));
    }
    if (toggle instanceof HTMLElement) {
      toggle.setAttribute("aria-expanded", String(expanded));
    }
    if (listbox instanceof HTMLElement) {
      listbox.hidden = !expanded;
    }
  }

  _closeListbox() {
    this._activeIndex = -1;
    this._setExpanded(false);
    this._syncActiveOption();
  }

  _syncActiveOption() {
    const { input, listbox } = this._elements;
    if (!(input instanceof HTMLElement) || !(listbox instanceof HTMLElement)) return;

    const options = listbox.querySelectorAll("[role='option']");
    if (this._activeIndex >= 0) {
      input.setAttribute("aria-activedescendant", `${input.id}-option-${this._activeIndex}`);
    } else {
      input.setAttribute("aria-activedescendant", "");
    }

    options.forEach((option, index) => {
      option.setAttribute("aria-selected", index === this._activeIndex ? "true" : "false");
      if (index === this._activeIndex) {
        option.scrollIntoView({ block: "nearest" });
      }
    });
  }

  _setStatus(message) {
    if (this._elements.status instanceof HTMLElement) {
      this._elements.status.textContent = message;
    }
  }

  _renderBranchLookup() {
    if (this._elements.branchLookup instanceof HTMLElement) {
      this._elements.branchLookup.hidden = !this._selectedBank?.cert;
    }
  }

  _resetBranchLookup() {
    if (this._branchSearchController) {
      this._branchSearchController.abort();
      this._branchSearchController = null;
    }
    if (this._elements.branchStatus instanceof HTMLElement) {
      this._elements.branchStatus.textContent = "";
    }
    if (this._elements.branchResults instanceof HTMLElement) {
      this._elements.branchResults.textContent = "";
    }
  }

  _setBranchStatus(message) {
    if (this._elements.branchStatus instanceof HTMLElement) {
      this._elements.branchStatus.textContent = message;
    }
  }

  _setBranchControlsDisabled(disabled) {
    [this._elements.branchLocationButton, this._elements.branchZipButton, this._elements.branchZip].forEach((control) => {
      if (control instanceof HTMLButtonElement || control instanceof HTMLInputElement) {
        control.disabled = disabled;
      }
    });
  }

  async _fetchLocationRecords(filters, limit = BRANCH_RESULT_LIMIT) {
    if (this._branchSearchController) {
      this._branchSearchController.abort();
    }

    this._branchSearchController = new AbortController();
    const params = new URLSearchParams({
      filters,
      fields: BANKFIND_LOCATION_FIELDS.join(","),
      limit: String(limit),
      offset: "0",
      sort_by: "NAME",
      sort_order: "ASC",
    });

    const response = await fetch(`${BANKFIND_LOCATIONS_API_URL}?${params.toString()}`, {
      signal: this._branchSearchController.signal,
    });

    if (!response.ok) {
      throw new Error(`BankFind branch lookup failed with status ${response.status}`);
    }

    const payload = await response.json();
    return Array.isArray(payload?.data) ? payload.data.map(mapLocationRecord).filter((branch) => branch.address) : [];
  }

  async _fetchBranches(filters, limit = BRANCH_RESULT_LIMIT) {
    if (!this._selectedBank?.cert) return [];
    return this._fetchLocationRecords(filters, limit);
  }

  async _getZipOrigin(zip) {
    const locations = await this._fetchLocationRecords(`ZIP:${zip}`, 25);
    const coordinates = locations
      .map((location) => ({
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      }))
      .filter((location) => Number.isFinite(location.latitude) && Number.isFinite(location.longitude));

    if (!coordinates.length) return null;

    return {
      latitude: coordinates.reduce((sum, location) => sum + location.latitude, 0) / coordinates.length,
      longitude: coordinates.reduce((sum, location) => sum + location.longitude, 0) / coordinates.length,
    };
  }

  async _findBranchesNearBrowserLocation() {
    if (!this._selectedBank?.cert) return;
    if (!navigator.geolocation) {
      this._setBranchStatus("Your browser does not support location lookup. Enter a ZIP code instead.");
      return;
    }

    this._resetBranchLookup();
    this._setBranchStatus("Waiting for your browser location permission...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const origin = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        this._setBranchControlsDisabled(true);
        this._setBranchStatus("Finding nearby branches...");

        try {
          const branches = await this._fetchBranches(`CERT:${this._selectedBank.cert}`, BRANCH_CANDIDATE_LIMIT);
          const nearestBranches = branches
            .map((branch) => ({ ...branch, distance: getDistanceMiles(origin, branch) }))
            .filter((branch) => Number.isFinite(branch.distance))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, BRANCH_RESULT_LIMIT);

          this._renderBranchResults(nearestBranches, nearestBranches.length ? "Nearby branches for confirmation." : "No branch coordinates were available for this bank.");
        } catch (error) {
          if (error.name === "AbortError") return;
          console.error("Unable to load BankFind branch locations:", error);
          this._setBranchStatus("We could not load branch locations right now. Try a ZIP code or search again later.");
        } finally {
          this._setBranchControlsDisabled(false);
        }
      },
      () => {
        this._setBranchStatus("Location permission was not shared. Enter a ZIP code instead.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  async _findBranchesByZip() {
    if (!this._selectedBank?.cert || !(this._elements.branchZip instanceof HTMLInputElement)) return;
    const zip = normalizeWhitespace(this._elements.branchZip.value).match(/\d{5}/)?.[0] || "";

    this._resetBranchLookup();
    if (!zip) {
      this._setBranchStatus("Enter a 5-digit ZIP code.");
      this._elements.branchZip.focus();
      return;
    }

    this._setBranchControlsDisabled(true);
    this._setBranchStatus(`Finding nearest branches to ${zip}...`);

    try {
      const origin = await this._getZipOrigin(zip);
      if (!origin) {
        this._setBranchStatus(`We could not find location data for ZIP ${zip}. Try a nearby ZIP code or use browser location.`);
        return;
      }

      const branches = await this._fetchBranches(`CERT:${this._selectedBank.cert}`, BRANCH_CANDIDATE_LIMIT);
      const nearestBranches = branches
        .map((branch) => ({ ...branch, distance: getDistanceMiles(origin, branch) }))
        .filter((branch) => Number.isFinite(branch.distance))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, BRANCH_RESULT_LIMIT);

      this._renderBranchResults(
        nearestBranches,
        nearestBranches.length
          ? `Nearby branches for confirmation near ${zip}.`
          : "No branch coordinates were available for this bank.",
      );
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Unable to load BankFind branch locations:", error);
      this._setBranchStatus("We could not load branch locations right now. Try again later.");
    } finally {
      this._setBranchControlsDisabled(false);
    }
  }

  _renderBranchResults(branches, message) {
    this._setBranchStatus(message);
    if (!(this._elements.branchResults instanceof HTMLElement)) return;
    this._elements.branchResults.textContent = "";

    branches.forEach((branch) => {
      const item = document.createElement("li");
      item.className = "bank-branch-lookup__result";

      const title = document.createElement("span");
      title.className = "bank-branch-lookup__result-title";
      title.textContent = branch.officeName || (branch.mainOffice ? "Main office" : "Branch");
      item.appendChild(title);

      const details = document.createElement("span");
      details.className = "bank-branch-lookup__result-meta";
      details.textContent = [formatBranchAddress(branch), formatDistance(branch.distance)].filter(Boolean).join(" | ");
      item.appendChild(details);

      this._elements.branchResults.appendChild(item);
    });
  }
}

if (!customElements.get("fdic-bank-selector")) customElements.define("fdic-bank-selector", FDICBankSelector);
