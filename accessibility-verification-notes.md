# Accessibility Verification Notes

Date: 2026-02-25
Scope: Keyboard and semantic verification for support intake and FAQ prototype.

## What was verified

1. FAQ question list keyboard model (`faq.html`)
- Arrow keys move focus between questions.
- `Home` and `End` move to first/last question.
- `Space` toggles open/closed state of the focused answer.
- Roving tabindex is applied so only one summary is in the tab sequence at a time.

2. FAQ copy-link order and discoverability
- Summary appears before the copy-link button in DOM/tab order.
- Copy-link action is shown when item is focused/open/hovered.

3. Intake form progressive sections (`report-problem.html`)
- Custom `fdic-choice-group` hosts expose group metadata (`role`, `aria-labelledby`, `aria-required`).
- Progress tracker exposes exactly one `aria-current="step"` item.
- Validation focus for missing choice groups lands on the first radio input in the group.

4. Review submission state (`review-submission.html`)
- Submit action enters loading state (`Submitting...`).
- Submit button is disabled and marked `aria-disabled="true"` during submit.
- Review container sets `aria-busy="true"` while submitting.
- Live status text announces submission in progress.

## Manual AT checks still required

The following still need direct assistive technology validation on target environments:
- VoiceOver (Safari, macOS) and NVDA/JAWS (Windows) announcement quality for:
  - custom choice groups and legends,
  - progress list current-step announcements,
  - breadcrumb list item count and current-page announcement,
  - FAQ expand/collapse state changes and copy-link labels.

## Notes

This verification pass covered browser-level keyboard behavior and semantic DOM checks. It does not replace a full WCAG conformance audit with assistive technologies.
