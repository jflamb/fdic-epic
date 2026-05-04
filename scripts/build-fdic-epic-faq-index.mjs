#!/usr/bin/env node
// Build a slim FAQ index used by the support intake's contextual-FAQ
// suggestion widget. Drops answerHtml + summary + ids — the matcher only
// scores against question/topic, and the link only needs urlName.
//
// Usage: node scripts/build-fdic-epic-faq-index.mjs

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(__dirname, "../data.json");
const OUTPUT = resolve(__dirname, "../faq-index.json");

const raw = JSON.parse(await readFile(SOURCE, "utf8"));
const articles = Array.isArray(raw?.articles) ? raw.articles : [];

const slim = articles.map((a) => ({
  urlName: a.urlName,
  question: a.question,
  topics: Array.isArray(a.topics) ? a.topics.map((t) => ({ label: t.label })) : [],
}));

// Deliberately omit a generatedAt timestamp — npm run build:fdic-epic should
// be deterministic so generated-file diffs only appear when the source data
// actually changes.
const payload = { articles: slim };
const json = JSON.stringify(payload);
await writeFile(OUTPUT, json, "utf8");
console.log(
  `Wrote ${relative(process.cwd(), OUTPUT)} — ${slim.length} articles, ${Math.round(json.length / 102.4) / 10} KB`,
);
