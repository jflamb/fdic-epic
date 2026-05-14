import { readFile } from "node:fs/promises";

import { WORKFLOWS } from "../intake-config.mjs";

const SUPPORTED_PATTERNS = new Set([
  "intake",
  "email-send",
  "external-handoff",
  "self-service",
]);

const REQUIRED_PROFILE_PROPS = new Set([
  "label",
  "queueCode",
  "pattern",
  "sections",
  "requiredFields",
  "conditionalFields",
]);

const ACTION_CODE_TO_PROFILE_KEY = {
  Receivership: "factsemailsend-Receivership",
  bankMerger: "factsemailsend-bankMerger",
  bankdataguide: "fdicGeneralInfo",
  callcenterhours: "fdicGeneralInfo",
  depositsinsured: "fdicGeneralInfo",
  diFAQs: "fdicGeneralInfo",
  factssite: "fdicGeneralInfo",
  faqsite: "fdicGeneralInfo",
  fdicLienRelease: "fdicLienRelease",
  fdicbaform: "fdicbaform",
  fdiccaform: "fdiccaform",
  fdiccatalog: "fdiccatalog",
  fdiccommentform: "fdiccommentform",
  fdicdiform: "fdicdiform",
  fdicdimcomplaintform: "fdicdimcomplaintform",
  fdicdirform: "fdicdirform",
  fdichomepage: "fdicGeneralInfo",
  fdicooform: "fdiccommentform",
  fidciaform: "fidciaform",
  helpdeskform: "helpdeskform",
  knowmore: "fdicGeneralInfo",
  paAgreement: "paAgreement",
  powerofattorneyform: "powerofattorneyform",
  recordsdestructionform: "recordsdestructionform",
  requestformAddress: "requestformDepositor",
  requestformAsset: "requestform-AssetManagement",
  requestformAssetRetainedLoan: "requestform-AssetManagement",
  requestformDepositors: "requestformDepositor",
  requestformIRA: "requestformDepositor",
  requestformInquiry: "requestformDepositor",
  requestformLocating: "requestformDepositor",
  requestformName: "requestformDepositor",
  requestformUnclaimed: "requestformDepositor",
  requestformUninsured: "requestformDepositor",
  requestformLR: "fdicLienRelease",
  requestformLR1: "fdicLienRelease",
  requestformLR2: "fdicLienRelease",
  requestformLR3: "fdicLienRelease",
  requestformLR4: "fdicLienRelease",
  requestformLR5: "fdicLienRelease",
  requestformLR6: "fdicLienRelease",
  requestformRR: "requestform-RecordsResearch",
  requestformRR1: "requestform-RecordsResearch",
  requestformRR2: "requestform-RecordsResearch",
  requestformRR3: "requestform-RecordsResearch",
  requestformRR4: "requestform-RecordsResearch",
  taxUnit: "factsemailsend-taxUnit",
};

function profileKeyForActionCode(actionCode) {
  return ACTION_CODE_TO_PROFILE_KEY[actionCode] || null;
}

function addError(errors, message) {
  errors.push(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isUsableUrl(value) {
  if (!isNonEmptyString(value)) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getWorkflowTopics() {
  return Object.entries(WORKFLOWS).flatMap(([workflowKey, workflow]) =>
    (workflow.topics || []).map((topic) => ({ ...topic, workflowKey }))
  );
}

const [endpointProfiles, activeMatrix] = await Promise.all([
  readFile(new URL("../endpoint-profiles.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../workflow-target-ia-matrix.active.json", import.meta.url), "utf8").then(JSON.parse),
]);

const errors = [];
const endpointProfileKeys = new Set(Object.keys(endpointProfiles));
const targetPathIds = new Set((activeMatrix.target_paths || []).map((targetPath) => targetPath.id));
const workflowTopics = getWorkflowTopics();
const workflowEndpointKeys = new Set(workflowTopics.map((topic) => topic.endpointKey));
const observedCrosswalkRows = (activeMatrix.crosswalk || []).filter(
  (row) => row.observed_in_active_source_lists !== false
);
const coveredProfileKeys = new Set();

if (!Array.isArray(activeMatrix.target_paths) || activeMatrix.target_paths.length === 0) {
  addError(errors, "workflow-target-ia-matrix.active.json needs a non-empty target_paths array.");
}

if (!Array.isArray(activeMatrix.crosswalk) || activeMatrix.crosswalk.length === 0) {
  addError(errors, "workflow-target-ia-matrix.active.json needs a non-empty crosswalk array.");
}

for (const [profileKey, profile] of Object.entries(endpointProfiles)) {
  for (const prop of REQUIRED_PROFILE_PROPS) {
    if (!(prop in profile)) {
      addError(errors, `${profileKey} is missing required endpoint profile property ${prop}.`);
    }
  }

  if (!isNonEmptyString(profile.label)) {
    addError(errors, `${profileKey} needs a non-empty label.`);
  }

  if (!SUPPORTED_PATTERNS.has(profile.pattern)) {
    addError(errors, `${profileKey} uses unsupported pattern ${profile.pattern}.`);
  }

  if (!Array.isArray(profile.sections)) {
    addError(errors, `${profileKey}.sections must be an array.`);
  }

  if (!Array.isArray(profile.requiredFields)) {
    addError(errors, `${profileKey}.requiredFields must be an array.`);
  }

  if (profile.pattern === "intake") {
    if (!Array.isArray(profile.sections) || profile.sections.length === 0) {
      addError(errors, `${profileKey} is intake but does not declare any sections.`);
    }

    if (!Array.isArray(profile.requiredFields) || profile.requiredFields.length === 0) {
      addError(errors, `${profileKey} is intake but does not declare any required fields.`);
    }
  }

  if (!profile.conditionalFields || Array.isArray(profile.conditionalFields) || typeof profile.conditionalFields !== "object") {
    addError(errors, `${profileKey}.conditionalFields must be an object.`);
  }

  if (profile.pattern === "email-send") {
    if (!isNonEmptyString(profile.prefilled?.to) || !profile.prefilled.to.includes("@")) {
      addError(errors, `${profileKey} is email-send but does not have a usable prefilled.to value.`);
    }

    if (!isNonEmptyString(profile.prefilled?.subject)) {
      addError(errors, `${profileKey} is email-send but does not have a prefilled.subject value.`);
    }
  }

  if ((profile.pattern === "external-handoff" || profile.pattern === "self-service") && !isUsableUrl(profile.url)) {
    addError(errors, `${profileKey} is ${profile.pattern} but does not have a usable url.`);
  }
}

for (const topic of workflowTopics) {
  if (!endpointProfileKeys.has(topic.endpointKey)) {
    addError(errors, `${topic.workflowKey}.${topic.value} references missing endpoint profile ${topic.endpointKey}.`);
  }
}

for (const row of observedCrosswalkRows) {
  if (!isNonEmptyString(row.action_code)) {
    addError(errors, "Active target matrix crosswalk row is missing action_code.");
    continue;
  }

  if (!targetPathIds.has(row.target_path_id)) {
    addError(errors, `${row.action_code} references missing target path ${row.target_path_id}.`);
  }

  const profileKey = profileKeyForActionCode(row.action_code);
  if (!profileKey) {
    addError(errors, `${row.action_code} is missing from ACTION_CODE_TO_PROFILE_KEY.`);
    continue;
  }

  if (!endpointProfileKeys.has(profileKey)) {
    addError(errors, `${row.action_code} resolves to missing endpoint profile ${profileKey}.`);
    continue;
  }

  coveredProfileKeys.add(profileKey);
}

for (const endpointKey of workflowEndpointKeys) {
  if (!coveredProfileKeys.has(endpointKey)) {
    addError(errors, `${endpointKey} is used by intake-config.mjs but is not covered by workflow-target-ia-matrix.active.json.`);
  }
}

for (const profileKey of endpointProfileKeys) {
  if (!workflowEndpointKeys.has(profileKey) && !coveredProfileKeys.has(profileKey)) {
    addError(errors, `${profileKey} is not referenced by intake-config.mjs or workflow-target-ia-matrix.active.json.`);
  }
}

if (errors.length > 0) {
  console.error("Routing config audit failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Routing config audit passed: ${workflowTopics.length} workflow topics, ` +
    `${endpointProfileKeys.size} endpoint profiles, ${observedCrosswalkRows.length} active crosswalk rows.`
);
