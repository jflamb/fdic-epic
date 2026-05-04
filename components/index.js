// Component registration barrel — imports each component module for side effects.
// Each module self-registers its custom element with a guarded customElements.define().

import "./fdic-site-header.js";
import "./fdic-site-footer.js";
import "./fdic-breadcrumb.js";
import "./fdic-share-bar.js";
import "./fdic-support-nav.js";
import "./fdic-faq-list.js";
import "./fdic-support-card.js";
import "./fdic-labeled-input.js";
import "./fdic-email-send.js";
import "./fdic-external-handoff.js";
import "./fdic-step-actions.js";
import "./fdic-progress-tracker.js";
import "./fdic-review-summary.js";
import "./fdic-choice-group.js";
import "./fdic-bank-selector.js";
// Pull non-component utilities into the shared __fdic_modules registry so
// page-script bundles can resolve their imports without re-fetching them.
import "./fdic-regulator-handoff.mjs";
