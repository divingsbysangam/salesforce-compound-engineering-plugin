---
name: tests
description: "Triggered by Apex test classes, LWC Jest tests, any Apex/LWC/Flow logic change, or a PR with prior review threads."
---

# Tests lens

Follow `contract.md` for procedure and finding format.

**Runs on:** every review

## Tools first
- `sf apex run test --tests <Class> --code-coverage --result-format json --target-org <alias>`
- `npx sfdx-lwc-jest -- --coverage <path>`
- `grep -nE "SeeAllData\s*=\s*true|Test\.setMock|System\.runAs|Test\.(start|stop)Test|Assert\.|System\.assert" <test files>`
- `gh pr view <n> --comments` (prior review threads)

## Checklist
- **TST-1** Test path makes a live callout (no `HttpCalloutMock`/`Test.setMock`) — default severity HIGH.
- **TST-2** Test method has no assertion; coverage by execution only — default severity HIGH.
- **TST-3** Trigger/batch/bulk-path change with no 200-record test, or a "bulk" test that inserts 1 record — default severity HIGH.
- **TST-4** `@IsTest(SeeAllData=true)` or hardcoded record IDs — default severity HIGH.
- **TST-5** Logic does not match the plan/acceptance criteria, or a stated criterion has no test — default severity HIGH. Cite the criterion.
- **TST-6** Bulk bug: `Trigger.new[0]`, list mutated during iteration, or a trigger context (insert/update/delete/undelete) left unhandled — default severity HIGH.
- **TST-7** Unguarded null: empty SOQL result or aggregate indexed `[0]`, or relationship chain dereferenced without checks — default severity HIGH.
- **TST-8** Failure swallowed: `Database.SaveResult`/`allOrNone=false` results not inspected, empty catch, Queueable/Batch `execute` hiding exceptions — default severity HIGH.
- **TST-9** Static recursion guard or state flag set but never reset on the error path — default severity MEDIUM.
- **TST-10** Sharing/FLS-sensitive code with no `System.runAs` test as an unprivileged user — default severity MEDIUM.
- **TST-11** Async (Queueable/Batch/future/`EventBus.publish`) invoked in a test without `Test.startTest()`/`Test.stopTest()` around it — default severity MEDIUM.
- **TST-12** Callout mocks cover only success; no test for timeout, 4xx, or 5xx responses — default severity MEDIUM.
- **TST-13** Exception/negative path untested (no assertion on the thrown type or message) — default severity MEDIUM.
- **TST-14** Retry on a non-idempotent POST, or `System.schedule` that fails when the job name already exists — default severity MEDIUM.
- **TST-15** Prior review thread unresolved with no matching code change, or a flagged pattern recurs in a new file — default severity MEDIUM.
- **TST-16** Changed class below 75% coverage, or bulk test asserts no `Limits.getQueries()`/`getDmlStatements()` headroom — default severity MEDIUM. Use the coverage JSON.
- **TST-17** LWC Jest test mocks only the `@wire` success path; loading and error states untested — default severity MEDIUM.
- **TST-18** Test data built inline instead of `@TestSetup`/the project test data factory — default severity LOW.
- **TST-19** Weak assertion: only `!= null`/`true`, legacy `System.assert*` instead of `Assert` class, or no message — default severity LOW.
- **TST-20** Test asserts on `@TestVisible private` state instead of observable behavior — default severity LOW.
