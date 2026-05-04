#!/usr/bin/env node
// Build a static list of the top ~200 active FDIC-insured banks by total
// assets. The bank-selector matches against this list locally before
// falling through to the live BankFind API — so the first keystroke
// returns instantly for the head of the distribution (Wells Fargo, BofA,
// etc.) without a third-party round-trip.
//
// Re-run periodically as new institutions are chartered or fail.
//
// Usage: node scripts/build-fdic-epic-popular-banks.mjs

import { writeFile } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, "../popular-banks.json");

const BANKFIND_URL = "https://api.fdic.gov/banks/institutions";
const FIELDS = ["NAME", "CERT", "CITY", "STALP", "ACTIVE", "WEBADDR", "MAINOFF", "REGAGNT", "ASSET"];
const LIMIT = 200;

const params = new URLSearchParams({
  filters: "ACTIVE:1",
  fields: FIELDS.join(","),
  limit: String(LIMIT),
  offset: "0",
  sort_by: "ASSET",
  sort_order: "DESC",
});

console.log(`Fetching top ${LIMIT} active banks by asset size from BankFind...`);
const response = await fetch(`${BANKFIND_URL}?${params.toString()}`);
if (!response.ok) {
  console.error(`BankFind request failed: ${response.status} ${response.statusText}`);
  process.exit(1);
}
const payload = await response.json();
const records = Array.isArray(payload?.data) ? payload.data : [];

// Mirror the shape produced by mapInstitutionRecord in fdic-bank-selector.js
// so the client doesn't need a separate parser path.
const banks = records
  .map((record) => {
    const data = record?.data || {};
    return {
      name: data.NAME || "",
      cert: data.CERT != null ? String(data.CERT) : "",
      city: data.CITY || "",
      state: data.STALP || "",
      active: Number(data.ACTIVE) === 1,
      website: data.WEBADDR || "",
      mainOffice: data.MAINOFF || "",
      regulator: data.REGAGNT || "",
      asset: Number(data.ASSET) || 0,
    };
  })
  .filter((bank) => bank.name);

// Deliberately omit a generatedAt timestamp — npm run build:fdic-epic should
// be deterministic so generated-file diffs only appear when the source data
// actually changes. (Popular-bank composition still drifts between runs as
// BankFind data changes; that's an intentional refresh signal in the diff.)
const out = { banks };
const json = JSON.stringify(out);
await writeFile(OUTPUT, json, "utf8");
console.log(
  `Wrote ${relative(process.cwd(), OUTPUT)} — ${banks.length} banks, ${Math.round(json.length / 102.4) / 10} KB`,
);
