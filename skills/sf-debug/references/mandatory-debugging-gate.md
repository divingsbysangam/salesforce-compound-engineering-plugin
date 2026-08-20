# Mandatory debugging gate

Read with `sf-debug/SKILL.md`. Procedure lives here.

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

