function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeAcronymPunctuation(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/\b(?:[a-z]\.){2,}[a-z]?\.?/g, (match) => match.replace(/\./g, ""));
}

export function tokenizeBankSearchText(value) {
  return normalizeAcronymPunctuation(value).match(/[a-z0-9]+/g) || [];
}

function normalizeRankingText(value) {
  return tokenizeBankSearchText(value).join(" ");
}

function normalizeWebsiteSearchText(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
    .replace(/^[^@/\s]+@/, "")
    .split(/[/?#]/)[0]
    .replace(/^www\./, "")
    .replace(/\.+$/, "");
}

function getCompactSearchText(value) {
  return tokenizeBankSearchText(value).join("");
}

function isWebsiteLikeSearch(value) {
  const text = normalizeWhitespace(value).toLowerCase();
  return /^[a-z][a-z0-9+.-]*:\/\//.test(text) || (!/\s/.test(text) && text.includes("."));
}

function getNameTokenFilter(token, variant = "primary") {
  if (token === "us") return variant === "plain" ? "NAME:*us*" : "NAME:*u.s*";
  return `NAME:*${token}*`;
}

function getWebsiteSearchFragments(query) {
  const fragments = new Set();
  const websiteText = normalizeWebsiteSearchText(query);
  const compactText = getCompactSearchText(query);

  if (websiteText.length >= 2 && /[a-z0-9]/.test(websiteText) && !/\s/.test(websiteText)) {
    fragments.add(websiteText);
  }

  if (compactText.length >= 2 && !websiteText.includes(".")) {
    fragments.add(compactText);
  }

  return [...fragments];
}

function buildInstitutionFiltersForVariant(query, includeInactive, variant = "primary") {
  const normalized = normalizeWhitespace(query);
  if (!normalized) return "";

  const parts = [];
  const tokens = tokenizeBankSearchText(normalized);
  const certTokens = tokens.filter((token) => /^\d+$/.test(token));
  const nameTokens = tokens.filter((token) => !/^\d+$/.test(token));

  if (!nameTokens.length && !certTokens.length) {
    return "";
  }

  parts.push(...nameTokens.map((token) => getNameTokenFilter(token, variant)));
  parts.push(...certTokens.map((token) => `CERT:${token}`));

  if (!includeInactive) {
    parts.push("ACTIVE:1");
  }

  return parts.join(" AND ");
}

export function buildInstitutionFilterVariants(query, includeInactive) {
  const websiteLike = isWebsiteLikeSearch(query);
  const primary = websiteLike ? "" : buildInstitutionFiltersForVariant(query, includeInactive, "primary");
  const filters = primary ? [primary] : [];
  const digitsOnly = /^\d+$/.test(normalizeWhitespace(query));

  const tokens = tokenizeBankSearchText(query);
  if (!websiteLike && tokens.includes("us")) {
    const plain = buildInstitutionFiltersForVariant(query, includeInactive, "plain");
    if (plain && plain !== primary) filters.push(plain);
  }

  if (!digitsOnly) {
    getWebsiteSearchFragments(query).forEach((fragment) => {
      const parts = [`WEBADDR:*${fragment}*`];
      if (!includeInactive) parts.push("ACTIVE:1");
      const filter = parts.join(" AND ");
      if (!filters.includes(filter)) filters.push(filter);
    });
  }

  return filters;
}

export function buildInstitutionFilters(query, includeInactive) {
  return buildInstitutionFilterVariants(query, includeInactive)[0] || "";
}

function getOrderedTokenDistance(nameText, tokens) {
  let cursor = 0;
  let firstIndex = -1;
  let lastIndex = -1;

  for (const token of tokens) {
    const index = nameText.indexOf(token, cursor);
    if (index < 0) return Number.POSITIVE_INFINITY;
    if (firstIndex < 0) firstIndex = index;
    lastIndex = index;
    cursor = index + token.length;
  }

  return Math.max(0, lastIndex - firstIndex);
}

export function scoreBankMatch(bank, query) {
  const queryText = normalizeRankingText(query);
  const nameText = normalizeRankingText(bank.name);
  const websiteText = normalizeWebsiteSearchText(bank.website);
  const queryWebsiteText = normalizeWebsiteSearchText(query);
  const compactWebsiteText = getCompactSearchText(bank.website);
  const compactQueryText = getCompactSearchText(query);
  const tokens = tokenizeBankSearchText(query);
  const digitsOnly = /^\d+$/.test(normalizeWhitespace(query));
  const cert = String(bank.cert || "");

  if (!queryText) return Number.POSITIVE_INFINITY;
  if (digitsOnly && cert === queryText) return -100;
  if (digitsOnly && cert.startsWith(queryText)) return -50;
  if (nameText === queryText) return 0;
  if (nameText.startsWith(queryText)) return 10;
  if (nameText.includes(queryText)) return 20 + nameText.indexOf(queryText);

  const orderedDistance = getOrderedTokenDistance(nameText, tokens);
  if (Number.isFinite(orderedDistance)) {
    return 40 + orderedDistance;
  }

  if (tokens.every((token) => nameText.includes(token))) {
    return 80;
  }

  if (websiteText && queryWebsiteText) {
    if (websiteText === queryWebsiteText) return 5;
    if (websiteText.startsWith(queryWebsiteText)) return 15;
    if (websiteText.includes(queryWebsiteText)) return 25 + websiteText.indexOf(queryWebsiteText);
  }

  if (compactWebsiteText && compactQueryText) {
    if (compactWebsiteText === compactQueryText) return 30;
    if (compactWebsiteText.startsWith(compactQueryText)) return 35;
    if (compactWebsiteText.includes(compactQueryText)) return 45 + compactWebsiteText.indexOf(compactQueryText);
  }

  return Number.POSITIVE_INFINITY;
}

export function rankInstitutionOptions(options, query, limit) {
  return [...options]
    .map((bank) => ({ bank, score: scoreBankMatch(bank, query) }))
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      if (a.bank.active !== b.bank.active) return a.bank.active ? -1 : 1;
      if (a.bank.asset !== b.bank.asset) return b.bank.asset - a.bank.asset;
      if (a.bank.name.length !== b.bank.name.length) return a.bank.name.length - b.bank.name.length;
      return a.bank.name.localeCompare(b.bank.name);
    })
    .slice(0, limit)
    .map((item) => item.bank);
}
