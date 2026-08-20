# Step 4: System-Wide Test Check

Read with `sf-work/SKILL.md`. Procedure lives here.

## Step 4: System-Wide Test Check
**Before marking implementation complete, answer these 5 questions:**

1. **Trigger Fire Check**: What triggers fire on the affected objects? Are all contexts (insert/update/delete/undelete) handled correctly?

2. **Bulk Test Check**: Are bulk tests included that process 200+ records? Do they verify behavior at scale?

3. **Governor Limit Test**: Are governor limits tested? Specifically SOQL 101, DML 150, CPU timeout scenarios?

4. **Sharing Scenario Check**: Are sharing scenarios covered? Does the code work correctly under `with sharing` and `without sharing` contexts?

5. **Integration Mock Check**: Are all integration points (callouts, platform events) properly mocked in tests?

If any answer is "no", add the missing test before proceeding.
Answer each with pasted evidence, not a yes/no. Before marking the check complete, paste the fresh output of the command that proves it in this same message. A previous run, or "tests pass" without output, is not evidence.

| Claim | Counts as evidence | Does NOT count |
| --- | --- | --- |
| "Tests pass" | Fresh `sf apex run test --result-format human` output in this message | "Previous run passed", "should pass" |
| "Coverage met" | The actual coverage % from that run | "It was ~80% last time" |
| "Deploy is safe" | `sf project deploy start --dry-run` or `sf project deploy report` output | "It deployed before" |
| "Within governor limits" | A `Limits.getQueries()` / `Limits.getDmlStatements()` value at the 200+ bulk threshold | "It won't hit limits" |

### Rationalizations (Excuse → Reality)

_Pressure-test-pending hypotheses (see `docs/pressure-tests/`): guidance to pre-empt the excuses used to skip this gate under deadline, not yet independently validated._

| Excuse | Reality |
| --- | --- |
| "This trigger only ever gets one record from the UI." | Data Loader, the REST/Bulk API, and Flow-triggered DML all pass collections on day one — and the org cannot stop them. Bulk safety is not optional. |
| "I'll write the tests after, to hit coverage." | Coverage-after tests assert what the code does, not what it should. They won't catch a bulk-safety regression baked into the untested draft. |
| "Governor limits don't matter in a scratch org." | Scratch-org and sandbox limits mirror production Enterprise Edition. There is no test-only exemption. |
| "We'll fix sharing after it ships — it's admin-only for now." | Profile/permission-set assignment is a config change an admin makes without redeploying code. `without sharing` does not auto-correct when the audience widens. |
| "It's just a config/Flow change, there's no code to test." | Flow, validation-rule, and formula changes still change behavior. They need before/after assertions, not a deploy-succeeded check. |


***

