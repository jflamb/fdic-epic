# FDIC Epic

Standalone static prototype for the FDIC support intake experience.

## Architecture

This repo is a static HTML/CSS/JavaScript prototype. There is no backend service in this repo; route decisions, endpoint profiles, draft state, and review state all run in the browser.

### Source files

- `index.html`, `faq.html`, `report-problem.html`, `review-submission.html`, `submission-confirmation.html`, and `view-cases.html` are the page entrypoints.
- `support-intake.js` is the main intake orchestration layer: state, step visibility, validation, routing pattern selection, contextual FAQ behavior, and draft persistence.
- `intake-config.mjs` is the primary source for workflow choices, topic labels, endpoint keys, and topic-specific dynamic requirements.
- `endpoint-profiles.json` describes what each endpoint key does: route pattern, queue label, queue code, sections, required fields, URLs, and email-send metadata.
- `components/` contains reusable custom elements and helpers. Edit these source modules first, not the generated bundle.
- `data.json` is the FAQ corpus used by the FAQ page and contextual FAQ suggestions.
- `workflow-target-ia-matrix.active.json` is the active IA crosswalk from legacy action codes to target paths. It is used as routing governance evidence, not directly by the runtime UI.

### Generated files

The static pages load generated assets, so source edits are not complete until the build has run.

- `components/index.bundle.js` is generated from `components/index.js` and component modules.
- `support-intake.bundle.js` is generated from `support-intake.js` and its local imports.
- `faq-index.json` is generated from `data.json`.
- The FAQ structured data block in `faq.html` is generated from `data.json`.

Run `npm run build` after source changes that affect any of these outputs. CI runs the build and then checks these generated files for drift.

### Endpoint profiles

Endpoint profiles are keyed by `endpointKey` values in `intake-config.mjs`. Supported route patterns are:

- `intake`: Keep the user in the prototype intake flow and collect the profile's configured sections and required fields.
- `email-send`: Show a prefilled email path for prototype-only email handoff flows.
- `external-handoff`: Send the user to a partner, FDIC, or legacy external page without collecting intake fields.
- `self-service`: Route to trusted informational content when a case is not needed.

The profile contract is intentionally plain JSON, but it is validated because the file carries routing authority. Each profile must include `label`, `queueCode`, `pattern`, `sections`, `requiredFields`, and `conditionalFields`. Pattern-specific fields are validated by `npm run audit:config`: email-send profiles need `prefilled.to` and `prefilled.subject`; external and self-service profiles need a usable `url`.

### Route patterns

The main runtime relationship is:

1. A workflow topic in `intake-config.mjs` declares an `endpointKey`.
2. `support-intake.js` loads `endpoint-profiles.json` and resolves that key to a route pattern.
3. For `intake` profiles, the profile's `sections` and `requiredFields` control which steps appear and what blocks submission.
4. Topic flags such as `includeOutcome` and `includeDesiredResolution` add dynamic requirements, but only for intake profiles.
5. `workflow-target-ia-matrix.active.json` keeps the IA target-path crosswalk aligned with the runtime endpoint keys through `npm run audit:config`.

The `specificBank` path is optional. Selecting a BankFind institution is enough to complete that optional step; ZIP and nearby-branch lookup are confidence aids.

### Prototype-only behavior

- Drafts and review state are stored in browser `sessionStorage` only.
- My Cases history is browser-local `localStorage` metadata only.
- No intake is submitted to FDIC systems.
- Login.gov and authenticated case history are represented by prototype stubs.
- Email, external handoff, self-service, and regulator handoff screens are prototype representations of routing decisions.
- Failed-bank flows stay separate from the general specific-bank routing unless that scope is intentionally expanded.

## Run Locally

```bash
npm run start
```

Then open `http://localhost:4173/`.

## Build

```bash
npm run build
```

The build regenerates the generated files listed above:

- `components/index.bundle.js`
- `support-intake.bundle.js`
- `faq-index.json`
- FAQ structured data in `faq.html`

## Test

```bash
npm test
```

`npm test` runs the Node.js built-in test runner plus the routing config audit. Node.js's built-in test runner is the standard `node --test` command for lightweight JavaScript tests without a separate test framework.

Run the routing audit by itself:

```bash
npm run audit:config
```

Check whether generated assets are current after a build:

```bash
npm run check:generated
```

Run browser-level regression tests:

```bash
npx playwright install chromium
npm run test:e2e
```

Run both unit and browser tests:

```bash
npm run test:all
```

The browser tests use Playwright and start the static prototype with `npm run start` at `http://localhost:4173/`.

## Prototype privacy/storage behavior

This is a static prototype. Intake drafts, review drafts, and confirmation details are saved only in the current browser's `sessionStorage` so the user can move through the prototype flow. They are not submitted to FDIC systems, and stale session records are ignored and cleared after about 12 hours.

The My Cases view uses `localStorage` only for metadata needed to render a prototype case-history table: confirmation number, submitted date, request type, topic, outcome, routing queue, queue code, and status. It should not store narrative text, name, email, address, bank details, or prototype Salesforce payload data.

## Publish

The included GitHub Pages workflow publishes the repo root from `main`.
