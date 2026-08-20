# Step 4: Spec Flow Analysis

Read with `sf-plan/SKILL.md`. Procedure lives here.

## Step 4: Spec Flow Analysis
Dispatch the spec flow analyzer to validate the design:

* Task sf-spec-flow-analyzer(feature_spec, research_findings)

Review the permutation matrix and address any gaps identified.

Step 5: Verification Strategy (mandatory, Principle 2)
Before the plan is considered complete, fill in a Verification Strategy section. This is the single non-negotiable section in every plan. If you cannot describe how the feature will be verified, the feature is not ready to be planned — return to spec.
The Verification Strategy section must answer all five of the following:
Acceptance assertion — What is the boolean check that proves the feature works? Express as an Apex assertion, SOQL count, Flow path, or LWC behavior. Example: assertEquals(1, [SELECT COUNT() FROM Lead WHERE Owner.Id = :territoryOwner.Id]).
Bulk threshold — At what record count is bulkification verified? For Apex, default to 200; for batch contexts, state the chunk size and the total. If bulk is not applicable (e.g., single-record UI flow), say so explicitly.
Governor boundary — Which governor limit is closest to the feature's worst case? Name it (SOQL 101, DML 150, CPU 10s, Heap 6MB, callout 100, etc.) and state the projected utilization at the verification threshold.
Sharing scenario — Under which sharing context is the feature verified? List the user profile or permission set used, and whether the feature runs with sharing, without sharing, or inherited sharing. State the expected behavior for an unprivileged user explicitly.
Integration mock or dry-run — For features with callouts, platform events, or deploy steps: name the mock class (HttpCalloutMock), the event publish assertion, or the sf project deploy start --dry-run command that proves the integration boundary works without side effects.
Verification Strategy is the gate between /sf-plan and /sf-work. /sf-lfg will refuse to advance from plan to work if any of the five fields are blank or hand-waved ("we'll add tests later" is not a verification strategy).

**Each field must name its proof, not gesture at one.** A verification field that cannot name the command or assertion that will produce its evidence is not done — return to spec. Because this is a plan, the command is *named* (to be run in `/sf-work`), not yet executed. Name them concretely: `sf apex run test --result-format human` for the acceptance assertion and coverage %, `sf project deploy start --dry-run` for the deploy/integration boundary, an explicit `Limits.getQueries()`/`Limits.getDmlStatements()` calculation at the bulk threshold for the governor boundary, and the `HttpCalloutMock` class or `System.runAs` user for the integration/sharing checks. "We'll add tests later" is not a verification strategy — it names no proof.

### Rationalizations (Excuse → Reality)

_Pressure-test-pending hypotheses (see `docs/pressure-tests/`): guidance to pre-empt the excuses used to skip this gate under deadline, not yet independently validated._

| Excuse | Reality |
| --- | --- |
| "This trigger only ever gets one record from the UI." | Data Loader, the REST/Bulk API, and Flow-triggered DML all pass collections on day one — and the org cannot stop them. Bulk safety is not optional. |
| "Governor limits don't matter in a scratch org, it's just for testing." | Scratch-org and sandbox limits mirror production Enterprise Edition. There is no test-only exemption. |
| "We'll fix sharing after it ships — it's admin-only for now." | Profile/permission-set assignment is a config change an admin makes without redeploying code. `without sharing` does not auto-correct when the audience widens. |
| "Coverage is at 75%, we're good." | 75% is a deploy gate, not a behavior check. Coverage counts lines executed, not assertions made — a test with no asserts hits coverage and proves nothing. |
| "It's just a config/Flow change, there's no code to test." | Flow, validation-rule, and formula changes still change behavior. They need before/after assertions, not a deploy-succeeded check. |

***

