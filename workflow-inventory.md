# Ask.FDIC.gov Pathway Inventory

## Source
Primary authenticated exploration started at:
- `https://ask.fdic.gov/fdicinformationandsupportcenter/s/user-home`

This inventory is reconciled against the later authenticated crawl corpus in `docs/ask-fdic-crawl/`. FBCSC authenticated interiors remain out of scope here.

Primary selector model in production:
- `sourceType` (who the user is)
- `complaintType` (what the user wants to do)

## Confirmed endpoint mappings
From direct interaction on `user-home` plus the authenticated crawl supplement:
- `fdiccaform` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccustomerassistanceform/`
- `fdicdiform` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdepositinsuranceform/`
- `fdicbaform` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicbusinessassistanceform/`
- `fdicdirform` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdirform/`
- `fidciaform` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicinteragencyform/`
- `fdicdimcomplaintform` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdimcomplaintform/`
- `fdicooform` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccommentform/`
- `fdicLienRelease` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien%20Release`
- `requestformAddress` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Change%20of%20Address&type=Depositor%20Claims&subject=Change%20my%20address%20with%20the%20FDIC`
- `taxUnit` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=taxUnit`
- `Receivership` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=Receivership`
- `bankMerger` -> `https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=bankMerger`
- `paAgreement` -> `https://www.fdic.gov/bank-failures/failed-bank-list`
- `helpdeskform` -> `https://cdr.ffiec.gov/public/HelpFileContainers/HelpDeskForm.aspx`

## Duplicates and IA Friction
Current production routing contains repeated intents with different labels, often pointing to the same backend form ID.

Examples:
- "Submit a Regulatory Question" and "Submit a Complaint Against a Bank" both route to `fdiccaform` in some user types.
- Multiple research/data phrasings route to `fdicdirform`.
- Failed-bank actions fan out to many `requestform` variants with parameterized query strings.

## Proposed consolidated workflows
For prototype IA clarity, routes are consolidated into the current four user-facing intake funnels:

1. Report a problem or concern
2. Ask a question or get guidance
3. Request FDIC Bank Data and Research (DIR) information
4. Get help with a failed bank

Related support states remain separate from intake:
- View My Cases
- FAQ / Knowledge Center self-service

Each intake workflow uses progressive disclosure:
- Choose workflow intent
- Choose topic
- Enter plain-language description
- Choose desired outcome
- Receive the appropriate interaction pattern:
  - standard intake form
  - email-send route
  - self-service guidance
  - external handoff

## Prototype Implementation Notes
Implemented in `report-problem.html` + `support-intake.js`:
- Reusable web component: `<fdic-choice-group>`
- Shared style system for card/radio fields and validation messaging
- Required fields clearly marked
- Error summary with focusable links
- Dynamic endpoint recommendation based on selected topic

## Known prototype alignment gaps
- `fdic_issue` currently routes to `fdiccaform`, but production FDIC complaints route to `fdiccommentform` / `fdicooform`.
- `insured_status` currently lives under the failed-bank funnel, but production presents it across non-failed-bank personas.
- `fdicbaform` exists in the prototype endpoint map but no current topic routes to it.
- Records Research, Asset Management, `factsemailsend`, and `paAgreement` are not yet represented in the current failed-bank funnel.
