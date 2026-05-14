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

## Publish

The included GitHub Pages workflow publishes the repo root from `main`.
