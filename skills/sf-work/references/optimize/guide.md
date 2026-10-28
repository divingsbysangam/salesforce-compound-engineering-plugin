# sf-work mode:optimize

Measure a named Salesforce cost, try variants, and keep a winner only when the measurement says so.

<feature_description>
#$ARGUMENTS
</feature_description>

## What counts as a win

Name the metrics before the first run. Typical metrics: Apex CPU time, SOQL count, query rows, heap, DML count, LWC transfer size. A variant is a win when every named metric is no worse and at least one improves, against the same fixture and the same API version. A variant that improves CPU and regresses SOQL is not a single-objective discard: record both numbers and keep it only when the spec named a priority (for example "CPU first, SOQL must stay under 20"). Do not drop a multi-metric improvement because one unstated metric moved the wrong way, and do not keep a change that wins one metric by blowing another the spec named.

## Screen expensive runs

A locating measurement comes before a full test run or a deploy validate. Locating means the cheapest observation that says where the cost sits: `Limits.getCpuTime()`, `Limits.getQueries()`, `Limits.getHeapSize()`, and `Limits.getDmlStatements()` around the entry point, on a small fixture (one record and a 200-record list), or a Query Plan for the SOQL. If that measurement cannot be taken, stop and say what blocked it. Do not start a full `sf apex run test` or `sf project deploy validate` until a hypothesis is worth that cost. Skip a hypothesis whose expected benefit is unknown and a cheaper locating run could still decide it.

## Loop

1. Record the baseline on the fixture. The baseline is the scoring reference.
2. List a few hypotheses from the locating numbers and the code. Each one names the edit, the metric it should move, and whether it needs a new dependency. A new dependency waits for an explicit yes.
3. Run the cheap measurement on one hypothesis at a time. Keep the edit only when the win rule above holds. Revert the rest.
4. Run the expensive confirmation (the affected Apex tests, including a 200-record case when the change is bulk) only on a kept edit.
5. Stop when the next hypothesis cannot beat the kept baseline by a margin the fixture can show, or the user stops. Report baseline, kept change, and the metrics side by side.

Governor-limit headroom is the point of the loop. A faster path that drops `with sharing`, `USER_MODE`, or bulkification is not a win.
