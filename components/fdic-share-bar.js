const SHARE_ICONS = {
  facebook: '<svg viewBox="0 0 320 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91V134.6c0-25.35 12.42-50.06 52.24-50.06h40.42V5.49S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>',
  x: '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8l164.9-188.5L26.8 48h145.6l100.5 132.9L389.2 48zm-24.8 373.8h39.1L151.1 88h-42l255.3 333.8z"/></svg>',
  linkedin: '<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></svg>',
  envelope: '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0z"/></svg>',
  print: '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0zM384 352v32 64H128V384 352 320H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64zm-16-152a24 24 0 1 1 0-48 24 24 0 1 1 0 48z"/></svg>',
};

export class FDICShareBar extends HTMLElement {
  connectedCallback() {
    if (this.innerHTML.trim()) return;
    this.innerHTML = `<div class="share-bar" aria-label="Share this page">
      <span class="share-label">Share This:</span>
      <button type="button" class="share-action" aria-label="Share on Facebook"><span class="share-icon">${SHARE_ICONS.facebook}</span><span class="visually-hidden">Share on Facebook</span></button>
      <button type="button" class="share-action" aria-label="Share on X"><span class="share-icon">${SHARE_ICONS.x}</span><span class="visually-hidden">Share on X</span></button>
      <button type="button" class="share-action" aria-label="Share on LinkedIn"><span class="share-icon">${SHARE_ICONS.linkedin}</span><span class="visually-hidden">Share on LinkedIn</span></button>
      <button type="button" class="share-action" aria-label="Share through email"><span class="share-icon">${SHARE_ICONS.envelope}</span><span class="visually-hidden">Share through email</span></button>
      <button type="button" class="share-action" aria-label="Print this page"><span class="share-icon">${SHARE_ICONS.print}</span><span class="visually-hidden">Print this page</span></button>
    </div>`;
  }
}

if (!customElements.get("fdic-share-bar")) customElements.define("fdic-share-bar", FDICShareBar);
