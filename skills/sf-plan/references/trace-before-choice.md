# Trace existing behavior before a dependent choice

Read this during Durable planning, before a choice that depends on how the org already behaves, and again when a costly choice is still open after research.

## Trace

Read the source and the tests. A file name or a conversation claim is not the behavior.

1. **Entry.** What starts it: trigger context, Flow start, LWC wire, `@AuraEnabled`, or a scheduled job.
2. **Flow.** The chain and what changes at each step, with `file:line`.
3. **Boundaries.** What crosses Flow and Apex, sync and async, or `with sharing` and `without sharing`.
4. **Failure path** that matters to the choice (a mixed-DML split, a limit, a silent empty SOQL).
5. **Gaps.** Anything you could not trace. Say so.

One pass is enough when those boundaries are named without hand-waving. When the answer depends on more than one ownership boundary, write one short dossier per boundary, two to four. More than four means the question is still unscoped: narrow it and trace again. Reconcile a contradiction by reading the source. Do not pick a design during the trace.

## Compare a costly choice without being asked

After the trace, a costly choice that research left open is compared in the plan. Costly means reversing it is expensive or the governor, sharing, or order-of-execution cost differs in kind: trigger versus before-save Flow, synchronous callout versus platform event, a new custom object versus a standard one, `with sharing` versus a reasoned `without sharing`.

Record each option's governor cost, sharing, order of execution, and what reversing it would take. The plan states the option it uses and the option it rejected.

Do not reopen a choice the user, the requirements, or an existing handler pattern already settled. Alternatives that are already concrete enough to compare stay in the plan. Do not invent a second skill to run the comparison. If the comparison cannot be made, say what is missing and do not pretend it was decided. With nobody to ask, continue on the disclosed default rather than stopping the run.
