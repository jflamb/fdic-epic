# Proposed Target IA Matrix

Drafted on **February 24, 2026** using the normalized production rule matrix as source data.

## Design Goals
- Remove duplicate intents and labels that route to the same backend destination.
- Use plain language for user-facing choices and preserve technical routing internally.
- Keep failed-bank tasks grouped by user goal (depositor, lien/collateral, records, assets).
- Route self-service content directly without forcing form intake where possible.

## Canonical Target Paths
| Target Path ID | Primary Nav | Canonical Intent | Canonical Destination | Required Intake Fields | Notes |
|---|---|---|---|---|---|
| T1_REPORT_BANK_OR_FDIC_CONCERN | Report a Problem | Complaint or concern | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccustomerassistanceform/ | Topic, narrative, outcome, contact details | Primary path for bank or FDIC concerns; replaces multiple overlapping complaint labels. |
| T2_REPORT_SMALL_BUSINESS_BANK_CONCERN | Report a Problem | Small business bank concern | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicbusinessassistanceform/ | Topic, business context, narrative, outcome, contact details | Used when issue is tied to small-business banking products/services. |
| T3_ASK_DEPOSIT_INSURANCE | Ask a Question | Deposit insurance question | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdepositinsuranceform/ | Question category, narrative, outcome, contact details | Canonical route for insurance coverage/claims questions. |
| T4_ASK_BANK_DATA_AND_RESEARCH | Ask a Question | Bank data, history, and reporting | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdirform/ | Data topic, narrative, contact details | Consolidates FDIC analysis, bank history, and data-tools requests. |
| T5_REPORT_APPRAISAL_ISSUE | Report a Problem | Appraisal concern | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicinteragencyform/ | Appraisal type, narrative, supporting details, contact details | Single path for all appraisal-related concerns. |
| T6_REPORT_INSURED_STATUS_MISREPRESENTATION | Report a Problem | FDIC-insured status concern | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdimcomplaintform/ | Entity/product details, narrative, evidence, contact details | Dedicated route for misrepresentation of FDIC insurance status. |
| T7_FAILED_BANK_DEPOSITOR_SERVICES | Get Help with a Failed Bank | Depositor claims and account servicing | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Depositor%20Claims | Request type, failed bank, narrative, contact details | Includes address/name changes, uninsured claim questions, and dividend/deposit status. |
| T8_FAILED_BANK_LIEN_AND_LOAN_DOCUMENTS | Get Help with a Failed Bank | Lien release and collateral documents | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien%20Release | Document type, failed bank, borrower/property identifiers, contact details | Consolidates lien release, assignment, allonge, and related collateral requests. |
| T9_FAILED_BANK_RECORDS_AND_EMPLOYMENT | Get Help with a Failed Bank | Records research, employment verification, tax forms | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records%20Research | Record type, institution, identifiers, contact details | Includes bank statement/check copies, employment verification, records inquiries. |
| T10_FAILED_BANK_ASSET_AND_REAL_ESTATE | Get Help with a Failed Bank | Asset management and real estate transactions | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Asset%20Management | Asset type, transaction context, identifiers, contact details | Includes retained loans, ORE deed requests, and property/asset transactions. |
| T11_PARTNER_OR_SPECIALIZED_EXTERNAL | Context-dependent handoff | Partner system or specialized external workflow | External/partner route based on topic | Minimal routing metadata only before handoff | Used for catalog ordering, FFIEC helpdesk, failed-bank-list handoffs, and other external destinations. |
| T12_SELF_SERVICE_INFORMATION | Ask a Question | Self-service guidance and educational content | FDIC.gov informational page | None | Route users directly to trusted info pages when case intake is not needed. |
| T13_VIEW_MY_CASES | View My Cases | Case tracking and follow-up | https://ask.fdic.gov/fdicinformationandsupportcenter/s/mycases | Authenticated user session | Separate from intake; current parity evidence covers entry and basic navigation only, not full case lifecycle behavior. |

## Crosswalk: Current Action Code -> Target Path
| Current Action Code | Current Endpoint | Target Path ID | Disposition | Active in Current Source Lists |
|---|---|---|---|---|
| Receivership | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=Receivership | T9_FAILED_BANK_RECORDS_AND_EMPLOYMENT | keep-distinct-pattern | Yes |
| bankMerger | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=bankMerger | T9_FAILED_BANK_RECORDS_AND_EMPLOYMENT | keep-distinct-pattern | Yes |
| bankdataguide | https://www.fdic.gov/bank/statistical/guide/ | T12_SELF_SERVICE_INFORMATION | self-service | Yes |
| callcenterhours | https://www.fdic.gov/about/contact/ask/ | T12_SELF_SERVICE_INFORMATION | self-service | Yes |
| depositsinsured | http://www.fdic.gov/deposit/deposits/ | T12_SELF_SERVICE_INFORMATION | self-service | Yes |
| diFAQs | http://www.fdic.gov/deposit/difaq.html | T12_SELF_SERVICE_INFORMATION | self-service | Yes |
| factssite | http://www.fdic.gov/consumers/banking/facts/index.html | T12_SELF_SERVICE_INFORMATION | self-service | Yes |
| failBankList | https://www.fdic.gov/bank/individual/failed/banklist.html | T12_SELF_SERVICE_INFORMATION | self-service | No |
| faqsite | http://www.fdic.gov/bank/iafaq.html | T12_SELF_SERVICE_INFORMATION | self-service | Yes |
| fdicLienRelease | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | T8_FAILED_BANK_LIEN_AND_LOAN_DOCUMENTS | merge | Yes |
| fdicbaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicbusinessassistanceform/ | T2_REPORT_SMALL_BUSINESS_BANK_CONCERN | merge | Yes |
| fdiccaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccustomerassistanceform/ | T1_REPORT_BANK_OR_FDIC_CONCERN | merge | Yes |
| fdiccatalog | https://catalog.fdic.gov | T11_PARTNER_OR_SPECIALIZED_EXTERNAL | keep-external | Yes |
| fdicdiform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdepositinsuranceform/ | T3_ASK_DEPOSIT_INSURANCE | keep | Yes |
| fdicdimcomplaintform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdimcomplaintform/ | T6_REPORT_INSURED_STATUS_MISREPRESENTATION | keep | Yes |
| fdicdirform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdirform/ | T4_ASK_BANK_DATA_AND_RESEARCH | merge | Yes |
| fdichomepage | https://www.fdic.gov/ | T12_SELF_SERVICE_INFORMATION | self-service | Yes |
| fdicooform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccommentform/ | T1_REPORT_BANK_OR_FDIC_CONCERN | merge-with-field-caveat | Yes |
| fidciaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicinteragencyform/ | T5_REPORT_APPRAISAL_ISSUE | merge | Yes |
| helpdeskform | https://cdr.ffiec.gov/public/HelpFileContainers/HelpDeskForm.aspx | T11_PARTNER_OR_SPECIALIZED_EXTERNAL | keep-external | Yes |
| knowmore | http://www.fdic.gov/consumers/banking/confidence/symbol.html | T12_SELF_SERVICE_INFORMATION | self-service | Yes |
| oowebsite | https://www.fdic.gov/regulations/resources/ombudsman/index.html | T12_SELF_SERVICE_INFORMATION | self-service | No |
| paAgreement | https://www.fdic.gov/bank/individual/failed/banklist.html | T11_PARTNER_OR_SPECIALIZED_EXTERNAL | keep-external | Yes |
| powerofattorneyform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/powerofattorneyform | T10_FAILED_BANK_ASSET_AND_REAL_ESTATE | merge | Yes |
| recordsdestructionform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/recordsdestructionform | T10_FAILED_BANK_ASSET_AND_REAL_ESTATE | merge | Yes |
| requestformAddress | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Change of Address&type=Depositor Claims | T7_FAILED_BANK_DEPOSITOR_SERVICES | merge | Yes |
| requestformAsset | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=ORE Deed Request&type=Asset Management | T10_FAILED_BANK_ASSET_AND_REAL_ESTATE | merge | Yes |
| requestformAssetRetainedLoan | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Retained Loan&type=Asset Management | T10_FAILED_BANK_ASSET_AND_REAL_ESTATE | merge | Yes |
| requestformDepositors | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Depositors&type=Depositor Claims | T7_FAILED_BANK_DEPOSITOR_SERVICES | merge | Yes |
| requestformIRA | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=IRA Transfer&type=Depositor Claims | T7_FAILED_BANK_DEPOSITOR_SERVICES | merge | Yes |
| requestformInquiry | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Inquiry&type=Depositor Claims | T7_FAILED_BANK_DEPOSITOR_SERVICES | merge | Yes |
| requestformLR | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | T8_FAILED_BANK_LIEN_AND_LOAN_DOCUMENTS | merge | Yes |
| requestformLR1 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | T8_FAILED_BANK_LIEN_AND_LOAN_DOCUMENTS | merge | Yes |
| requestformLR2 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | T8_FAILED_BANK_LIEN_AND_LOAN_DOCUMENTS | merge | Yes |
| requestformLR3 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | T8_FAILED_BANK_LIEN_AND_LOAN_DOCUMENTS | merge | Yes |
| requestformLR4 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | T8_FAILED_BANK_LIEN_AND_LOAN_DOCUMENTS | merge | Yes |
| requestformLR5 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | T8_FAILED_BANK_LIEN_AND_LOAN_DOCUMENTS | merge | Yes |
| requestformLR6 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | T8_FAILED_BANK_LIEN_AND_LOAN_DOCUMENTS | merge | Yes |
| requestformLocating | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Locating Deposit&type=Depositor Claims | T7_FAILED_BANK_DEPOSITOR_SERVICES | merge | Yes |
| requestformName | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Name Change&type=Depositor Claims | T7_FAILED_BANK_DEPOSITOR_SERVICES | merge | Yes |
| requestformRR | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research | T9_FAILED_BANK_RECORDS_AND_EMPLOYMENT | merge | Yes |
| requestformRR1 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research | T9_FAILED_BANK_RECORDS_AND_EMPLOYMENT | merge | Yes |
| requestformRR2 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research | T9_FAILED_BANK_RECORDS_AND_EMPLOYMENT | merge | Yes |
| requestformRR3 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research | T9_FAILED_BANK_RECORDS_AND_EMPLOYMENT | merge | Yes |
| requestformRR4 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research | T9_FAILED_BANK_RECORDS_AND_EMPLOYMENT | merge | Yes |
| requestformUnclaimed | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Unclaimed Dividends&type=Depositor Claims | T7_FAILED_BANK_DEPOSITOR_SERVICES | merge | Yes |
| requestformUninsured | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Uninsured Deposit&type=Depositor Claims | T7_FAILED_BANK_DEPOSITOR_SERVICES | merge | Yes |
| taxUnit | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=taxUnit | T9_FAILED_BANK_RECORDS_AND_EMPLOYMENT | keep-distinct-pattern | Yes |

## Alignment caveats
- `fdicooform` shares the same top-level concern umbrella as `fdiccaform`, but it is not field-equivalent. The current prototype still routes `fdic_issue` to `fdiccaform`, which is a routing correctness gap relative to production `fdiccommentform` / `fdicooform`.
- `Receivership`, `bankMerger`, and `taxUnit` belong with the failed-bank records/employment family at the IA level, but they remain a separate email-send interaction pattern rather than standard `requestform` intake.
- `paAgreement` is an external handoff to the failed-bank list and should stay visibly distinct from the Asset Management intake path.
- `fdicbaform` exists in the prototype endpoint map but no current topic routes to it, so the prototype does not yet expose the small-business-specific path shown here.

## Path Consolidation Summary
| Target Path ID | Mapped Codes |
|---|---:|
| T10_FAILED_BANK_ASSET_AND_REAL_ESTATE | 4 |
| T11_PARTNER_OR_SPECIALIZED_EXTERNAL | 3 |
| T12_SELF_SERVICE_INFORMATION | 10 |
| T1_REPORT_BANK_OR_FDIC_CONCERN | 2 |
| T2_REPORT_SMALL_BUSINESS_BANK_CONCERN | 1 |
| T3_ASK_DEPOSIT_INSURANCE | 1 |
| T4_ASK_BANK_DATA_AND_RESEARCH | 1 |
| T5_REPORT_APPRAISAL_ISSUE | 1 |
| T6_REPORT_INSURED_STATUS_MISREPRESENTATION | 1 |
| T7_FAILED_BANK_DEPOSITOR_SERVICES | 8 |
| T8_FAILED_BANK_LIEN_AND_LOAN_DOCUMENTS | 8 |
| T9_FAILED_BANK_RECORDS_AND_EMPLOYMENT | 8 |

## Implementation Guidance
- Intake UI should expose only canonical intents/topics, then map to route codes internally.
- Preserve existing backend forms/endpoints during migration; reduce front-end duplication first.
- Maintain a separate self-service branch and a separate `View My Cases` branch outside intake.
