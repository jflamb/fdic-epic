import test from "node:test";
import assert from "node:assert/strict";

import {
  buildInstitutionFilterVariants,
  buildInstitutionFilters,
  rankInstitutionOptions,
  scoreBankMatch,
} from "../components/fdic-bank-selector-utils.mjs";

test("scoreBankMatch gives exact certificate matches the strongest score", () => {
  assert.equal(scoreBankMatch({ name: "Bank of America, National Association", cert: "3510" }, "3510"), -100);
  assert.equal(scoreBankMatch({ name: "Bank of America, National Association", cert: "3510" }, "351"), -50);
});

test("rankInstitutionOptions favors phrase-prefix matches over loose token matches", () => {
  const ranked = rankInstitutionOptions(
    [
      { name: "American Bank of Baxter Springs", cert: "4624", active: true, asset: 100 },
      { name: "Bank of America California, National Association", cert: "25178", active: true, asset: 1000 },
      { name: "Bank of America, National Association", cert: "3510", active: true, asset: 2000 },
      { name: "First National Bank of America", cert: "17438", active: true, asset: 500 },
    ],
    "Bank of America",
    4,
  );

  assert.deepEqual(
    ranked.map((bank) => bank.name),
    [
      "Bank of America, National Association",
      "Bank of America California, National Association",
      "First National Bank of America",
      "American Bank of Baxter Springs",
    ],
  );
});

test("scoreBankMatch returns infinity for non-matching query text", () => {
  assert.equal(scoreBankMatch({ name: "Unrelated Institution", cert: "1" }, "Bank of America"), Number.POSITIVE_INFINITY);
});

test("scoreBankMatch treats US and U.S. bank-name acronyms as equivalent", () => {
  const bank = { name: "U.S. Bank National Association", cert: "6548" };

  assert.equal(scoreBankMatch(bank, "US Bank"), 10);
  assert.equal(scoreBankMatch(bank, "U.S. Bank"), 10);
});

test("rankInstitutionOptions puts U.S. Bank first for US Bank queries", () => {
  const ranked = rankInstitutionOptions(
    [
      { name: "Sumitomo Mitsui Trust Bank (U.S.A.) Limited", cert: "27054", active: true, asset: 3773287 },
      { name: "U.S. Bank National Association", cert: "6548", active: true, asset: 676125227 },
      { name: "1st Financial Bank USA", cert: "1673", active: true, asset: 1347303 },
    ],
    "US Bank",
    3,
  );

  assert.equal(ranked[0].name, "U.S. Bank National Association");
});

test("buildInstitutionFilters uses the BankFind dotted-acronym filter for US Bank queries", () => {
  assert.equal(buildInstitutionFilters("US Bank", false), "NAME:*u.s* AND NAME:*bank* AND ACTIVE:1");
  assert.equal(buildInstitutionFilters("U.S. Bank", false), "NAME:*u.s* AND NAME:*bank* AND ACTIVE:1");
});

test("buildInstitutionFilterVariants includes a plain-US fallback for legal names without dots", () => {
  assert.deepEqual(buildInstitutionFilterVariants("US Metro", false), [
    "NAME:*u.s* AND NAME:*metro* AND ACTIVE:1",
    "NAME:*us* AND NAME:*metro* AND ACTIVE:1",
    "WEBADDR:*usmetro* AND ACTIVE:1",
  ]);
});

test("scoreBankMatch matches full and partial website URL queries", () => {
  const bank = {
    name: "U.S. Bank National Association",
    cert: "6548",
    website: "www.usbank.com",
  };

  assert.equal(scoreBankMatch(bank, "https://www.usbank.com"), 5);
  assert.equal(scoreBankMatch(bank, "usbank.com"), 5);
  assert.equal(scoreBankMatch(bank, "usbank"), 15);
});

test("rankInstitutionOptions can rank by website URL when the name does not contain the query", () => {
  const ranked = rankInstitutionOptions(
    [
      { name: "Unrelated Bank", cert: "1", active: true, asset: 10, website: "www.example.com" },
      { name: "U.S. Bank National Association", cert: "6548", active: true, asset: 676125227, website: "www.usbank.com" },
    ],
    "usbank.com",
    2,
  );

  assert.equal(ranked[0].name, "U.S. Bank National Association");
});

test("buildInstitutionFilterVariants includes website filters and preserves cert-only searches", () => {
  assert.deepEqual(buildInstitutionFilterVariants("https://www.usbank.com/checking", false), [
    "WEBADDR:*usbank.com* AND ACTIVE:1",
  ]);

  assert.deepEqual(buildInstitutionFilterVariants("usbank.com", false), [
    "WEBADDR:*usbank.com* AND ACTIVE:1",
  ]);

  assert.deepEqual(buildInstitutionFilterVariants("6548", false), [
    "CERT:6548 AND ACTIVE:1",
  ]);
});
