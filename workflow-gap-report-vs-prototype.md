# Gap Report: Endpoint Forms vs Current Prototype Intake

Date refreshed: 2026-05-14
Original baseline: 2026-02-25
Source field inventory: [workflow-endpoint-field-matrix.md](./workflow-endpoint-field-matrix.md)
Current source files checked: `intake-config.mjs`, `endpoint-profiles.json`, `support-intake.js`, `index.html`, `report-problem.html`, `support-review.js`, `review-submission.html`, and `tests/`

## Executive Summary

The February gap report is no longer accurate as a description of the prototype. Several high-priority parity gaps have been addressed in the current source: identity fields, email confirmation, mailing-address fields, small-business routing, insured-status routing, failed-bank records and asset-management paths, failed-bank email-send patterns, and explicit external/self-service handoff states.

The prototype is still a static, non-authenticated intake model. It now gives reviewers a much better routing and field-parity picture, but it should not be described as production-ready. Case history is browser-local, submission is simulated through review/confirmation pages, and endpoint profiles are still a prototype schema rather than an operational system of record.

## Current Prototype Coverage

### Routing and Interaction Patterns

The current workflow configuration in `intake-config.mjs` covers four top-level paths:

| Path | Current coverage | Source trace |
|---|---|---|
| Report a problem or concern | Bank/financial institution, small-business banking, FDIC issue, insured-status concern, and appraisal-related issue | `WORKFLOWS.report` in `intake-config.mjs` |
| Ask a question or get guidance | Deposit-insurance question, general regulatory question, process help, and general FDIC.gov information | `WORKFLOWS.ask` in `intake-config.mjs` |
| Request FDIC bank data and research | QBP/industry analysis, Call Report data, bank history/BankFind/failed-bank records, and FFIEC data handoff | `WORKFLOWS.dir` in `intake-config.mjs` |
| Get help with a failed bank | Depositor claims, lien release, records research, asset management, limited power of attorney, records custody, tax documents, receiver letters, merger/name-change certification, and P&A agreement lookup | `WORKFLOWS.failed` in `intake-config.mjs` |

The prototype now distinguishes these interaction patterns in `endpoint-profiles.json` and `support-intake.js`:

- `intake`: a local progressive-disclosure form that can proceed to review submission.
- `email-send`: a prefilled email composition pattern for selected failed-bank requests.
- `external-handoff`: an explicit off-site handoff card.
- `self-service`: an FDIC.gov information path rather than a form submission.

### Field Model and Validation

The current source uses endpoint profiles to show and require field groups. `support-intake.js` reads `endpoint-profiles.json`, maps profile sections to form sections, applies required states, validates required fields, and saves a draft for `review-submission.html`.

Current field coverage includes, depending on the selected endpoint profile:

- Identity fields: first name, last name, email, and confirm email.
- Email confirmation matching.
- Mailing address fields such as street, city, state/territory, ZIP or postal code, and country. Required fields vary by profile.
- Optional business phone field. The current failed-bank contact profiles do not require business phone, and `tests/endpoint-profiles.test.mjs` protects that behavior.
- Desired-resolution free text on report-style topics where `includeDesiredResolution` is set.
- Authorization checkbox for selected intake profiles, including `fdiccaform`, `fdicbaform`, `fdicdiform`, and `fidciaform`.
- Failed-bank identification for failed-bank intake profiles.
- Records-research document request type.
- Appraisal role plus property street and city.
- Specific-bank selector for selected topics, with optional BankFind context and regulator handoff behavior.

### Review, Payload, and Persistence

The review flow now reflects the expanded data model. `support-review.js` renders identity, email, phone, mailing address, failed-bank, specific-bank, document type, appraisal details, desired resolution, endpoint label, FAQ suggestions, and a prototype Salesforce payload preview.

`components/fdic-salesforce-payload.mjs` maps the saved draft into a structured payload shape with routing, requester, request, institution, consent, processing, and prototype metadata. The payload explicitly frames direct database writes as false and says production integration would need Salesforce APIs or platform services.

Important limitation: this is still a browser prototype. `support-review.js` stores submitted case history in `localStorage` with limited non-sensitive metadata, and the current review/confirmation behavior is not authenticated production submission.

## Closed Gaps Since the February Report

| February item | Current status | Evidence |
|---|---|---|
| First name and last name missing | Closed for profiled intake routes that include the `identity` section | `endpoint-profiles.json` required fields; `index.html` identity section; `support-intake.js` validation |
| Email confirmation missing | Closed for profiled intake routes that require `emailConfirm` | `endpoint-profiles.json`; `support-intake.js` email-confirm match validation |
| Mailing street/city/country under-collected | Mostly closed for profiled intake routes that include `mailingAddress` | `endpoint-profiles.json`; `index.html` mailing section; `support-intake.js` required-field handling |
| Desired-resolution free text missing | Closed for report-style topics with `includeDesiredResolution` | `intake-config.mjs`; `support-intake.js` inserts `desiredResolution` section dynamically |
| `fdic_issue` routed to the wrong endpoint | Closed in current config | `fdic_issue` now maps to `fdiccommentform` in `intake-config.mjs` |
| `fdicbaform` exists but is unreachable | Closed in current config | `small_business` now maps to `fdicbaform` in `intake-config.mjs` |
| `insured_status` placed under failed-bank funnel | Closed in current config | `insured_status` now appears under `WORKFLOWS.report` and maps to `fdicdimcomplaintform` |
| Failed-bank scope limited to depositor/lien/insured-status paths | Closed for major prototype route coverage | Failed-bank workflow now includes records research, asset management, LPOA, records custody, tax documents, receiver letters, merger certification, and P&A lookup |
| `factsemailsend` family missing | Closed as a prototype interaction pattern | `factsemailsend-taxUnit`, `factsemailsend-Receivership`, and `factsemailsend-bankMerger` use `pattern: "email-send"` |
| `paAgreement` external handoff missing | Closed as a prototype handoff pattern | `paAgreement` uses `pattern: "external-handoff"` with the Failed Bank List URL |
| FFIEC/helpdesk external handoff missing | Closed for the data/research path | `ffiec_data` maps to `helpdeskform`, an `external-handoff` profile |
| Review page did not reflect expanded field set | Closed for current local intake fields | `support-review.js` and `review-submission.html` render expanded review content and payload preview |

## Partially Closed or Reworded Gaps

| Gap theme | Current status | What still needs care |
|---|---|---|
| Mailing address parity | Mostly closed | Required address fields vary by endpoint. Some current profiles do not require postal code even though the field exists. Confirm which fields are operationally required versus legacy-form required. |
| Business phone | Reworded | The February plan assumed business phone should be required for requestform/failed-bank families. The current profiles intentionally do not require it, and a test protects that choice. Treat this as a product decision, not an open defect. |
| Appraisal workflow | Partially closed | The prototype captures role and basic property details, but not the full legacy appraisal taxonomy such as complaint target, category checklist, or conditional prior-resolution history. |
| Failed-bank requestform variants | Partially closed | The main route families and selected subtypes are represented, including document request type for records research. Full subtype-specific required fields and downstream operational metadata are still lighter than legacy forms. |
| External handoffs | Partially closed | The prototype now has explicit handoff cards, but it does not confirm completion after a user leaves the prototype and does not integrate with external systems. |
| Email-send routes | Partially closed | The mailto pattern is represented with prefilled destination and subject plus message body, but there is no server-side send, tracking, or confirmation. |
| Specific-bank routing | Partially closed | The prototype can use BankFind-selected regulator data for non-FDIC handoffs on configured topics. This is routing assistance, not an authenticated regulator determination. |
| Case history | Reworded | Local case history is useful for prototype demonstration only. It is non-authenticated browser storage and should not be treated as durable records management. |

## Remaining Parity Gaps

### 1. Production Submission, Authentication, and Records Handling

The prototype does not authenticate users, does not submit to Salesforce or another production intake system, and does not create durable agency records. `support-review.js` simulates submission and writes limited case-history metadata to browser `localStorage`.

High priority because reviewers may otherwise overread the presence of a review page and payload preview as production readiness.

### 2. Endpoint Profile Governance

`endpoint-profiles.json` is the current prototype routing/field source, but owner labels, queue codes, required fields, and profile notes still need operational validation. Queue codes are prototype routing identifiers for destination queues, not confirmed production queue names. The labels are working labels unless confirmed by the real destination owners.

High priority because the prototype now looks specific enough that stale or provisional owner names could be mistaken for approved routing.

### 3. Conditional Required Rules

The profile model supports required fields by endpoint, but not a full conditional-rule engine. Several legacy forms likely have fields that become required only after earlier answers. Current examples are simplified:

- Failed-bank subtypes share broad baseline field groups.
- Appraisal has role and property basics, but not full conditional complaint classification.
- Email-send and handoff routes bypass local intake review by design.

### 4. Specialized Legacy Field Depth

Remaining specialized gaps include:

- Appraisal complaint target, complaint category checklist, and fuller property/transaction context.
- Failed-bank subtype metadata beyond the current failed-bank identification and selected document-request type.
- Prior-contact or prior-resolution metadata where legacy forms expect it.
- Any endpoint-specific attachments, evidence upload, or document delivery requirements.

### 5. Handoff and Email Completion

External handoffs and email-send patterns are now visible, but the prototype cannot know whether a user completed the external action. Production would need analytics, return-state design, or clear expectations that these are exit paths.

### 6. Automated Parity Regression

Current tests cover helper behavior, Salesforce payload mapping, regulator handoff logic, and the decision not to require business phone for failed-bank contact profiles. There is not yet a comprehensive audit that compares every endpoint-profile requirement against the original field matrix.

## Risks and Open Decisions

- Which fields are truly required for future-state operations versus required only because the legacy form asked for them?
- Should mailing postal code be required consistently across all mailing-address profiles, or only for selected endpoint families?
- Should FDIC comment/ombudsman and insured-status routes collect the same identity/address package as bank complaint routes, or stay lighter?
- Are the current endpoint labels and queue codes acceptable as stakeholder-facing working labels?
- How should the prototype explain local-only case history so users and reviewers do not confuse it with authenticated account history?
- Should failed-bank email-send routes remain mailto-based in the prototype, or should they get a review-style preflight screen before opening the email client?
- Should full appraisal parity be prioritized before or after governance validation of the broader routing model?

## Current Bottom Line

The prototype has moved from a minimal routing/narrative intake to a schema-driven static prototype with expanded field groups, clearer routing, and distinct interaction patterns. The strongest remaining gaps are not the February baseline field omissions; they are production integration, governance validation, conditional endpoint depth, and clear handling of local-only persistence.
