# AGENTS.md

## Scope

Operational guidance for agents working in this standalone FDIC Epic prototype repo.

## Product Guardrails

- Top-level support page is `index.html`.
- Intake is progressive disclosure with required-field gating.
- FAQ deep links should expand and scroll to the target item.
- Legacy external form handoff is intentionally removed in this prototype.
- Case history persistence is currently browser-local and non-authenticated.
- For the `specificBank` path, a selected BankFind institution is enough to complete the optional bank step; ZIP and nearby-branch lookup are confidence aids only.
- Keep failed-bank flows separate unless the user explicitly expands scope.

## Build Notes

- Edit source files first, especially `support-intake.js` and files in `components/`.
- Run `npm run build` after source changes that affect generated bundles or FAQ data.
- The static pages load generated files, including `components/index.bundle.js` and `support-intake.bundle.js`.

## Verification

- Run `npm test` for helper behavior.
- Run `npm run build` before treating generated assets as current.
- For UI behavior, serve the repo root locally and check the relevant page in a browser.
