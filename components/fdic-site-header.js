export class FDICSiteHeader extends HTMLElement {
  connectedCallback() {
    if (this.innerHTML.trim()) return;
    this.innerHTML = `<header class="usa-header usa-header--basic" role="banner">
      <div class="grid-container header-inner">
        <div class="usa-logo site-logo" id="logo">
          <a class="logo-img" href="https://www.fdic.gov" target="_blank" rel="noopener noreferrer" aria-label="FDIC Home">
            <img src="https://www.fdic.gov/themes/custom/fdic_theme/fdic-logo-white-noseal.svg" alt="" />
          </a>
        </div>
        <nav class="tbm tbm-main tbm-no-arrows" id="tbm-main" aria-label="Main navigation">
          <ul class="tbm-nav level-0 items-4">
            <li class="tbm-item level-1"><a class="tbm-link level-1" href="https://www.fdic.gov/about" target="_blank" rel="noopener noreferrer">About</a></li>
            <li class="tbm-item level-1"><a class="tbm-link level-1" href="https://www.fdic.gov/resources" target="_blank" rel="noopener noreferrer">Resources</a></li>
            <li class="tbm-item level-1"><a class="tbm-link level-1" href="https://www.fdic.gov/analysis" target="_blank" rel="noopener noreferrer">Analysis</a></li>
            <li class="tbm-item level-1"><a class="tbm-link level-1" href="https://www.fdic.gov/news" target="_blank" rel="noopener noreferrer">News</a></li>
          </ul>
        </nav>
      </div>
    </header>`;
  }
}

if (!customElements.get("fdic-site-header")) customElements.define("fdic-site-header", FDICSiteHeader);
