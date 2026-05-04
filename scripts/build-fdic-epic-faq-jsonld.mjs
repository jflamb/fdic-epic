#!/usr/bin/env node
// Inline static FAQPage JSON-LD into faq.html from data.json so crawlers and
// link preview tools can read the structured data without running page JS.

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, "../data.json");
const FAQ_HTML = resolve(__dirname, "../faq.html");

function textFromHtml(value) {
  return cheerio.load(String(value || "")).text().replace(/\s+/g, " ").trim();
}

const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
const articles = Array.isArray(data?.articles) ? data.articles : [];
const mainEntity = articles.map((article) => ({
  "@type": "Question",
  name: textFromHtml(article.question),
  acceptedAnswer: {
    "@type": "Answer",
    text: textFromHtml(article.answerHtml || article.summary || ""),
  },
}));

const json = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity,
})
  .replace(/</g, "\\u003c")
  .replace(/>/g, "\\u003e")
  .replace(/&/g, "\\u0026");

const html = await readFile(FAQ_HTML, "utf8");
const jsonLdBlockPattern = /<script id="faq-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/;

if (!jsonLdBlockPattern.test(html)) {
  throw new Error("Could not find faq-jsonld script block in faq.html");
}

const next = html.replace(
  jsonLdBlockPattern,
  `<script id="faq-jsonld" type="application/ld+json">${json}</script>`,
);

await writeFile(FAQ_HTML, next, "utf8");
console.log(
  `Wrote ${relative(process.cwd(), FAQ_HTML)} FAQPage JSON-LD — ${mainEntity.length} questions, ${Math.round(json.length / 102.4) / 10} KB`,
);
