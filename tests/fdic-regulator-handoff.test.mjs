import test from "node:test";
import assert from "node:assert/strict";

import { getRegulatorHandoffProfile } from "../components/fdic-regulator-handoff.mjs";

test("getRegulatorHandoffProfile returns null for FDIC-regulated banks", () => {
  assert.equal(
    getRegulatorHandoffProfile({ name: "Ergo Bank", regulator: "FDIC" }),
    null,
  );
});

test("getRegulatorHandoffProfile returns the OCC handoff for OCC-regulated banks", () => {
  const profile = getRegulatorHandoffProfile({
    name: "Bank of America, National Association",
    regulator: "OCC",
  });

  assert.equal(profile.label, "Office of the Comptroller of the Currency (OCC)");
  assert.equal(profile.pattern, "external-handoff");
  assert.equal(profile.url, "https://www.helpwithmybank.gov/file-a-complaint/index-file-a-complaint.html");
  assert.match(profile.description, /not the FDIC/);
});

test("getRegulatorHandoffProfile routes unknown regulators to regulator lookup guidance", () => {
  const profile = getRegulatorHandoffProfile({
    name: "Example Bank",
    regulator: "OTHER",
  });

  assert.equal(profile.label, "Bank regulator handoff");
  assert.equal(profile.url, "https://www.helpwithmybank.gov/who-regulates-my-bank/index-who-regulates-bank.html");
  assert.doesNotMatch(profile.description, /FDIC's regulator guidance/);
});

test("getRegulatorHandoffProfile returns null when the specific-bank step is not active", () => {
  assert.equal(
    getRegulatorHandoffProfile({ name: "Bank of America, National Association", regulator: "OCC" }, false),
    null,
  );
});

