import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const CONTACT = {
  firstName: "Alex",
  lastName: "Rivera",
  email: "alex.rivera@example.com",
  street: "123 Market Street",
  city: "Cary",
  state: "North Carolina",
  postal: "27513",
};

const LONG_DETAILS =
  "The customer needs help routing this prototype request and wants enough detail included for the intake review page.";

async function mockNetwork(page) {
  await page.route("https://api.fdic.gov/banks/institutions**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            data: {
              NAME: "Fixture National Bank",
              CERT: "12345",
              CITY: "Cary",
              STALP: "NC",
              ACTIVE: "1",
              WEBADDR: "fixturebank.example",
              MAINOFF: "1",
              REGAGNT: "FDIC",
              ASSET: "1000000",
            },
          },
        ],
      }),
    });
  });

  await page.route("https://www.fdic.gov/bank-failures/download-data.csv", async (route) => {
    await route.fulfill({
      contentType: "text/csv",
      body: [
        "Bank Name,City,State,Cert,Acquiring Institution,Closing Date",
        "Fixture Failed Bank,Cary,NC,54321,Fixture Bridge Bank,01-Jan-26",
      ].join("\n"),
    });
  });
}

async function openIntake(page, mode) {
  await mockNetwork(page);
  await page.goto(`/index.html?mode=${mode}`);
  await expect(page.locator("#support-intake-form")).toBeVisible();
  await expect(page.locator("#topic-wrapper")).toBeVisible();
}

async function choose(page, name, value) {
  const input = page.locator(`input[name="${name}"][value="${value}"]`);
  await expect(input).toBeVisible();
  await input.click();
  await expect(input).toBeChecked();
}

async function continueTo(page, selector) {
  const button = page.locator("#next-step-button");
  if (selector) {
    const target = page.locator(selector);
    if (await target.isVisible()) {
      return;
    }
    await expect(button).toBeEnabled();
    await button.click();
    await expect(target).toBeVisible();
    return;
  }

  await expect(button).toBeEnabled();
  await button.click();
}

async function fillContact(page) {
  await page.locator("#first-name-input").fill(CONTACT.firstName);
  await page.locator("#last-name-input").fill(CONTACT.lastName);
  await page.locator("#email-input").fill(CONTACT.email);
  await page.locator("#email-confirm-input").fill(CONTACT.email);
}

async function fillMailingAddress(page, { includePostal = true } = {}) {
  await page.locator("#mailing-street-input").fill(CONTACT.street);
  await page.locator("#mailing-city-input").fill(CONTACT.city);
  await page.locator("#mailing-state-input").selectOption(CONTACT.state);
  if (includePostal) {
    await page.locator("#mailing-postal-input").fill(CONTACT.postal);
  }
}

async function fillNarrative(page, text = LONG_DETAILS) {
  await page.locator("#details-input").fill(text);
}

async function dismissContextualFaqsIfShown(page) {
  await page.locator("#details-input").evaluate((input) => input.blur());
  const wrapper = page.locator("#contextual-faq-wrapper");
  const dismiss = page.locator("#contextual-faq-dismiss");
  try {
    await expect(wrapper).toBeVisible({ timeout: 750 });
  } catch {
    return;
  }
  await dismiss.click();
  await expect(wrapper).toBeHidden();
}

async function selectSpecificBank(page) {
  await page.locator("#specific-bank-search-input").fill("fixture national");
  await expect(page.locator("#specific-bank-search-input-listbox [role='option']")).toContainText("Fixture National Bank");
  await page.locator("#specific-bank-search-input-listbox [role='option']").first().click();
}

async function selectFailedBank(page) {
  await page.locator("#failed-bank-search-input").fill("Fixture");
  const option = page.locator("#failed-bank-listbox [role='option']").first();
  await expect(option).toContainText("Fixture Failed Bank");
  await option.click();
  await expect(page.locator("#failed-bank-search-input")).toHaveValue(/Fixture Failed Bank/);
}

async function submitForReview(page) {
  const reviewButton = page.locator("#review-submission-btn");
  await expect(reviewButton).toBeVisible();
  await expect(reviewButton).toBeEnabled();
  await reviewButton.click();
  await expect(page).toHaveURL(/review-submission\.html/);
  await expect(page.locator("#review-summary")).toBeVisible();
}

test("report flow completes required sections and persists draft values to review", async ({ page }) => {
  await openIntake(page, "report");

  await expect(page.locator("#next-step-button")).toBeDisabled();
  await choose(page, "topic", "bank_issue");
  await continueTo(page, "#specific-bank-wrapper");

  await selectSpecificBank(page);
  await expect(page.locator("#specific-bank-search-input-branch-lookup")).toBeVisible();
  await expect(page.locator("#specific-bank-search-input-branch-zip")).toBeVisible();
  await expect(page.locator("#next-step-button")).toBeEnabled();

  await continueTo(page, "#details-wrapper");
  await fillNarrative(page, "Fixture National Bank charged fees after account closure and the customer wants FDIC review.");
  await dismissContextualFaqsIfShown(page);
  await continueTo(page, "#identity-wrapper");
  await fillContact(page);
  await continueTo(page, "#mailing-wrapper");
  await fillMailingAddress(page);
  await continueTo(page, "#resolution-wrapper");
  await page.locator("#resolution-input").fill("Refund the fees and explain the bank's closure process.");
  await continueTo(page, "#authorization-wrapper");
  await page.locator("#authorization-input").check();

  await submitForReview(page);
  await expect(page.locator("#review-intent")).toContainText("Report a problem or concern");
  await expect(page.locator("#review-topic")).toContainText("A bank or financial institution");
  await expect(page.locator("#review-specific-bank")).toContainText("Fixture National Bank");
  await expect(page.locator("#review-details")).toContainText("charged fees after account closure");
  await expect(page.locator("#review-name")).toContainText("Alex Rivera");
  await expect(page.locator("#review-email")).toContainText(CONTACT.email);
  await expect(page.locator("#review-address")).toContainText("Cary, North Carolina");
  await expect(page.locator("#review-address")).toContainText("27513");
  await expect(page.locator("#review-endpoint")).toContainText("Bank and Consumer Response Team");
});

test("ask flow exposes the deposit insurance endpoint sections and gates Continue", async ({ page }) => {
  await openIntake(page, "ask");

  await choose(page, "topic", "deposit_question");
  await expect(page.locator("#deposit-insurance-phone-callout")).toBeVisible();

  const progressLabels = await page.locator("#progress-list .progress-label").allTextContents();
  expect(progressLabels).toEqual([
    "What do you need help with?",
    "What is your concern about?",
    "Issue details",
    "Contact information",
    "Mailing address",
    "Authorization",
  ]);

  await continueTo(page, "#details-wrapper");
  await expect(page.locator("#next-step-button")).toBeDisabled();
  await fillNarrative(page, "I need deposit insurance guidance for multiple ownership categories at an FDIC-insured bank.");
  await expect(page.locator("#next-step-button")).toBeEnabled();
});

test("DIR flow routes completed data requests to review", async ({ page }) => {
  await openIntake(page, "dir");

  await choose(page, "topic", "qbp_analysis");
  await continueTo(page, "#identity-wrapper");
  await fillContact(page);
  await continueTo(page, "#details-wrapper");
  await fillNarrative(page, "I need help locating Quarterly Banking Profile trend data for a public research request.");

  await submitForReview(page);
  await expect(page.locator("#review-topic")).toContainText("Quarterly Banking Profile");
  await expect(page.locator("#review-endpoint")).toContainText("Data and Directory Support Team");
});

test("failed-bank intake flow keeps failed-bank routing separate and reaches review", async ({ page }) => {
  await openIntake(page, "failed");

  await choose(page, "topic", "depositor_claim");
  await continueTo(page, "#failed-branch-wrapper");
  await choose(page, "failedBankBranch", "Change of Address");
  await continueTo(page, "#failed-bank-wrapper");
  await selectFailedBank(page);
  await continueTo(page, "#details-wrapper");
  await fillNarrative(page, "I need to update the mailing address for a depositor claim tied to this failed bank.");
  await dismissContextualFaqsIfShown(page);
  await continueTo(page, "#identity-wrapper");
  await fillContact(page);
  await continueTo(page, "#mailing-wrapper");
  await fillMailingAddress(page, { includePostal: false });

  await submitForReview(page);
  await expect(page.locator("#review-topic")).toContainText("Depositor claims and account records: Change my address");
  await expect(page.locator("#review-failed-bank")).toContainText("Fixture Failed Bank");
  await expect(page.locator("#review-endpoint")).toContainText("Failed Bank Depositor Services Team");
});

test("failed-bank email-send paths show the email treatment instead of standard review", async ({ page }) => {
  await openIntake(page, "failed");

  await choose(page, "topic", "tax_documents");

  await expect(page.locator("#email-send-pattern")).toBeVisible();
  await expect(page.locator("#email-send-pattern")).toContainText("Send an email request");
  await expect(page.locator("#email-send-pattern")).toContainText("taxeoyreporting@fdic.gov");
  await expect(page.locator("#email-send-pattern")).toContainText("Request a Form 1098, 1099, or W2");
  await expect(page.locator("#email-send-open")).toBeVisible();
  await expect(page.locator("#review-submission-btn")).toBeHidden();
});

test("external handoff paths explain the destination and link out", async ({ page }) => {
  await openIntake(page, "dir");

  await choose(page, "topic", "ffiec_data");

  await expect(page.locator("#external-handoff-pattern")).toBeVisible();
  await expect(page.locator("#external-handoff-pattern")).toContainText("Use the FFIEC Help Desk");
  await expect(page.locator(".external-handoff-link")).toHaveAttribute(
    "href",
    "https://cdr.ffiec.gov/public/HelpFileContainers/HelpDeskForm.aspx",
  );
  await expect(page.locator("#review-submission-btn")).toBeHidden();
});

test("FAQ deep links open and position the target item", async ({ page }) => {
  const faqData = JSON.parse(await readFile(new URL("../../data.json", import.meta.url), "utf8"));
  const article = faqData.articles.find((item) => item?.urlName);
  expect(article, "Expected at least one FAQ article with a urlName").toBeDefined();
  const targetId = `faq-${article.urlName}`;

  await page.goto(`/faq.html#${targetId}`);
  const target = page.locator(`#${targetId}`);
  await expect(target.locator("details")).toHaveAttribute("open", "");

  const targetState = await target.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const summary = node.querySelector("summary");
    return {
      top: rect.top,
      bottom: rect.bottom,
      viewportHeight: window.innerHeight,
      summaryTabIndex: summary?.tabIndex,
    };
  });

  expect(targetState.bottom).toBeGreaterThan(0);
  expect(targetState.top).toBeLessThan(targetState.viewportHeight);
  expect(targetState.summaryTabIndex).toBe(0);
});
