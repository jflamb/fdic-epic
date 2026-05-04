const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 320 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91V134.6c0-25.35 12.42-50.06 52.24-50.06h40.42V5.49S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>',
  x: '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9L389.2 48zm-24.8 373.8h39.1L151.1 88h-42l255.3 333.8z"/></svg>',
  instagram: '<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1S3.3 127.7 1.6 163.5c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>',
  linkedin: '<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></svg>',
  youtube: '<svg viewBox="0 0 576 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597C14.85 167.249 14.85 256 14.85 256s0 88.751 11.495 131.917c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-12.262c23.497-6.321 42.003-24.171 48.284-47.821C561.15 344.751 561.15 256 561.15 256s0-88.751-11.495-131.917zM232.145 337.591V174.409l142.739 81.591-142.739 81.591z"/></svg>',
};

export class FDICSiteFooter extends HTMLElement {
  connectedCallback() {
    if (this.innerHTML.trim()) return;
    this.innerHTML = `<footer class="usa-footer usa-footer--medium">
      <div class="footer-primary">
        <div class="grid-container footer-primary-grid">
          <section class="footer-col footer-col-contact">
            <p class="footer-title">CONTACT THE FDIC</p>
            <a class="usa-button" href="https://www.fdic.gov/contact" target="_blank" rel="noopener noreferrer">Contact Us</a>
          </section>
          <section class="footer-col footer-col-subscribe">
            <p class="footer-title">STAY INFORMED</p>
            <form class="subscribe-form" action="https://public.govdelivery.com/accounts/USFDIC/subscribers/qualify" method="post" target="_blank">
              <label class="subscribe-input-wrap"><span class="visually-hidden">Enter your email address</span><input name="email" type="email" placeholder="Enter your email address:" /></label>
              <button class="usa-button" type="submit">Subscribe</button>
            </form>
            <div class="footer-social" aria-label="Social media">
              <a class="footer-social-link" href="https://www.facebook.com/FDICgov/" target="_blank" rel="noopener noreferrer" aria-label="FDIC on Facebook">${SOCIAL_ICONS.facebook}</a>
              <a class="footer-social-link" href="https://x.com/FDICgov" target="_blank" rel="noopener noreferrer" aria-label="FDIC on X">${SOCIAL_ICONS.x}</a>
              <a class="footer-social-link" href="https://www.instagram.com/fdicgov/" target="_blank" rel="noopener noreferrer" aria-label="FDIC on Instagram">${SOCIAL_ICONS.instagram}</a>
              <a class="footer-social-link" href="https://www.linkedin.com/company/fdic/" target="_blank" rel="noopener noreferrer" aria-label="FDIC on LinkedIn">${SOCIAL_ICONS.linkedin}</a>
              <a class="footer-social-link" href="https://www.youtube.com/user/FDICchannel" target="_blank" rel="noopener noreferrer" aria-label="FDIC on YouTube">${SOCIAL_ICONS.youtube}</a>
            </div>
          </section>
          <section class="footer-col footer-col-help">
            <p class="footer-title">HOW CAN WE HELP YOU?</p>
            <div class="footer-faux-selects" aria-label="Help options">
              <button class="footer-faux-select" type="button" aria-label="I am a..." aria-disabled="true" tabindex="-1">
                <span class="footer-faux-select-label">I am a ...</span>
                <span class="footer-faux-select-caret" aria-hidden="true">&#8964;</span>
              </button>
              <button class="footer-faux-select" type="button" aria-label="I want to..." aria-disabled="true" tabindex="-1">
                <span class="footer-faux-select-label">I want to...</span>
                <span class="footer-faux-select-caret" aria-hidden="true">&#8964;</span>
              </button>
            </div>
            <a class="usa-button" href="https://ask.fdic.gov/fdicinformationandsupportcenter/s/?language=en_US" target="_blank" rel="noopener noreferrer">Get Started</a>
          </section>
        </div>
      </div>

      <div class="footer-secondary">
        <div class="grid-container">
          <nav class="footer-secondary-menu" aria-label="Footer Secondary Menu">
            <ul class="menu menu--footer-secondary-menu nav">
              <li><a href="https://www.fdic.gov/about/website-policies" target="_blank" rel="noopener noreferrer">Policies</a></li>
              <li><a href="https://www.fdic.gov/help" target="_blank" rel="noopener noreferrer">Help</a></li>
              <li><a href="https://www.fdic.gov/foia" target="_blank" rel="noopener noreferrer">FOIA</a></li>
              <li><a href="https://www.fdic.gov/espanol" target="_blank" rel="noopener noreferrer">En Español</a></li>
              <li><a href="https://www.fdic.gov/about/fdic-accessibility-statement" target="_blank" rel="noopener noreferrer">Accessibility</a></li>
              <li><a href="https://www.fdic.gov/about/open-government" target="_blank" rel="noopener noreferrer">Open Government</a></li>
              <li><a href="https://www.usa.gov" target="_blank" rel="noopener noreferrer">usa.gov</a></li>
              <li><a href="https://www.fdic.gov/about/contact-fdic" target="_blank" rel="noopener noreferrer">Contact Us</a></li>
              <li><a href="https://www.fdic.gov/about/privacy-program" target="_blank" rel="noopener noreferrer">Privacy</a></li>
              <li><a href="https://www.fdic.gov/about/plain-writing-act-2010" target="_blank" rel="noopener noreferrer">Plain Writing</a></li>
              <li><a href="https://www.fdic.gov/about/no-fear-act" target="_blank" rel="noopener noreferrer">No Fear Act Data</a></li>
              <li><a href="https://www.fdicoig.gov" target="_blank" rel="noopener noreferrer">Inspector General</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>`;
  }
}

if (!customElements.get("fdic-site-footer")) customElements.define("fdic-site-footer", FDICSiteFooter);
