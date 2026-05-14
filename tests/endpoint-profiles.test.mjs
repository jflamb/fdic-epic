import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as cheerio from "cheerio";

import {
  FAILED_BANK_BRANCH_CONFIG,
  WORKFLOWS,
} from "../intake-config.mjs";

const endpointProfiles = JSON.parse(
  await readFile(new URL("../endpoint-profiles.json", import.meta.url), "utf8")
);
const supportIntakeSource = await readFile(new URL("../support-intake.js", import.meta.url), "utf8");
const reportProblemHtml = await readFile(new URL("../report-problem.html", import.meta.url), "utf8");
const renderedIntakeHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");

const SUPPORTED_PATTERNS = new Set([
  "intake",
  "email-send",
  "external-handoff",
  "self-service",
]);

const failedBankProfileKeys = [
  "requestformDepositor",
  "fdicLienRelease",
  "requestform-RecordsResearch",
  "requestform-AssetManagement",
  "powerofattorneyform",
  "recordsdestructionform",
];

function extractConstObjectLiteral(source, constName) {
  const declaration = `const ${constName} = `;
  const startIndex = source.indexOf(declaration);
  assert.notEqual(startIndex, -1, `${constName} should be declared in support-intake.js`);

  const objectStart = source.indexOf("{", startIndex + declaration.length);
  assert.notEqual(objectStart, -1, `${constName} should be an object literal`);

  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let index = objectStart; index < source.length; index += 1) {
    const char = source[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (quote) {
      if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }

    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(objectStart, index + 1);
      }
    }
  }

  assert.fail(`${constName} object literal should close`);
}

function readRuntimeObject(constName) {
  const objectLiteral = extractConstObjectLiteral(supportIntakeSource, constName);
  // Only use this for pure literals. Runtime maps with DOM-bound values, such
  // as SECTION_CONFIG, should be inspected without evaluating the object.
  return Function(`"use strict"; return (${objectLiteral});`)();
}

function readRuntimeObjectKeys(constName) {
  const objectLiteral = extractConstObjectLiteral(supportIntakeSource, constName);
  const keys = [];
  for (const match of objectLiteral.matchAll(/^\s*([A-Za-z][A-Za-z0-9_]*):\s*\{/gm)) {
    keys.push(match[1]);
  }
  return keys;
}

const fieldElementIds = readRuntimeObject("FIELD_ELEMENT_IDS");
const sectionFields = readRuntimeObject("SECTION_FIELDS");
const sectionConfigKeys = new Set(readRuntimeObjectKeys("SECTION_CONFIG"));
const supportedSections = new Set(
  Object.keys(sectionFields).filter((sectionName) => sectionConfigKeys.has(sectionName))
);
const supportedFields = new Set(Object.keys(fieldElementIds));
const intakePage = cheerio.load(renderedIntakeHtml);

assert.ok(supportedFields.size > 0, "FIELD_ELEMENT_IDS extraction should find supported fields");
assert.ok(supportedSections.size > 0, "SECTION_CONFIG and SECTION_FIELDS extraction should find supported sections");

function allWorkflowTopics() {
  return Object.values(WORKFLOWS).flatMap((workflow) => workflow.topics);
}

function profileLabel(key) {
  return `${key} (${endpointProfiles[key]?.label || "unlabeled profile"})`;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function assertUsableUrl(value, message) {
  assert.ok(isNonEmptyString(value), message);
  const url = new URL(value);
  assert.match(url.protocol, /^https?:$/, `${message} should use http or https`);
}

function hasRenderedField(fieldName) {
  const elementId = fieldElementIds[fieldName];
  if (!elementId) {
    return false;
  }

  return Boolean(
    intakePage(`#${elementId}`).length ||
      intakePage(`[input-id="${elementId}"]`).length ||
      intakePage(`[required-marker-id="${elementId.replace(/-input$/, "-required-marker")}"]`).length
  );
}

test("failed-bank contact profiles do not require business phone", () => {
  for (const key of failedBankProfileKeys) {
    assert.ok(endpointProfiles[key], `${key} profile should exist`);
    assert.ok(
      !endpointProfiles[key].requiredFields.includes("businessPhone"),
      `${key} should not require businessPhone`
    );
  }
});

test("workflow endpoint keys resolve to endpoint profiles", () => {
  for (const [workflowKey, workflow] of Object.entries(WORKFLOWS)) {
    for (const topic of workflow.topics) {
      assert.ok(
        endpointProfiles[topic.endpointKey],
        `${workflowKey}.${topic.value} references missing endpoint profile ${topic.endpointKey}`
      );
    }
  }
});

test("endpoint profiles use supported patterns", () => {
  for (const [key, profile] of Object.entries(endpointProfiles)) {
    assert.ok(
      SUPPORTED_PATTERNS.has(profile.pattern),
      `${profileLabel(key)} has unsupported pattern ${profile.pattern}`
    );
  }
});

test("intake profiles only reference supported sections and fields", () => {
  for (const [key, profile] of Object.entries(endpointProfiles)) {
    if (profile.pattern !== "intake") {
      continue;
    }

    for (const sectionName of profile.sections || []) {
      assert.ok(
        supportedSections.has(sectionName),
        `${profileLabel(key)} references unsupported section ${sectionName}`
      );
    }

    for (const fieldName of profile.requiredFields || []) {
      assert.ok(
        supportedFields.has(fieldName),
        `${profileLabel(key)} requires unsupported field ${fieldName}`
      );
      assert.ok(
        hasRenderedField(fieldName),
        `${profileLabel(key)} requires ${fieldName}, but no rendered field or custom field mapping exists`
      );
    }
  }
});

test("configured intake sections map to supported runtime fields", () => {
  for (const sectionName of supportedSections) {
    assert.ok(
      Array.isArray(sectionFields[sectionName]) && sectionFields[sectionName].length > 0,
      `${sectionName} should map to at least one field`
    );

    for (const fieldName of sectionFields[sectionName]) {
      if (fieldName === "outcome") {
        assert.match(supportIntakeSource, /const outcomeGroup = document\.getElementById\("outcome-group"\)/);
        continue;
      }
      assert.ok(
        supportedFields.has(fieldName),
        `${sectionName} maps to unsupported field ${fieldName}`
      );
    }
  }
});

test("report-problem entrypoint resolves to the rendered intake form", () => {
  assert.match(reportProblemHtml, /window\.location\.replace\(target\)/);
  assert.equal(intakePage("#support-intake-form").length, 1);
});

test("non-intake endpoint profiles include pattern-specific metadata", () => {
  for (const [key, profile] of Object.entries(endpointProfiles)) {
    if (profile.pattern === "email-send") {
      assert.ok(isNonEmptyString(profile.prefilled?.to), `${profileLabel(key)} needs prefilled.to`);
      assert.match(profile.prefilled.to, /@/, `${profileLabel(key)} prefilled.to should look like an email address`);
      assert.ok(isNonEmptyString(profile.prefilled?.subject), `${profileLabel(key)} needs prefilled.subject`);
      continue;
    }

    if (profile.pattern === "external-handoff" || profile.pattern === "self-service") {
      assertUsableUrl(profile.url, `${profileLabel(key)} needs a usable URL`);
      assert.ok(isNonEmptyString(profile.description), `${profileLabel(key)} needs a description`);
    }
  }
});

test("topic-level dynamic requirements are backed by supported fields and sections", () => {
  for (const topic of allWorkflowTopics()) {
    if (topic.includeDesiredResolution) {
      assert.equal(
        endpointProfiles[topic.endpointKey]?.pattern,
        "intake",
        `${topic.value} adds desiredResolution, so it must route to an intake profile`
      );
      assert.ok(supportedSections.has("desiredResolution"), "desiredResolution section should be supported");
      assert.ok(supportedFields.has("desiredResolution"), "desiredResolution field should be supported");
      assert.ok(hasRenderedField("desiredResolution"), "desiredResolution should be rendered by the intake form");
    }

    if (topic.includeOutcome) {
      assert.equal(
        endpointProfiles[topic.endpointKey]?.pattern,
        "intake",
        `${topic.value} adds outcome, so it must route to an intake profile`
      );
      assert.ok(supportedSections.has("outcome"), "outcome section should be supported");
      assert.match(supportIntakeSource, /includeOutcome[\s\S]+insertAfter\("outcome", "narrative"\)/);
      assert.equal(intakePage("#outcome-group").length, 1, "outcome choice group should render in the intake form");
    }
  }
});

test("failed-bank branch config matches failed-bank topics", () => {
  const failedBankTopicValues = new Set(WORKFLOWS.failed.topics.map((topic) => topic.value));

  for (const [topicValue, config] of Object.entries(FAILED_BANK_BRANCH_CONFIG)) {
    assert.ok(
      failedBankTopicValues.has(topicValue),
      `${topicValue} branch config does not match a failed-bank topic`
    );
    assert.ok(Array.isArray(config.options) && config.options.length > 0, `${topicValue} needs branch options`);

    for (const [index, option] of config.options.entries()) {
      assert.ok(isNonEmptyString(option.value), `${topicValue} option ${index} needs a value`);
      assert.ok(isNonEmptyString(option.title), `${topicValue} option ${index} needs a title`);
      assert.ok(isNonEmptyString(option.detail), `${topicValue} option ${index} needs detail`);
    }
  }
});
