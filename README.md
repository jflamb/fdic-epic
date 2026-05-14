# FDIC Epic

Standalone static prototype for the FDIC support intake experience.

## Run Locally

```bash
npm run start
```

Then open `http://localhost:4173/`.

## Build

```bash
npm run build
```

The build regenerates:

- `components/index.bundle.js`
- `support-intake.bundle.js`
- `faq-index.json`
- FAQ structured data in `faq.html`

## Test

```bash
npm test
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
