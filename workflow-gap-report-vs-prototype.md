# Gap Report: Existing Endpoint Forms vs Current Prototype Intake

Date: 2026-02-25
Source field inventory: [workflow-endpoint-field-matrix.md](./workflow-endpoint-field-matrix.md)

## Current prototype required fields
From `report-problem.html` + `support-intake.js`:
- Intent (`report` / `ask` / `dir` / `failed`)
- Concern topic
- Issue details (narrative)
- Desired outcome
- State of residence
- Follow-up contact method + value (email or phone)

## Executive summary
The prototype captures routing intent and a minimal narrative/contact set, but it does **not yet capture several consistently required fields** in terminal production forms.

Most significant gaps:
- Identity fields: first name, last name
- Contact verification: confirm email
- Mailing/contact address: street + city (+ country in many forms)
- Requestform family baseline: business phone + mailing address package
- Specialized endpoint fields (especially appraisal workflow): user-role classification, subject-of-complaint details, property address, complaint-type checklists, authorization checkbox
- Distinct interaction models not yet represented: `factsemailsend` variants and external failed-bank handoffs
- Routing mismatches in the current prototype: `fdic_issue` goes to `fdiccaform`, `insured_status` sits under the failed-bank funnel, and `fdicbaform` exists in config without a reachable topic path

## Coverage by endpoint family
| Endpoint family | Prototype coverage | Key missing required fields | Severity |
|---|---|---|---|
| `fdiccaform` (Customer Assistance) | Partial | First name, last name, mailing street, mailing city, mailing zip, mailing country, desired resolution free-text | High |
| `fdicbaform` (Business Assistance) | Partial | First name, last name, confirm email, mailing street/city/country, desired resolution free-text | High |
| `fdicdiform` (Deposit Insurance) | Partial | First name, last name, confirm email, mailing street/city/country | High |
| `fdicdirform` (Directory/Data Inquiry) | Partial | First name, last name, specific description field semantics, optional prior-contact metadata | Medium |
| `fidciaform` (Interagency Appraisal) | Low | First/last name, confirm email, mailing street/city/country, who-are-you classification, property address, complaint-category selections | Critical |
| `fdicdimcomplaintform` (Insured Status) | Partial | Desired resolution free-text and possible category qualifiers | Medium |
| `fdicooform` (Comment/Complaint Against FDIC) | Partial | Desired resolution free-text; current prototype misroutes `fdic_issue` to `fdiccaform`; field model is much lighter than `fdiccaform` | High |
| `requestform` family (`type` and `sub` variants) | Low | First/last name, confirm email, business phone, mailing street address, mailing city | Critical |
| `powerofattorneyform` | Low | First/last name, confirm email, business phone, mailing street/city | Critical |
| `recordsdestructionform` | Low | First/last name, confirm email, business phone, mailing street/city | Critical |
| `factsemailsend` family (`taxUnit`, `Receivership`, `bankMerger`) | None | Distinct email-send composition pattern, prefilled metadata, optional CC, and phone fallback handling (`taxUnit`) | High |
| `paAgreement` external handoff | None | Explicit handoff state, destination explanation, and exit messaging rather than form fields | Medium |

## Routing and IA parity gaps

### 1) `fdic_issue` is routed incorrectly today
The current prototype maps the `fdic_issue` topic to `fdiccaform`, but production FDIC complaints route to `fdiccommentform` / `fdicooform`. This is a routing correctness gap, not just a field-gap issue.

### 2) `fdicbaform` exists in config but is not reachable
`support-intake.js` defines `fdicbaform` in `ENDPOINTS`, but no current topic points to it. The prototype therefore lacks an explicit small-business-specific path even though the production surface includes one.

### 3) Failed-bank scope is too narrow
The current failed-bank funnel covers depositor claims, lien release, and insured-status concerns only. It does not yet represent:
- Records Research
- Asset Management
- `factsemailsend` variants
- the `paAgreement` external handoff

### 4) `insured_status` is placed in the wrong funnel
The prototype currently places `insured_status` under the failed-bank workflow, but the production routing matrix shows insured-status concerns across non-failed-bank personas. It aligns better with a report/concern path than with failed-bank servicing.

## Detailed gap themes

### 1) Identity/contact package is incomplete
Observed repeatedly as required in most endpoint forms:
- First name
- Last name
- Email + confirm email
- Business phone (especially requestform family)

Prototype currently has only a follow-up contact method/value.

### 2) Mailing address package is under-collected
Observed required in many forms:
- Mailing street
- Mailing city
- Mailing country code
- Sometimes mailing zip/postal code

Prototype currently has state only.

### 3) Resolution semantics mismatch
Several forms require both:
- Complaint/inquiry narrative
- Desired resolution (often free-text)

Prototype has narrative plus a high-level outcome choice, but no explicit free-text desired resolution field.

### 4) Specialized-domain questions missing
Most prominent in appraisal and failed-bank workflows:
- Who are you? (role taxonomy)
- Who/what complaint is about
- Property-specific details
- Asset/record/document context metadata
- Authorization acknowledgment checkbox

Prototype uses simplified topic selection and does not yet model these endpoint-specific data blocks.

### 5) Distinct interaction patterns are missing
The current prototype models everything as a standard form intake, but the production surface also includes:
- internal email-send routes (`factsemailsend`)
- explicit external handoffs (`paAgreement`, FFIEC helpdesk, catalog)
- self-service deflection into the Knowledge Center / informational content

### 6) Conditional branches likely underrepresented
Several forms show many disabled controls that activate based on prior answers.
The prototype currently has shallow progressive branching and likely misses downstream conditional required fields.

## Risk of staying as-is
- Incomplete submissions for downstream operations
- Higher back-and-forth follow-up burden
- Reduced triage quality and longer resolution times
- Potential inability to replace legacy forms for complex pathways (especially failed-bank + appraisal)
