---
name: sf-work
tier: discipline-gate
description: "Execute work efficiently against a Salesforce plan or feature description while maintaining quality and finishing complete features. Use when implementing Apex classes, LWC components, Flow automation, integrations, or any planned Salesforce work. Includes a Salesforce-aware system-wide test check (trigger contexts, bulkification, governor limits, sharing scenarios, mock callouts). Trigger phrases: 'work on this plan', 'implement this Salesforce feature', 'build out this Apex', 'execute this trigger plan', 'ship this LWC'."
argument-hint: "[plan file path under docs/plans/, or feature description for bare-prompt work]"
---

# /sf-work

> **Persona dispatch.** This skill dispatches personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). Review personas are referenced from `../sf-review/references/personas/`, research personas from `../sf-plan/references/personas/`.

> **Principles enforced:** 1 (preserve the quality ceiling), 2 (verifiability), 3 (jagged intelligence). See `PRINCIPLES.md`.

## Copy-paste-to-agent

```
Implement a Salesforce feature against an existing plan. Before writing code, dispatch
sf-learnings-researcher and sf-repo-research-analyst in parallel. Then write code AND tests
together — verification is not a follow-up. Before declaring complete, answer all five
System-Wide Test Check questions: trigger contexts, bulk at 200+, governor limits, sharing,
integration mocks. If the plan has a Verification Strategy section, the implementation must
satisfy every field; do not relax it.
```

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Interaction Method

When asking the user a question, use the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini. Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors. Never silently skip the question.

Ask one question at a time. Prefer a concise single-select choice when natural options exist.

You are implementing a Salesforce feature with parallel persona support and built-in quality checks.

## Goal

Implement the feature described in: `$ARGUMENTS.plan`

If a plan file path is provided, read it first. If a description is provided, implement directly.

***

## Step 0: Pre-Implementation Research (parallel)

Before writing code, dispatch these personas **in parallel**:

* Task sf-learnings-researcher(feature_description) — Check for relevant past solutions

* Task sf-repo-research-analyst(feature_description) — Understand existing patterns

Apply findings to inform implementation approach.

***

## Step 1: Route via Indexes

Classify the implementation, then route:

* Read `../sf-review/references/personas/` to decide applicable persona categories

* Read `skills/index.md` to decide applicable skills

* Include `skills/governor-limits/SKILL.md` for limit-sensitive backend work

* For metadata or code generation, dispatch the matching action-shaped skill: `/apex-generate` (Apex class + tests), `/flow-generate` (Flow XML via MCP pipeline), `/validation-rule-generate`, `/apex-trigger-refactor`, `/slds2-uplift` (LWC), `/metadata-generate` (object / field / app / tab / listview / lightning-type), `/lightning-page-generate` (FlexiPage or full LEX app), `/permission-set-generate`. Reference skills (`apex-patterns`, `flow-patterns`, `lwc-patterns`, etc.) describe the shape; generation skills produce the artifact.

***

## Step 2: Internal-First Implementation

Use built-in platform features wherever possible:

* Flows, Validation Rules, Approval Processes

* Apex, Platform Events, and standard metadata

* LWC, Aura, Visualforce for UI

* Standard security model (CRUD/FLS, sharing)

If external services are needed, justify explicitly.

***

## Step 2.5: Test-First (Red → Green → Refactor)

**Iron Law: NO APEX / LWC / FLOW PRODUCTION LOGIC WITHOUT A FAILING TEST FIRST.**

* **RED** — write the `@isTest` method (or Jest spec) that asserts the not-yet-built behavior, then run it and confirm it fails for the expected reason: `sf apex run test --result-format human` (Apex) or `npm run test:unit` (LWC Jest). Paste the red failure.

* **GREEN** — write the minimal production code that makes the test pass. Nothing more.

* **REFACTOR** — simplify with the tests green.

**Forcing function:** production code written before its test is deleted and rewritten test-first — not "kept as reference." A draft written first bakes in whatever bulk-safety or sharing bug it has before any test can catch it.

**Scope:** production logic — Apex classes/triggers, LWC JS, Flow decision logic. Pure config/metadata with no behavioral change is exempt (record the reason), but Flow, validation-rule, and formula *behavior* changes still need before/after assertions, not just a deploy-succeeded check.

This precedes — it does not replace — the Step 4 System-Wide Test Check, which is a completeness gate, not a red/green loop.

***

## Step 3: Implementation Standards

### Apex Code

* Follow existing trigger handler pattern in codebase

* Bulkify all operations (handle 200+ records)

* CRUD/FLS enforcement on all database operations

* Proper exception handling

* Meaningful method and variable names

### Flows

* Clear element naming (e.g., `Get_Account_Details`, `Decision_Check_Status`)

* Entry conditions to prevent unnecessary execution

* Bulkified operations (no DML/SOQL in loops)

* Fault handling for error scenarios

### LWC

* Component naming follows existing conventions

* Proper error handling and loading states

* Accessible markup (ARIA, keyboard navigation)

* Efficient wire/imperative Apex calls

### Test Classes

* Minimum 90% code coverage target

* Bulk tests (200+ records)

* Positive and negative scenarios

* Test as different user contexts when relevant

***

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

## Step 5: Incremental Commits

Make small, focused commits as you go:

* One commit per logical unit of work

* Clear commit messages describing the change

* Don't batch all changes into one commit

***

## Output

Create/modify only the required Salesforce files and list changed files in your response.

***

## After Implementation

When implementation is complete:

```
Implementation complete.

Files created/modified:
- [list of files]

System-Wide Test Check:
✅ Trigger contexts: [handled/not applicable]
✅ Bulk tests: [included/not applicable]
✅ Governor limits: [tested/not applicable]
✅ Sharing scenarios: [covered/not applicable]
✅ Integration mocks: [mocked/not applicable]

Next: /sf-review
```
