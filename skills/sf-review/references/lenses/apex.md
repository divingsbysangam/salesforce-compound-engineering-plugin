---
name: apex
description: "Runs on changed Apex classes and triggers (limits, bulkification, triggers, async, exceptions, query performance)."
---

# Apex lens

Follow `contract.md` for procedure and finding format.

**Runs on:** `**/*.cls`, `**/*.trigger` (CRUD/FLS, sharing, injection: security lens)

## Tools first
- `sf code-analyzer run --rule-selector pmd:Performance "pmd:Error Prone" --target <files>` (`OperationWithLimitsInLoop`, `EmptyCatchBlock`)
- In loop bodies, grep `\[\s*SELECT|Database\.\w+\(|\b(insert|update|upsert|delete|merge)\s+\w|\.send\(|EventBus\.publish|enqueueJob`
- Single-record assumption: `grep -nE 'Trigger\.(new|old)\[0\]'`
- Triggers per object: `grep -rlE 'trigger\s+\w+\s+on\s+<Object>\b' force-app`

## Checklist
- **APX-1** SOQL/SOSL in a loop (incl. via called method); limit 100 sync / 200 async — default severity CRITICAL.
- **APX-2** DML in a loop; limit 150 statements — default severity CRITICAL.
- **APX-3** Callout, `EventBus.publish`, `enqueueJob`, or `@future` in a loop; 100 callouts, 50 future/Queueable sync, 1 Queueable from async — default severity CRITICAL.
- **APX-4** Assumes one record (`Trigger.new[0]`, single-row query into an SObject) — default severity HIGH.
- **APX-5** Unbounded query/collection on a large object risking 50,000 query rows, 10,000 DML rows, or 6MB sync / 12MB async heap — default severity HIGH. Use Batch, `QueryLocator`, or SOQL `for`.
- **APX-6** Non-selective SOQL: no indexed filter, leading `LIKE '%x'`, `!=`/`NOT IN`, OR on unindexed fields — default severity HIGH.
- **APX-7** Nested loop join without a `Map`, or regex/`Schema.describe` in a loop; CPU 10s sync / 60s async — default severity HIGH.
- **APX-8** No recursion control on update trigger, or static `Boolean hasRun` that skips later 200-record chunks — default severity HIGH. Use static `Set<Id>`.
- **APX-9** Empty catch, or catch that only `System.debug`s and continues — default severity HIGH.
- **APX-10** Queueable chain without depth/stop guard, or callouts/heavy work left synchronous in a trigger — default severity HIGH.
- **APX-11** More than one trigger per object — default severity MEDIUM.
- **APX-12** Logic in trigger body instead of handler dispatch — default severity MEDIUM.
- **APX-13** After-update work without change detection vs `Trigger.oldMap` — default severity MEDIUM.
- **APX-14** All-or-none DML where partial success is intended, or `Database.*(…, false)` results never inspected — default severity MEDIUM.
- **APX-15** Catches generic `Exception` where `DmlException`/`QueryException`/`CalloutException` applies, or drops the cause — default severity MEDIUM.
- **APX-16** `@AuraEnabled` surfaces raw exception text instead of `AuraHandledException` — default severity MEDIUM.
- **APX-17** Same query repeated in a transaction; VF controller holds large state without `transient` — default severity LOW.
- **APX-18** Hardcoded Id literals (`'[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?'` for records, Profiles, RecordTypes) — default severity LOW.
