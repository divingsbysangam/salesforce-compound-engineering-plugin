---
name: sf-debug
tier: discipline-gate
description: "Systematically find root causes and fix Salesforce bugs. Use when debugging Apex test failures, trigger fires, LWC runtime errors, deploy failures, governor limit exceptions, sharing/permission errors, integration callout failures, or metadata deploy validation errors. Trigger phrases: 'debug this trigger', 'why is this Apex test failing', 'trace this LWC error', 'investigate this deploy failure', 'why did this validate fail', 'fix this governor limit error'."
argument-hint: "[issue reference, error message, test path, log file, or description of broken behavior]"
---

# sf-debug

> **Principles enforced:** 2 (verifiability), 3 (jagged intelligence). See `PRINCIPLES.md`.

> **Persona dispatch.** This skill dispatches personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). The `sf-bug-reproduction-validator` (a writer) and any reviewers it spawns live under `references/personas/`; research personas are referenced from `../sf-plan/references/personas/`.

Investigate Salesforce-specific bugs systematically — tracing the full causal chain (UI → Flow → trigger → Apex → DML → callback) before proposing a fix — and optionally implement the fix with test-first discipline.

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Salesforce Angle

* **Trigger context awareness**: when a bug surfaces in a trigger, identify whether it fires on `before insert`, `after update`, `after undelete`, etc., and whether the same logic must hold across all relevant contexts.

* **Governor limit framing**: `System.LimitException` or `Too many SOQL queries: 101` errors are causal-chain symptoms; the cause is usually a query inside a loop, a recursive trigger, or unbatched DML several layers up.

* **Sharing-context bugs**: failing tests in production that pass in sandbox often trace to `with sharing` / `without sharing` / `inherited sharing` mismatches; reproduce with `System.runAs(User)` for the suspect role.

* **Mixed DML / setup/non-setup**: errors of the form `MIXED_DML_OPERATION` mean a DML on a setup object (User, Group, GroupMember) and a non-setup object happen in the same transaction; the fix is to split into asynchronous contexts.

* **Deploy validation failures**: `sf project deploy validate` failures are reproducible against a sandbox; capture the validation ID and run the relevant Apex test selectively before re-validating.

## Interaction Method

When asking the user a question, use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). Fall back to numbered options in chat when no blocking tool is available. Ask one question at a time. Prefer concise single-select choices when natural options exist.

## Mandatory debugging gate

> **Iron Law: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.**

Do not edit code, propose a patch, or touch metadata until Phase 1 has produced a classified root cause. A "fix" applied before the cause is confirmed is a guess — it hides the symptom, burns an attempt, and often introduces a second bug. The phases below are required, not advisory.

For the detailed reproduction sweep, you may dispatch the `sf-bug-reproduction-validator` persona (`references/personas/sf-bug-reproduction-validator.md`) as an isolated subagent — but the gate itself is inlined here and must be satisfied regardless of who runs it.

### Phase 1 — Reproduce and classify the root cause (before any fix)

1. **Parse the bug report** — extract expected behavior, actual behavior, exact steps to reproduce, environment (org type, API version, user profile), and the exact error text including any error IDs.
2. **Analyze the automation context** — enumerate every piece of automation in play on the affected object(s): Apex triggers (and their `before`/`after` contexts), Flows, legacy Process Builders, and validation rules. Note the order of execution and any user-context factors (profile, permission sets, sharing rules).
3. **Do code archaeology** — search the codebase for the relevant code path:

   ```bash
   # Triggers on the object
   grep -r "trigger.*{ObjectName}" --include="*.trigger"
   # Flows referencing the object
   find . -name "*.flow-meta.xml" | xargs grep "{ObjectName}"
   # Apex classes touching the object
   grep -r "{ObjectName}" --include="*.cls" -l
   # Validation rules
   find . -name "*.validationRule-meta.xml" -path "*{ObjectName}*"
   ```

4. **Attempt reproduction** — read the executing code path, trace all automation that fires, check order-of-execution issues, verify sharing/CRUD/FLS implications, and check governor-limit proximity. Reproduce sharing bugs with `System.runAs(User)` for the suspect role; reproduce deploy failures against a sandbox with `sf project deploy validate`.
5. **Classify into one of five buckets** and take the prescribed next action:

   | Bucket | Meaning | Next action |
   | --- | --- | --- |
   | **Confirmed Bug** | Code or config defect | Provide the fix location (`file:line`); proceed to Phase 2. |
   | **Platform Behavior** | Expected Salesforce behavior | Provide the documentation link; do **not** patch — explain the platform contract. |
   | **Configuration Issue** | Incorrect setup (perms, metadata, org settings) | Provide the corrective setup steps; no code change. |
   | **Data Issue** | Bad data state, not a code defect | Provide the data-cleanup approach; no code change. |
   | **Cannot Reproduce** | Insufficient information | List exactly what is needed and ask the user via the blocking question tool. |

Only **Confirmed Bug** advances to Phase 2. The other four buckets resolve the investigation without a code fix.

### Phase 2 — Implement the fix (only after root cause is confirmed)

Once — and only once — the root cause is classified as a Confirmed Bug:

1. Write or update a failing test that reproduces the defect (test-first discipline).
2. Implement the smallest fix that addresses the confirmed cause, applying the Salesforce Angle notes above (governor limits, sharing context, deploy ordering, FLS, metadata semantics).
3. Verify against the org — `sf apex run test`, then `sf project deploy validate` / `sf project deploy start`; inspect state with `sf data query` when needed.
4. Surface any decision that materially affects scope or risk using the platform's blocking question tool rather than guessing.

## 3-strikes escalation rule

After **3 failed** trigger or governor-limit patch attempts on the same symptom, **STOP**. Do not propose patch #4. Three failed patches is a quantitative signal that the problem is architectural, not local — convert it into a qualitative gate: ask whether this needs an asynchronous architecture change (Queueable, Batch Apex, or Platform Events) or a fundamentally different design, and surface that question to the human via the blocking question tool. Escalating early is cheaper than a fourth guess.

## Defense-in-depth pattern

A confirmed fix should be reinforced at four layers so the same class of bug cannot silently recur:

1. **Entry Point** — a guard clause in the trigger handler that rejects or short-circuits invalid invocations (recursion flags, context checks, null/empty collections).
2. **Business Logic** — validation in the service layer, independent of the entry point, so the invariant holds no matter who calls it.
3. **Environment Guards** — custom-metadata or feature-toggle checks that gate risky paths per org/environment, so a fix can be rolled out or rolled back without a deploy.
4. **Debug Instrumentation** — structured logging that captures a governor-limit snapshot at each boundary:

   ```apex
   System.debug(LoggingLevel.INFO, String.format(
       'boundary={0} soql={1}/{2} dml={3}/{4} cpu={5}ms',
       new List<Object>{
           boundaryName,
           Limits.getQueries(),      Limits.getLimitQueries(),
           Limits.getDmlStatements(), Limits.getLimitDmlStatements(),
           Limits.getCpuTime()
       }));
   ```

   Snapshotting `Limits.getQueries()`, `Limits.getDmlStatements()`, and `Limits.getCpuTime()` at each boundary turns an opaque `System.LimitException` into a traceable curve — you see which boundary the consumption spikes at.

## Related

* Salesforce knowledge: `docs/solutions/` (search via the `sf-learnings-researcher` agent).

* Plugin conventions: see `CLAUDE.md` for frontmatter, naming, and protected-artifact rules.