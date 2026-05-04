# Gap-Closure Implementation Plan

Date: 2026-02-25
Inputs:
- [workflow-endpoint-field-matrix.md](./workflow-endpoint-field-matrix.md)
- [workflow-gap-report-vs-prototype.md](./workflow-gap-report-vs-prototype.md)

## Goal
Close pathway and field-level parity gaps so the prototype can represent the major Ask FDIC service families without losing critical routing information.

## Guiding principles
- Minimize PII, but collect what is operationally required.
- Keep progressive disclosure and plain language.
- Preserve accessibility semantics and keyboard operability.
- Use reusable schema-driven field groups to avoid one-off branching code.

## Proposed architecture shift
Move from hardcoded per-page conditional logic to a schema-driven intake engine:
- Add endpoint profiles (JSON) with:
  - required fields
  - conditional rules
  - display copy
  - validation rules
- Reuse field group components:
  - identity/contact group
  - mailing address group
  - institution/subject group
  - property/asset group
  - narrative + desired-resolution group
  - authorization/consent group

## Phase plan

### Phase 1: Core parity baseline (all major forms)
1. Add required identity fields:
   - first name, last name
   - email + confirm email
2. Add mailing block:
   - street, city, state/province, postal code, country
3. Add explicit desired resolution free-text field
4. Add business phone field for failed-bank/requestform families
5. Keep current intent/topic/outcome model as routing scaffold

Definition of done:
- All endpoint families have no missing baseline required fields from current observed matrix.

### Phase 2: Family-specific branches
1. Implement `requestform` family specializations by `type`/`sub`:
   - depositor claims variants
   - lien release variants
   - records research variants
   - asset management variants
2. Implement appraisal (`fidciaform`) specialized sections:
   - role classification
   - complaint target classification
   - complaint category checklist
   - property details
   - optional prior-resolution history
3. Implement `fdicdirform`/`fdicdimcomplaintform`/`fdicooform` nuances.
4. Correct the current routing gaps:
   - route FDIC complaints to the `fdicooform` pattern rather than `fdiccaform`
   - move insured-status concerns out of the failed-bank funnel
   - expose the missing `fdicbaform` small-business path

Definition of done:
- Each endpoint family renders required specialized sections when selected.

### Phase 3: Distinct interaction-pattern parity
1. Add the internal email-send family:
   - `taxUnit`
   - `Receivership`
   - `bankMerger`
2. Add explicit handoff states for:
   - `paAgreement`
   - FFIEC helpdesk
   - catalog / informational exits
3. Add self-service / Knowledge Center deflection treatment for non-intake informational paths

Definition of done:
- The prototype distinguishes standard forms, email-send routes, self-service deflection, and external handoffs without forcing everything into one form model.

### Phase 4: Validation and review parity
1. Per-field validation rules:
   - email confirmation match
   - phone format
   - postal format flexibility by country
2. Conditional required-rule engine
3. Review page expansion:
   - include new identity/address/resolution fields
   - mask/redact sensitive values where needed
4. Update confirmation + case history model with non-sensitive summary only

Definition of done:
- Review step reflects all required data and blocks submission until endpoint profile is satisfied.

### Phase 5: QA and audit hardening
1. Automated field-audit regression check:
   - compare endpoint profile requirements vs prototype schema requirements
2. Keyboard/screen-reader pass for new controls
3. Plain-language copy pass across all new questions
4. Pilot usability test on top 3 complex pathways

Definition of done:
- No unresolved critical/high gaps in the matrix comparison.

## Concrete file-level implementation targets
- `support-intake.js`
  - refactor to schema-driven sections
  - add new field models and conditional validation
- `report-problem.html`
  - add reusable containers for dynamic groups
- `styles.css`
  - add styles for new shared field groups
- `support-review.js` + `review-submission.html`
  - render and validate expanded summary
- `support-confirmation.js` + `submission-confirmation.html`
  - display safe post-submit summary
- `support-cases.js` + `view-cases.html`
  - store/view non-sensitive case metadata only
- New config file (recommended):
  - `workflow-endpoint-profiles.json`

## Recommended sequencing (pragmatic)
1. Implement Phase 1 first (highest risk reduction).
2. Then implement failed-bank `requestform` branches (largest complexity block).
3. Then correct the routing gaps and add the email-send / handoff patterns.
4. Then appraisal branch.
5. Then remaining specialized families and review-state parity.

## Open decisions to confirm before implementation
- Which fields are legally/operationally required vs legacy-required-only?
- Do we require full mailing address for all intents, or only specific endpoint families?
- Should desired resolution be mandatory across all flows?
- How much PII can be stored locally in prototype mode?
- How much of the Knowledge Center should be represented directly vs through curated self-service deflection?
