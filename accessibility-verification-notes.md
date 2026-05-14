# Accessibility Verification Notes

Date: 2026-05-14
Scope: Assistive technology verification pass for the support intake, FAQ, review, and confirmation prototype paths. This is targeted evidence gathering and remediation, not a full Section 508 or WCAG 2.1 AA conformance audit.

## Browser and AT Coverage

- Verified with macOS VoiceOver and Safari against the local prototype at `http://localhost:4173/`.
- Used Playwright Chromium DOM/state checks as supporting evidence for attributes, focus placement, live regions, and generated states. These checks do not replace assistive technology testing.
- NVDA and JAWS were not available in this macOS environment. Windows screen reader verification remains pending.
- VoiceOver scripting was partially available for starting and traversing the page, but `last phrase` capture was not reliable in this environment. Announcement findings below are based on VoiceOver/Safari navigation with visible VoiceOver focus plus DOM/accessibility-state confirmation where needed.

## Paths Checked

- `index.html?mode=report`
- `index.html?mode=failed`
- `faq.html#faq-Q-What-is-the-difference-between-reporting-a-problem-and-asking-a-question`
- `review-submission.html?mode=report`
- `submission-confirmation.html?mode=report`
- `report-problem.html` was checked as an entrypoint redirect to `index.html`.

## Results

### Intake Custom Choice Groups

Status: Pass after fixes.

- Group labels are native `fieldset`/`legend` structures, so VoiceOver reaches the group label before the radio choices.
- Required groups now include screen-reader text in the legend instead of exposing only the visual asterisk.
- Choice-group help text is now connected with `aria-describedby` when help text is present.
- Selected options expose native radio checked state and keep the visual `.is-selected` state in sync.
- Validation errors are in `#form-errors` with `role="alert"` and focus moves to the first invalid radio in the missing choice group.

Fixes made:
- `components/fdic-choice-group.js`: added screen-reader "required" text and connected help text to the `fieldset`.

### Progress Tracker

Status: Pass after fixes.

- Exactly one progress link has `aria-current="step"` during the report flow.
- The focused progress link now carries the state in its accessible name, for example `What is your concern about?: Current step`, `Specific bank: Not started`, and `What do you need help with?: Complete`.
- Completed/current/incomplete visual states are not color-only: completed uses a check icon, current uses current-step styling, and screen reader state is explicit.

Fixes made:
- `support-intake.js`: moved current/completion state onto the focusable `.progress-link` with `aria-current` and an explicit accessible label.
- `styles.css`: switched progress current-step visual styling from `[aria-current]` on the list item to `.is-current` so ARIA state stays on the focusable link only.

### Breadcrumb

Status: Pass.

- Breadcrumb renders as `nav` with `aria-label="Breadcrumb"` and an ordered list.
- Current page crumb is a non-link `span` with `aria-current="page"`.

### FAQ List

Status: Pass with follow-up recommended on Windows AT.

- Deep links open the target FAQ details element and scroll it into view.
- Question summaries expose native expand/collapse behavior through `<details>/<summary>`.
- Roving tabindex is active; only one FAQ summary is in the tab sequence, and arrow keys move focus between questions.
- Copy-link buttons have specific labels before activation, for example `Copy link to: What is the difference between reporting a problem and asking a question?`
- After activation, the focused button label changes to `Link copied to clipboard`, then returns to the question-specific label.

### Bank Selector / Combobox

Status: Pass.

- The specific-bank combobox input is labeled by `Bank name, website, or FDIC certificate number`.
- Help text is connected through `aria-describedby="specific-bank-search-input-description"`.
- Suggestion count is announced through the status region, for example `7 bank suggestions available. Use arrow keys to navigate.`
- Arrow keys update `aria-activedescendant` and option `aria-selected`.
- Selecting a bank announces a status message, for example `Selected U.S. Bank National Association.`
- The specific-bank step still completes from the selected legal institution; ZIP and nearby-branch lookup remain confidence aids only.

### Failed-Bank Search Combobox

Status: Pass after fix.

- The failed-bank input is labeled by `Failed bank name or FDIC certificate number`.
- Required state is set with `aria-required="true"` when the failed-bank identification step is required.
- Help text is now connected with `aria-describedby="failed-bank-search-help"`.
- Suggestion count is announced through `#failed-bank-search-status`, for example `3 suggestions available. Use arrow keys to navigate.`
- Arrow keys update `aria-activedescendant`, and selection announces a status message, for example `Selected: The First National Bank of Lindsay.`

Fixes made:
- `index.html`: added `id="failed-bank-search-help"` and connected it to `#failed-bank-search-input`.

### Review and Submission States

Status: Pass.

- Missing-draft error summary is exposed with `role="alert"`.
- Review summary and confirmation summary render as definition lists (`dl`) with matching visible `dt`/`dd` rows.
- Submit loading state sets button text to `Submitting...`, disables the button, sets `aria-disabled="true"`, sets `.review-main` to `aria-busy="true"`, and updates the `#submit-status` live region with `Submitting your request...`.
- Confirmation exposes the generated confirmation number in a polite status region.

## Remaining AT Gaps

- NVDA with Firefox or Chrome on Windows: pending.
- JAWS with Chrome or Edge on Windows: pending.
- Confirm whether JAWS announces `aria-describedby` on the choice-group `fieldset`; if not, mirror the description ID onto each radio input during the Windows pass.
- A follow-up live human-listening pass is recommended for final announcement phrasing because this environment could not reliably capture VoiceOver's `last phrase` output programmatically.

## Verification Commands

- `npm run build` passed on 2026-05-14.
- `npm test` passed on 2026-05-14.

## Files Changed

- `accessibility-verification-notes.md`
- `components/fdic-choice-group.js`
- `components/index.bundle.js`
- `index.html`
- `styles.css`
- `support-intake.js`
- `support-intake.bundle.js`
