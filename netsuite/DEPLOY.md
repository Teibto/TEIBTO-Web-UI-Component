# Deploy guide — Vendor bill receipt (รับวางบิล) backend

This is the production backend for the bill-receipt module: two custom records,
a data-access library, a Suitelet pair (list + form), and a RESTlet (the only
writer). It cannot be unit-tested outside NetSuite (the `N/*` modules only exist
in the SuiteScript runtime), so verify it with the manual smoke checklist below
after deploying to a sandbox.

## Files

| File | Role |
| --- | --- |
| `objects/customrecord_tbt_bill_receipt.xml` | header record (the voucher) |
| `objects/customrecord_tbt_bill_receipt_line.xml` | line record (1 vendor invoice per row) |
| `bill_receipt_meta.js` | record/field ids + status state machine — **single source of truth** |
| `bill_receipt_lib.js` | validate / list / load / vendors / save (N/record + N/query) |
| `rl_bill_receipt.js` | RESTlet — the only place that mutates the record |
| `../templates/sl_bill_receipt_list.js` + `bill-receipt-list.html` | list page |
| `../templates/sl_bill_receipt_form.js` + `bill-receipt-form.html` | document page |

> If you change a field id, change it in **`bill_receipt_meta.js` only** and keep
> the XML in sync. The scripts never hard-code a field id elsewhere.

## Deploy steps (SuiteCloud CLI / SDF)

1. **Copy sources into the SDF project** (`tbt-ds/` staging, per `sync:sdf`):
   - `netsuite/objects/customrecord_tbt_bill_receipt*.xml` and
     `customscript_tbt_*.xml` → `src/Objects/`
   - `netsuite/bill_receipt_meta.js`, `bill_receipt_lib.js`, `rl_bill_receipt.js`,
     `tbt_page.js` → `src/FileCabinet/SuiteScripts/Teibto/`
   - `templates/sl_bill_receipt_*.js` + `bill-receipt-*.html` →
     `src/FileCabinet/SuiteScripts/Teibto/` (Suitelets `require` `./bill_receipt_lib`
     etc. as siblings — keep them in the same folder)
2. **Script + deployment objects are SDF XMLs** in `netsuite/objects/`
   (`customscript_tbt_sl_bill_receipt_list/form.xml`, `customscript_tbt_rl_bill_receipt.xml`)
   — the deploy creates script records + deployments with the exact ids the code
   resolves by (`N/url.resolveScript`). No manual clicking in the UI.
   The RESTlet deployment ships as *Status* = Released, *Log Level* = Error,
   audience = all internal roles; tighten the audience per account if needed
   (the page calls it with the logged-in session, so no token auth is needed).
3. **Manifest features**: `src/manifest.xml` must declare
   `SERVERSIDESCRIPTING` + `CUSTOMRECORDS` as required — SDF validation fails
   without them.
4. **Approver role**: edit `bill_receipt_lib.permissionError` — replace the
   stop-gap `APPROVER_ROLES = [3]` (Administrator) with your real approver role
   id(s), or switch to a custom permission and check it via `runtime`.
5. `suitecloud project:deploy --dryrun` (validate objects against the account)
   then `suitecloud project:deploy`.

> Deployed to `4089685_SB2` on 2026-07-16 — both Suitelet pages verified in a
> real browser session: list renders the real-data path (`demo:false`), form
> loads 693 vendors via SuiteQL, DS assets load from N/file-resolved URLs.

## Status state machine (enforced server-side in the RESTlet)

```
(new) --save--> Draft --submit--> Submitted --approve--> Approved --pay--> Paid
                                  \--reject--> Rejected
```

`save`/`submit` may edit fields; `approve`/`reject`/`pay` change status only.
A transition not in `meta.TRANSITIONS` is rejected regardless of what the client
sends. Current status is **re-read from the DB** in the RESTlet — the client copy
is advisory.

## Graceful fallback

Both Suitelets wrap their data fetch in try/catch. If the custom record is not
deployed yet (fresh account) the fetch throws and the page renders **demo data**
with `data.demo = true`, which shows a warning banner instead of a 500. This is
also why `npm run test:smoke` passes locally: the dev-suitelet stubs make the
`N/*` calls throw, exercising the exact demo path.

## Manual smoke checklist (run in sandbox after deploy)

1. Open the list Suitelet → no demo banner; rows come from the record.
2. **New** → fill vendor + dates + one invoice line → **Save draft** → returns,
   status `Draft`, tranid `BR-<buddhist-year>-0001`.
3. Reopen the draft → **Submit for approval** → status `Submitted`; Save/Submit
   buttons hide, Approve/Reject show.
4. As a **non-approver** role → Approve → rejected with a permission error.
5. As an **approver** → Approve → status `Approved`; page becomes read-only.
6. Try to Submit the approved record via a crafted POST → rejected by the state
   machine ("Cannot submit a record in status Approved").
7. Negative/empty line amount → Save → rejected by validation.
8. Confirm totals: header `custrecord_tbt_br_total` = Σ(amount+vat) of lines.

---

# Deploy guide — Employee expense claim backend

Same pattern as bill-receipt (header + 1:N lines + status state machine);
only the ids differ.

## Files

| File | Role |
| --- | --- |
| `objects/customrecord_tbt_expense_claim.xml` | claim header |
| `objects/customrecord_tbt_expense_claim_line.xml` | expense lines (1:N) |
| `expense_meta.js` | record/field ids + status state machine (single source of truth) |
| `expense_lib.js` | validate / list / load / employees / save |
| `rl_expense.js` | RESTlet — the only writer |
| `../templates/sl_expense_claim.js` + `expense-claim.html` | entry page |

## Script + deployment ids (resolved by code)

- Suitelet `customscript_tbt_sl_expense_claim` / `customdeploy_tbt_sl_expense_claim`
- RESTlet  `customscript_tbt_rl_expense`        / `customdeploy_tbt_rl_expense`

## Status state machine (enforced in rl_expense)

```
(new) --save--> Draft --submit--> Submitted --approve--> Approved --pay--> Paid
                                  \--reject--> Rejected --(save/submit)--> ...
```

`save`/`submit` may edit fields; `approve`/`reject`/`pay` change status only.
Current status is re-read from the DB; an illegal transition is rejected.
`approve`/`reject`/`pay` require an approver role — edit
`expense_lib.permissionError` (`APPROVER_ROLES`) at deploy time.

## Manual smoke checklist (sandbox)

1. Open the entry Suitelet (no `?id=`) → no demo banner once deployed; blank claim.
2. Pick employee + period, add one expense line → **Save draft** → status `Draft`,
   tranid `EXP-<buddhist-year>-0001`.
3. **Submit** → status `Submitted`.
4. Non-approver → Approve → permission error. Approver → Approve → `Approved`.
5. Crafted POST `submit` on an approved claim → rejected by the state machine.
6. Line with amount ≤ 0 or no merchant → Save → validation error.
7. Header `custrecord_tbt_exp_total` = Σ(amount) of lines.
