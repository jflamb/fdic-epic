import { ROUTES } from "./routes.js";

export class FDICSupportNav extends HTMLElement {
  connectedCallback() {
    if (this.innerHTML.trim()) return;
    const active = this.getAttribute("active") || "";
    const getPath = (href) => {
      if (!href) return "";
      try {
        const parsed = new URL(href, window.location.href);
        const current = new URL(window.location.href);
        if (parsed.origin === current.origin) {
          return parsed.pathname.split("/").pop() || "";
        }
      } catch {
        // Fall through to query-stripping fallback.
      }
      return href.split("?")[0];
    };
    const activePath = getPath(active);
    const items = [
      { label: "Information & Support Center", href: ROUTES.home },
      { label: "Frequently Asked Questions", href: ROUTES.faq },
      { label: "View My Cases", href: ROUTES.viewCases },
    ];

    const hasDraft = Boolean(sessionStorage.getItem("fdicSupportIntakeLiveDraft"));
    const showLoginGovAction = activePath !== getPath(ROUTES.viewCases);

    /* All values below are hardcoded constants — no user input in the template */
    this.innerHTML = `<nav class="support-sidenav" aria-label="Support navigation">${items
      .map((item) => {
        const selected = getPath(item.href) === activePath;
        const draftClass = selected && hasDraft ? " has-draft" : "";
        return `<a class="support-nav-item${selected ? " selected" : ""}${draftClass}" href="${item.href}"${selected ? ' aria-current="page"' : ""}>${item.label}</a>`;
      })
      .join("")}</nav>${
      showLoginGovAction
        ? `<div class="support-login-gov-action">
            <a class="login-gov-button login-gov-button--secondary login-gov-button--sidebar" href="${ROUTES.viewCases}">Sign in with Login.gov</a>
          </div>`
        : ""
    }`;
  }
}

if (!customElements.get("fdic-support-nav")) customElements.define("fdic-support-nav", FDICSupportNav);
