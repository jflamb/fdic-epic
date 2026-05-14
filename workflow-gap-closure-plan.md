# Gap-Closure Implementation Plan

Date refreshed: 2026-05-14
Original baseline: 2026-02-25
Inputs:
- [workflow-endpoint-field-matrix.md](./workflow-endpoint-field-matrix.md)
- [workflow-gap-report-vs-prototype.md](./workflow-gap-report-vs-prototype.md)
- `intake-config.mjs`
- `endpoint-profiles.json`
- `support-intake.js`
- `index.html`
- `support-review.js`
- `review-submission.html`
- `tests/`

## Goal

Keep the prototype aligned with the major Ask FDIC service families without overstating production readiness. The near-term work is no longer basic field parity; it is governance validation, conditional endpoint depth, and clearer prototype boundaries.

## Current Architecture Status

The proposed February shift to schema-driven intake is substantially in place:

- `endpoint-profiles.json` defines endpoint labels, queue codes, patterns, sections, required fields, notes, and handoff metadata. Queue codes are prototype routing identifiers for destination queues, not confirmed production queue names.
- `intake-config.mjs` defines top-level workflows, topic routing, failed-bank sub-branching, document-request options, specific-bank prompts, and appraisal role options.
- `support-intake.js` loads endpoint profiles, shows profile-specific sections, applies required fields, validates required data, handles email-send and handoff patterns, and saves review drafts.
- `support-review.js` renders expanded review details and a prototype Salesforce payload preview.
- `components/fdic-salesforce-payload.mjs` creates a structured payload shape for future integration discussion.

Important boundary: this remains a static prototype. Authentication, production submission, durable case records, and real Salesforce integration are out of scope for the current implementation.

## Phase Status

### Phase 1: Core Parity Baseline

Status: Mostly complete for current profiled intake routes.

Completed:
- First name and last name fields.
- Email and confirm-email fields.
- Email format and confirmation-match validation.
- Mailing address fields.
- Desired-resolution free text for report-style topics.
- Profile-driven required fields.
- Current decision: failed-bank contact profiles do not require business phone.

Still needs confirmation:
- Whether postal code should be required consistently across all mailing-address profiles.
- Whether lighter profiles such as `fdiccommentform` and `fdicdimcomplaintform` should collect the same identity/address package as complaint routes.
- Whether the no-business-phone decision is acceptable to failed-bank/requestform owners.

### Phase 2: Family-Specific Branches

Status: Partially complete.

Completed:
- Small-business route exposed through `small_business -> fdicbaform`.
- FDIC issue route corrected to `fdic_issue -> fdiccommentform`.
- Insured-status route moved into the report path as `insured_status -> fdicdimcomplaintform`.
- Failed-bank route coverage expanded to depositor claims, lien release, records research, asset management, LPOA, records custody, tax documents, receiver letters, merger/name-change certification, and P&A lookup.
- Failed-bank sub-branching exists for depositor claims and asset-management variants.
- Records-research route collects document request type.
- Appraisal route collects role and basic property details.
- Specific-bank selector supports configured topics and can trigger regulator handoff behavior.

Still open:
- Full subtype-specific failed-bank requirements.
- Full appraisal complaint taxonomy and conditional questions.
- Prior-contact/prior-resolution metadata where endpoints require it.
- Confirmation from business owners that the profile labels and queue codes match real ownership.

### Phase 3: Distinct Interaction-Pattern Parity

Status: Mostly complete as prototype patterns.

Completed:
- `factsemailsend-taxUnit`, `factsemailsend-Receivership`, and `factsemailsend-bankMerger` are represented as `email-send` profiles.
- `paAgreement` and `helpdeskform` are represented as reachable external handoffs; `fdiccatalog` is defined as an external-handoff profile but is not currently wired to a topic.
- `fdicGeneralInfo` is represented as a self-service path.
- Email-send components show prefilled destination/subject, message body, and relevant phone fallback.
- External handoff components show exit copy, destination link, and failed-bank phone fallback where configured.

Still open:
- No server-side email sending, tracking, or confirmation.
- No return-state or completion tracking for external handoffs.
- No confirmed decision on whether the defined-but-unwired `fdiccatalog` profile should become a live route or remain a reference profile.
- No decision yet on whether email-send paths need a review/preflight step before opening the email client.

### Phase 4: Validation and Review Parity

Status: Partially complete.

Completed:
- Required-field validation from endpoint profiles.
- Email format validation.
- Email-confirmation matching.
- Business-phone format validation when a profile requires business phone.
- Postal-code validation for U.S. jurisdictions when postal code is required.
- Review page renders identity, email, phone, mailing address, failed-bank, specific-bank, document type, appraisal details, desired resolution, endpoint label, FAQ suggestions, and payload preview.
- Simulated submission stores limited case-history metadata locally.

Still open:
- Full conditional required-rule engine.
- Production masking/redaction decisions for sensitive fields.
- Production persistence model.
- Attachment/evidence-upload model, if required by endpoint owners.

### Phase 5: QA and Audit Hardening

Status: Partially complete.

Completed:
- Unit tests exist for BankFind selector helpers, Salesforce payload mapping, regulator handoff logic, and endpoint-profile business-phone behavior.

Still open:
- Automated endpoint-profile-to-field-matrix parity audit.
- Keyboard and screen-reader review of newer dynamic sections.
- Plain-language review across all endpoint-specific questions.
- Usability review for top complex pathways, especially failed-bank and appraisal.

## Next Recommended Work

1. Validate endpoint governance with route owners.
   Confirm `endpoint-profiles.json` labels, queue codes, patterns, and required fields. This is the highest-value next step because the prototype now presents routing decisions with enough specificity to influence stakeholder expectations.

2. Add a profile parity audit test.
   Create a lightweight test that checks each `requiredFields` value maps to a real field or intentional virtual field in `support-intake.js`/`index.html`, and flags endpoint profiles that are missing expected baseline groups from the field matrix.

3. Decide the address and phone policy.
   Resolve postal-code consistency and business-phone requirements before adding more fields. The current code intentionally avoids requiring business phone for failed-bank contact profiles, so changes here should be product decisions, not incidental cleanup.

4. Deepen appraisal only after governance validation.
   Appraisal remains the largest specialized field gap, but building the full taxonomy before endpoint-owner confirmation risks encoding the wrong model.

5. Clarify local-only persistence in user-facing and stakeholder-facing documentation.
   Case history is browser-local and non-authenticated. Keep that limitation visible anywhere the flow is demonstrated or reviewed.

## Updated File-Level Targets

No source edits are required for this documentation refresh. Future implementation work would likely touch:

- `endpoint-profiles.json`: profile labels, required fields, notes, and pattern metadata after owner validation.
- `intake-config.mjs`: route additions, topic copy, failed-bank branch options, and specialized option lists.
- `support-intake.js`: conditional rules, validation, draft handling, and pattern behavior.
- `index.html`: any new field containers needed by future profile sections.
- `support-review.js` and `review-submission.html`: review display, masking/redaction, and production-readiness copy.
- `components/fdic-salesforce-payload.mjs`: payload fields needed for future integration mapping.
- `tests/`: profile parity audit, conditional-rule tests, and review/payload regression coverage.

## Open Decisions

- Which endpoint fields are future-state operational requirements versus legacy-form carryover?
- Which teams own each endpoint profile and queue code?
- Should `fdiccommentform` and `fdicdimcomplaintform` stay lightweight, or collect identity/address details like the complaint routes?
- Should mailing postal code be required wherever mailing address is shown?
- Should email-send routes remain direct mailto exits?
- What is the right production boundary between authenticated case history, anonymous/local draft history, and no persistence?
- How much of the Knowledge Center should be represented as self-service deflection versus inline FAQ support?
