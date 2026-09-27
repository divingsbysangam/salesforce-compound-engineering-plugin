---
name: flow
description: "Runs when the diff touches Flow, Process Builder, Workflow Rule, or validation rule metadata."
---

# Flow lens

Follow `contract.md` for procedure and finding format.

**Runs on:** `**/*.flow-meta.xml`, `**/*.workflow-meta.xml`, `**/objects/*/validationRules/*.validationRule-meta.xml`, `**/triggers/*.trigger` (order conflicts only)

## Tools first
- `sf code-analyzer run --rule-selector flow --target <paths>`.
- `sf project deploy validate --dry-run --source-dir <paths>` for formula and reference errors.
- Loop bodies: grep `<loops>` then trace `nextValueConnector` targets to `<recordCreates>|<recordUpdates>|<recordDeletes>|<recordLookups>|<actionCalls>`.
- Retired automation: grep `<processType>Workflow</processType>` (Process Builder) and new `*.workflow-meta.xml` rules.

## Checklist
- **FLW-1** Get/Create/Update/Delete Records or invocable action inside a Loop — default severity CRITICAL. Collect into a collection variable; one DML/query after the loop (limits: 100 SOQL, 150 DML per transaction).
- **FLW-2** Record-triggered flow with no entry criteria, or update path without `ISCHANGED`/`$Record__Prior` check — default severity HIGH. Runs on every save and can recurse.
- **FLW-3** After-save flow updates the triggering record (`$Record`) — default severity HIGH. Use a before-save (`RecordBeforeSave`) field update instead.
- **FLW-4** Record-triggered flow and Apex trigger on the same object and event both write the same fields or re-update the record — default severity HIGH. Grep `triggers/` for the object; consolidate or define ordering.
- **FLW-5** DML, callout, or action element with no `<faultConnector>` — default severity HIGH. Log or notify; screen flows show a message.
- **FLW-6** `runInMode` `SystemModeWithoutSharing` on a screen or user-invoked flow exposing/editing records — default severity HIGH. Justify or run in user context.
- **FLW-7** Hardcoded record IDs, user IDs, or queue/RecordType IDs in flow values or validation formulas — default severity HIGH. Use custom metadata or DeveloperName lookups.
- **FLW-8** New Process Builder (`processType` Workflow) or new Workflow Rule — default severity HIGH. Both are retired; build as a record-triggered flow.
- **FLW-9** New validation rule that existing records will fail on next save, with no data fix or `ISNEW()`/`ISCHANGED` scoping — default severity HIGH.
- **FLW-10** Multiple record-triggered flows on one object/timing with no `triggerOrder` set — default severity MEDIUM.
- **FLW-11** New validation rule with no bypass (`$Permission`/custom setting) for integrations or data loads — default severity MEDIUM.
- **FLW-12** Validation formula not null-safe (compares fields without `ISBLANK` guards) or logic inverted (must be TRUE when invalid) — default severity MEDIUM.
- **FLW-13** Nested loops over record collections — default severity MEDIUM. Pre-filter with Collection Filter or move to Apex.
- **FLW-14** Get Records retrieving all fields — default severity MEDIUM.
- **FLW-15** Scheduled/autolaunched flow processing unbounded record sets with complex per-record logic — default severity MEDIUM. Consider Batch Apex.
- **FLW-16** Validation error message generic ("Invalid data") or no `errorDisplayField` — default severity LOW.
- **FLW-17** Flow missing `<description>` or using default element labels (`Decision_1`) — default severity LOW.
