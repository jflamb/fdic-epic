import { parseJsonAttribute, escapeHtml, externalLinkAttrs } from "./utils.js";

export class FDICBreadcrumb extends HTMLElement {
  connectedCallback() {
    if (this.innerHTML.trim()) return;
    const crumbs = parseJsonAttribute(this.getAttribute("crumbs"), []);
    const items = crumbs
      .map((crumb) => {
        const label = escapeHtml(crumb?.label || "");
        if (crumb?.href) {
          return `<li class="fdic-breadcrumb__item"><a class="fdic-breadcrumb__item__link" href="${escapeHtml(crumb.href)}"${externalLinkAttrs(crumb.href)}>${label}</a></li>`;
        }
        return `<li class="fdic-breadcrumb__item"><span aria-current="page">${label}</span></li>`;
      })
      .join("");

    this.innerHTML = `<nav class="fdic-breadcrumb" aria-label="Breadcrumb"><ol class="fdic-breadcrumb__list">${items}</ol></nav>`;
  }
}

if (!customElements.get("fdic-breadcrumb")) customElements.define("fdic-breadcrumb", FDICBreadcrumb);
