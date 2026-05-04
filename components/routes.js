export const ROUTES = {
  home: "index.html",
  reportProblem: "report-problem.html",
  reportMode: (mode) => `report-problem.html?mode=${encodeURIComponent(mode)}`,
  reportEdit: (mode) => `report-problem.html?mode=${encodeURIComponent(mode)}&restore=review`,
  askQuestion: "report-problem.html?mode=ask",
  failedBank: "report-problem.html?mode=failed",
  viewCases: "view-cases.html",
  faq: "faq.html",
  reviewSubmission: "review-submission.html",
  submissionConfirmation: "submission-confirmation.html",
};
