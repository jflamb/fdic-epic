import { ROUTES } from "./routes.js";

const LOGIN_GOV_PROTOTYPE_AUTH_KEY = "fdicLoginGovPrototypeSignedIn";

export class FDICSupportNav extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
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
    const isSignedIn = sessionStorage.getItem(LOGIN_GOV_PROTOTYPE_AUTH_KEY) === "true";
    /* All values below are hardcoded constants — no user input in the template */
    this.innerHTML = `<nav class="support-sidenav" aria-label="Support navigation">${items
      .map((item) => {
        const selected = getPath(item.href) === activePath;
        const draftClass = selected && hasDraft ? " has-draft" : "";
        return `<a class="support-nav-item${selected ? " selected" : ""}${draftClass}" href="${item.href}"${selected ? ' aria-current="page"' : ""}>${item.label}</a>`;
      })
      .join("")}</nav>${
      isSignedIn
        ? `<div class="support-login-gov-action">
            <button type="button" class="support-login-gov-action__button" data-login-gov-signout>Sign out</button>
          </div>`
        : activePath !== getPath(ROUTES.viewCases)
          ? `<div class="support-login-gov-action">
            <button
              type="button"
              class="login-gov-button login-gov-button--secondary login-gov-button--sidebar"
              aria-expanded="false"
              aria-controls="login-gov-dialog-shared"
              data-login-gov-stub="sidebar"
            >
              Sign in with Login.gov
            </button>
          </div>`
          : ""
    }`;
  }
}

if (!customElements.get("fdic-support-nav")) customElements.define("fdic-support-nav", FDICSupportNav);
