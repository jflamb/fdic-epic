# Normalized Rule Matrix for ask.fdic.gov User-Home Routing

Generated from authenticated `c:webFormRouting` component data and live option lists on **2026-02-24**.

## Coverage
- Source types: 10
- Full source/action rules: 85
- Unique action codes in active source lists: 46
- Total map keys in component map: 48

## Normalized Action Codes
| Action Code | Route Family | Endpoint | Sources | Labels | Notes |
|---|---|---|---:|---:|---|
| bankdataguide | external-url | https://www.fdic.gov/bank/statistical/guide/ | 1 | 1 | External destination; usually opens in a new tab/window. |
| bankMerger | fact-email-send | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=bankMerger | 1 | 1 | Internal Ask FDIC email-send page; distinct from standard forms and external handoffs. |
| callcenterhours | external-url | https://www.fdic.gov/about/contact/ask/ | 1 | 1 | External destination; usually opens in a new tab/window. |
| depositsinsured | external-url | http://www.fdic.gov/deposit/deposits/ | 1 | 1 | External destination; usually opens in a new tab/window. |
| diFAQs | external-url | http://www.fdic.gov/deposit/difaq.html | 1 | 1 | External destination; usually opens in a new tab/window. |
| factssite | external-url | http://www.fdic.gov/consumers/banking/facts/index.html | 1 | 1 | External destination; usually opens in a new tab/window. |
| faqsite | external-url | http://www.fdic.gov/bank/iafaq.html | 1 | 1 | External destination; usually opens in a new tab/window. |
| fdicbaform | internal-webform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicbusinessassistanceform/ | 2 | 3 | Internal routes for authenticated users commonly include ?cid=<ContactId> when opened. |
| fdiccaform | internal-webform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccustomerassistanceform/ | 3 | 2 | Internal routes for authenticated users commonly include ?cid=<ContactId> when opened. |
| fdiccatalog | external-url | https://catalog.fdic.gov | 2 | 2 | External destination; usually opens in a new tab/window. |
| fdicdiform | internal-webform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdepositinsuranceform/ | 4 | 1 | Internal routes for authenticated users commonly include ?cid=<ContactId> when opened. |
| fdicdimcomplaintform | internal-webform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdimcomplaintform/ | 5 | 1 | Internal routes for authenticated users commonly include ?cid=<ContactId> when opened. |
| fdicdirform | internal-webform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdirform/ | 4 | 4 | Internal routes for authenticated users commonly include ?cid=<ContactId> when opened. |
| fdichomepage | external-url | https://www.fdic.gov/ | 1 | 1 | External destination; usually opens in a new tab/window. |
| fdicLienRelease | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | 3 | 2 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| fdicooform | internal-webform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccommentform/ | 4 | 1 | Internal routes for authenticated users commonly include ?cid=<ContactId> when opened. |
| fidciaform | internal-webform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicinteragencyform/ | 4 | 5 | Internal routes for authenticated users commonly include ?cid=<ContactId> when opened. |
| helpdeskform | external-url | https://cdr.ffiec.gov/public/HelpFileContainers/HelpDeskForm.aspx | 1 | 1 | External destination; usually opens in a new tab/window. |
| knowmore | external-url | http://www.fdic.gov/consumers/banking/confidence/symbol.html | 1 | 1 | External destination; usually opens in a new tab/window. |
| paAgreement | external-url | https://www.fdic.gov/bank/individual/failed/banklist.html | 1 | 1 | External destination; usually opens in a new tab/window. |
| powerofattorneyform | internal-route | https://ask.fdic.gov/fdicinformationandsupportcenter/s/powerofattorneyform | 1 | 1 | Internal routes for authenticated users commonly include ?cid=<ContactId> when opened. |
| Receivership | fact-email-send | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=Receivership | 1 | 1 | Internal Ask FDIC email-send page; distinct from standard forms and external handoffs. |
| recordsdestructionform | internal-route | https://ask.fdic.gov/fdicinformationandsupportcenter/s/recordsdestructionform | 1 | 1 | Internal routes for authenticated users commonly include ?cid=<ContactId> when opened. |
| requestformAddress | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Change of Address&type=Depositor Claims | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformAsset | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=ORE Deed Request&type=Asset Management | 2 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformAssetRetainedLoan | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Retained Loan&type=Asset Management | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformDepositors | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Depositors&type=Depositor Claims | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformInquiry | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Inquiry&type=Depositor Claims | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformIRA | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=IRA Transfer&type=Depositor Claims | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformLocating | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Locating Deposit&type=Depositor Claims | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformLR | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | 2 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformLR1 | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformLR2 | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | 2 | 2 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformLR3 | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | 2 | 2 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformLR4 | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformLR5 | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformLR6 | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformName | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Name Change&type=Depositor Claims | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformRR | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research | 3 | 3 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformRR1 | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research | 2 | 2 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformRR2 | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformRR3 | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research | 2 | 2 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformRR4 | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformUnclaimed | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Unclaimed Dividends&type=Depositor Claims | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| requestformUninsured | requestform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Uninsured Deposit&type=Depositor Claims | 1 | 1 | Requestform routes typically append &subject=<selected action label> in navigation logic. |
| taxUnit | fact-email-send | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=taxUnit | 3 | 1 | Internal Ask FDIC email-send page; distinct from standard forms and external handoffs. |

## Full Rule Matrix (Source + Label -> Code)
| Source Type | Source Label | Action Label | Action Code | Endpoint |
|---|---|---|---|---|
| Appraiser | Appraiser | Submit a Concern Regarding an Appraisal I Completed For a Bank | fidciaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicinteragencyform/ |
| Appraiser | Appraiser | Submit a Concern Regarding an Appraisal Related To a Real Estate Transaction | fidciaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicinteragencyform/ |
| Appraiser | Appraiser | Submit a Concern Regarding My Changed Appraisal | fidciaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicinteragencyform/ |
| AssumingIns | Purchaser/Assuming institution of a failed bank | Ask some other question | requestformRR | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research |
| AssumingIns | Purchaser/Assuming institution of a failed bank | Purchase FDIC Real Estate | requestformAsset | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=ORE Deed Request&type=Asset Management |
| AssumingIns | Purchaser/Assuming institution of a failed bank | Request a Lien Release | requestformLR | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| AssumingIns | Purchaser/Assuming institution of a failed bank | Request a Limited Power of Attorney or renewal | powerofattorneyform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/powerofattorneyform |
| AssumingIns | Purchaser/Assuming institution of a failed bank | Request a Quitclaim Deed or a Deed Without Warranty | requestformLR2 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| AssumingIns | Purchaser/Assuming institution of a failed bank | Request an Allonge | requestformLR3 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| AssumingIns | Purchaser/Assuming institution of a failed bank | Request an Assignment of Mortgage | requestformLR1 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| AssumingIns | Purchaser/Assuming institution of a failed bank | Request permission regarding the custody of failed bank records | recordsdestructionform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/recordsdestructionform |
| Attorney | Company or individual inquiring about a failed bank | Ask some other question | requestformRR4 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research |
| Attorney | Company or individual inquiring about a failed bank | Inquire about my loan which was retained by the FDIC | requestformAssetRetainedLoan | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Retained Loan&type=Asset Management |
| Attorney | Company or individual inquiring about a failed bank | Purchase FDIC Real Estate | requestformAsset | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=ORE Deed Request&type=Asset Management |
| Attorney | Company or individual inquiring about a failed bank | Request a copy of a Purchase & Assumption Agreement | paAgreement | https://www.fdic.gov/bank/individual/failed/banklist.html |
| Attorney | Company or individual inquiring about a failed bank | Request a Form 1098, 1099, or W2 | taxUnit | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=taxUnit |
| Attorney | Company or individual inquiring about a failed bank | Request a Form 480-7A for interest paid from R & G Mortgage Corporation | requestformRR1 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research |
| Attorney | Company or individual inquiring about a failed bank | Request a Lien Release | requestformLR | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| Attorney | Company or individual inquiring about a failed bank | Request a Paid-in-Full letter from R & G Mortgage Corporation | requestformLR6 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| Attorney | Company or individual inquiring about a failed bank | Request a Promissory Note (“Pagare”) from R & G Mortgage Corporation | requestformLR5 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| Attorney | Company or individual inquiring about a failed bank | Request a Quitclaim Deed or a Deed Without Warranty | requestformLR3 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| Attorney | Company or individual inquiring about a failed bank | Request an Allonge | requestformLR4 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| Attorney | Company or individual inquiring about a failed bank | Request an Appointment of Receiver letter | Receivership | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=Receivership |
| Attorney | Company or individual inquiring about a failed bank | Request an Assignment of Mortgage | requestformLR2 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| Attorney | Company or individual inquiring about a failed bank | Request certification of a bank merger or name change | bankMerger | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=bankMerger |
| Attorney | Company or individual inquiring about a failed bank | Request copies of loan documents or payment history | requestformRR2 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research |
| Attorney | Company or individual inquiring about a failed bank | Request my tax payment history from R & G Mortgage Corporation | requestformRR | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research |
| Attorney | Company or individual inquiring about a failed bank | Verify the previous employment of a failed bank employee | requestformRR3 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research |
| Banker | Banker | Request a Lien Release From a Failed Institution | fdicLienRelease | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| Banker | Banker | Request FDIC Supplies | fdiccatalog | https://catalog.fdic.gov |
| Banker | Banker | Submit a Complaint Against FDIC | fdicooform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccommentform/ |
| Banker | Banker | Submit a Deposit Insurance Question | fdicdiform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdepositinsuranceform/ |
| Banker | Banker | Submit a Question About FDIC Analysis or The Quarterly Banking Profile (QBP) | fdicdirform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdirform/ |
| Banker | Banker | Submit a Question About FDIC Data Tools, BankFind Suite, or Summary of Deposits (SOD) | fdicdirform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdirform/ |
| Banker | Banker | Submit a Regulatory Question | fdiccaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccustomerassistanceform/ |
| Banker | Banker | Submit Concerns About Whether an Entity or Product is FDIC Insured | fdicdimcomplaintform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdimcomplaintform/ |
| Consumer | Consumer | Request a Lien Release From a Failed Institution | fdicLienRelease | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| Consumer | Consumer | Request Help With an Appraisal Problem | fidciaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicinteragencyform/ |
| Consumer | Consumer | Request help with FDIC-Insured Banks, Locations, History, or Financial Reports | fdicdirform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdirform/ |
| Consumer | Consumer | Submit a Complaint Against a Bank | fdiccaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccustomerassistanceform/ |
| Consumer | Consumer | Submit a Complaint Against a Bank as a Consumer/Sole Proprietor of Small Biz | fdicbaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicbusinessassistanceform/ |
| Consumer | Consumer | Submit a Complaint Against FDIC | fdicooform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccommentform/ |
| Consumer | Consumer | Submit a Deposit Insurance Question | fdicdiform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdepositinsuranceform/ |
| Consumer | Consumer | Submit a Regulatory Question | fdiccaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccustomerassistanceform/ |
| Consumer | Consumer | Submit Concerns About Whether an Entity or Product is FDIC Insured | fdicdimcomplaintform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdimcomplaintform/ |
| Depositor | Depositor in a bank which failed | Ask some other question | requestformInquiry | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Inquiry&type=Depositor Claims |
| Depositor | Depositor in a bank which failed | Change my address with the FDIC | requestformAddress | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Change of Address&type=Depositor Claims |
| Depositor | Depositor in a bank which failed | Change the name on my claim with the FDIC | requestformName | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Name Change&type=Depositor Claims |
| Depositor | Depositor in a bank which failed | Locate my deposit in a failed bank | requestformLocating | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Locating Deposit&type=Depositor Claims |
| Depositor | Depositor in a bank which failed | Process an IRA transfer from a failed bank | requestformIRA | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=IRA Transfer&type=Depositor Claims |
| Depositor | Depositor in a bank which failed | Request a Form 1098, 1099, or W2 | taxUnit | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=taxUnit |
| Depositor | Depositor in a bank which failed | Request copies of bank statements or checks | requestformRR | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research |
| Depositor | Depositor in a bank which failed | Submit a question about a dividend I should have received | requestformUnclaimed | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Unclaimed Dividends&type=Depositor Claims |
| Depositor | Depositor in a bank which failed | Submit a question about my uninsured deposit claim | requestformUninsured | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Uninsured Deposit&type=Depositor Claims |
| Depositor | Depositor in a bank which failed | Update the status of my deposit insurance claim | requestformDepositors | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?sub=Depositors&type=Depositor Claims |
| Employee | Employee of a bank which failed | Ask some other question | requestformRR1 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research |
| Employee | Employee of a bank which failed | Request a Form 1098, 1099, or W2 | taxUnit | https://ask.fdic.gov/fdicinformationandsupportcenter/s/factsemailsend?send=taxUnit |
| Employee | Employee of a bank which failed | Verify my previous employment with a failed bank | requestformRR3 | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Records Research |
| Other | Other | Find Out Whether My Deposits Are Insured | depositsinsured | http://www.fdic.gov/deposit/deposits/ |
| Other | Other | Go to FAQs Site for Industry Analysis | faqsite | http://www.fdic.gov/bank/iafaq.html |
| Other | Other | Go To the FDIC Homepage | fdichomepage | https://www.fdic.gov/ |
| Other | Other | Go to the Online Ordering Catalog | fdiccatalog | https://catalog.fdic.gov |
| Other | Other | Know More About the FDIC | knowmore | http://www.fdic.gov/consumers/banking/confidence/symbol.html |
| Other | Other | Know More About When a Bank Fails – Facts for Depositors, Creditors, and Borrowers | factssite | http://www.fdic.gov/consumers/banking/facts/index.html |
| Other | Other | Request a Lien Release from a Failed Institution | fdicLienRelease | https://ask.fdic.gov/fdicinformationandsupportcenter/s/requestform?type=Lien Release |
| Other | Other | See FDIC Contact Center Hours of Operation | callcenterhours | https://www.fdic.gov/about/contact/ask/ |
| Other | Other | Submit a Complaint Against a Bank | fdiccaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccustomerassistanceform/ |
| Other | Other | Submit a Complaint Against FDIC | fdicooform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccommentform/ |
| Other | Other | Submit a Deposit Insurance Question | fdicdiform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdepositinsuranceform/ |
| Other | Other | Submit a Question About FDIC Analysis or FDIC Data Tools | fdicdirform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdirform/ |
| Other | Other | Submit a Regulatory Question | fdiccaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccustomerassistanceform/ |
| Other | Other | Submit an Appraisal Related Complaint | fidciaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicinteragencyform/ |
| Other | Other | Submit Concerns About Whether an Entity or Product is FDIC Insured | fdicdimcomplaintform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdimcomplaintform/ |
| Other | Other | View Frequently Asked Questions for Deposit Insurance | diFAQs | http://www.fdic.gov/deposit/difaq.html |
| Researcher | Researcher | Look for a Bank Data Guide | bankdataguide | https://www.fdic.gov/bank/statistical/guide/ |
| Researcher | Researcher | Submit a Question About FDIC Analysis or The Quarterly Banking Profile (QBP) | fdicdirform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdirform/ |
| Researcher | Researcher | Submit a Question About FDIC Data Tools, BankFind Suite, or Summary of Deposits (SOD) | fdicdirform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdirform/ |
| Researcher | Researcher | Submit a Question About The Central Data Depository, CALL Reports, Call Data and UBPR Reports | helpdeskform | https://cdr.ffiec.gov/public/HelpFileContainers/HelpDeskForm.aspx |
| Researcher | Researcher | Submit Concerns About Whether an Entity or Product is FDIC Insured | fdicdimcomplaintform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdimcomplaintform/ |
| SBO | Small Business Owner | Request Help With an Appraisal Problem | fidciaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicinteragencyform/ |
| SBO | Small Business Owner | Submit a Complaint Against a Bank | fdicbaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicbusinessassistanceform/ |
| SBO | Small Business Owner | Submit a Complaint Against FDIC | fdicooform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdiccommentform/ |
| SBO | Small Business Owner | Submit a Deposit Insurance Question | fdicdiform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdepositinsuranceform/ |
| SBO | Small Business Owner | Submit a Regulatory Question | fdicbaform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicbusinessassistanceform/ |
| SBO | Small Business Owner | Submit Concerns About Whether an Entity or Product is FDIC Insured | fdicdimcomplaintform | https://ask.fdic.gov/fdicinformationandsupportcenter/s/fdicdimcomplaintform/ |

## Notes
- This matrix reflects the authenticated `user-home` flow and role-specific options.
- Some map keys exist in component config but are not exposed in the 10 active sourceType option sets.
- For external URLs (for example `helpdeskform`), the client uses `window.open(...)` behavior.
- `fact-email-send` routes stay on Ask FDIC and open a distinct email-composition pattern rather than a standard intake form.

## Component-Only Map Keys (Not in Active SourceType Option Sets)
- `oowebsite` -> `https://www.fdic.gov/regulations/resources/ombudsman/index.html`
- `failBankList` -> `https://www.fdic.gov/bank/individual/failed/banklist.html`
