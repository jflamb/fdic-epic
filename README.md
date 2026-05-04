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

## Publish

The included GitHub Pages workflow publishes the repo root from `main`.
