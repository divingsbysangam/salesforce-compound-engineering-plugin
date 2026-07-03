---
name: sf-work
description: "Execute work efficiently against a Salesforce plan or feature description while maintaining quality and finishing complete features. Use when implementing Apex classes, LWC components, Flow automation, integrations, or any planned Salesforce work. Includes a Salesforce-aware system-wide test check (trigger contexts, bulkification, governor limits, sharing scenarios, mock callouts). Trigger phrases: 'work on this plan', 'implement this Salesforce feature', 'build out this Apex', 'execute this trigger plan', 'ship this LWC'."
argument-hint: "[plan file path under docs/plans/, or feature description for bare-prompt work]"
---

# /sf-work

> **Persona dispatch (V3.1, agentless).** Where this skill says "dispatch these agents", they are *personas* — prompt assets under `references/personas/<name>.md`, not registered agents. Run each as an **isolated subagent** (Task tool, general-purpose subagent, persona file contents as instructions): parallel on Claude Code, inline-in-sequence on harnesses without subagents. Review personas are referenced from `../sf-review/references/personas/`, research personas from `../sf-plan/references/personas/`.

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

## <span data-proof="authored" data-by="ai:claude">Interaction Method</span>

<span data-proof="authored" data-by="ai:claude">When asking the user a question, use the platform's blocking question tool:</span> <span data-proof="authored" data-by="ai:claude">`AskUserQuestion`</span> <span data-proof="authored" data-by="ai:claude">in Claude Code (call</span> <span data-proof="authored" data-by="ai:claude">`ToolSearch`</span> <span data-proof="authored" data-by="ai:claude">with</span> <span data-proof="authored" data-by="ai:claude">`select:AskUserQuestion`</span> <span data-proof="authored" data-by="ai:claude">first if its schema isn't loaded),</span> <span data-proof="authored" data-by="ai:claude">`request_user_input`</span> <span data-proof="authored" data-by="ai:claude">in Codex,</span> <span data-proof="authored" data-by="ai:claude">`ask_user`</span> <span data-proof="authored" data-by="ai:claude">in Gemini. Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors. Never silently skip the question.</span>

<span data-proof="authored" data-by="ai:claude">Ask one question at a time. Prefer a concise single-select choice when natural options exist.</span>

<span data-proof="authored" data-by="ai:claude">You are implementing a Salesforce feature with parallel persona support and built-in quality checks.</span>

## <span data-proof="authored" data-by="ai:claude">Goal</span>

<span data-proof="authored" data-by="ai:claude">Implement the feature described in:</span> <span data-proof="authored" data-by="ai:claude">`$ARGUMENTS.plan`</span>

<span data-proof="authored" data-by="ai:claude">If a plan file path is provided, read it first. If a description is provided, implement directly.</span>

***

## <span data-proof="authored" data-by="ai:claude">Step 0: Pre-Implementation Research (parallel)</span>

<span data-proof="authored" data-by="ai:claude">Before writing code, dispatch these personas</span> **<span data-proof="authored" data-by="ai:claude">in parallel</span>**<span data-proof="authored" data-by="ai:claude">:</span>

* <span data-proof="authored" data-by="ai:claude">Task sf-learnings-researcher(feature_description) — Check for relevant past solutions</span>

* <span data-proof="authored" data-by="ai:claude">Task sf-repo-research-analyst(feature_description) — Understand existing patterns</span>

<span data-proof="authored" data-by="ai:claude">Apply findings to inform implementation approach.</span>

***

## <span data-proof="authored" data-by="ai:claude">Step 1: Route via Indexes</span>

<span data-proof="authored" data-by="ai:claude">Classify the implementation, then route:</span>

* <span data-proof="authored" data-by="ai:claude">Read</span> <span data-proof="authored" data-by="ai:claude">`../sf-review/references/personas/`</span> <span data-proof="authored" data-by="ai:claude">to decide applicable persona categories</span>

* <span data-proof="authored" data-by="ai:claude">Read</span> <span data-proof="authored" data-by="ai:claude">`skills/index.md`</span> <span data-proof="authored" data-by="ai:claude">to decide applicable skills</span>

* <span data-proof="authored" data-by="ai:claude">Include</span> <span data-proof="authored" data-by="ai:claude">`skills/governor-limits/SKILL.md`</span> <span data-proof="authored" data-by="ai:claude">for limit-sensitive backend work</span>

* For metadata or code generation, dispatch the matching action-shaped skill: `/apex-generate` (Apex class + tests), `/flow-generate` (Flow XML via MCP pipeline), `/validation-rule-generate`, `/apex-trigger-refactor`, `/slds2-uplift` (LWC), `/metadata-generate` (object / field / app / tab / listview / lightning-type), `/lightning-page-generate` (FlexiPage or full LEX app), `/permission-set-generate`. Reference skills (`apex-patterns`, `flow-patterns`, `lwc-patterns`, etc.) describe the shape; generation skills produce the artifact.

***

## <span data-proof="authored" data-by="ai:claude">Step 2: Internal-First Implementation</span>

<span data-proof="authored" data-by="ai:claude">Use built-in platform features wherever possible:</span>

* <span data-proof="authored" data-by="ai:claude">Flows, Validation Rules, Approval Processes</span>

* <span data-proof="authored" data-by="ai:claude">Apex, Platform Events, and standard metadata</span>

* <span data-proof="authored" data-by="ai:claude">LWC, Aura, Visualforce for UI</span>

* <span data-proof="authored" data-by="ai:claude">Standard security model (CRUD/FLS, sharing)</span>

<span data-proof="authored" data-by="ai:claude">If external services are needed, justify explicitly.</span>

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

## <span data-proof="authored" data-by="ai:claude">Step 3: Implementation Standards</span>

### <span data-proof="authored" data-by="ai:claude">Apex Code</span>

* <span data-proof="authored" data-by="ai:claude">Follow existing trigger handler pattern in codebase</span>

* <span data-proof="authored" data-by="ai:claude">Bulkify all operations (handle 200+ records)</span>

* <span data-proof="authored" data-by="ai:claude">CRUD/FLS enforcement on all database operations</span>

* <span data-proof="authored" data-by="ai:claude">Proper exception handling</span>

* <span data-proof="authored" data-by="ai:claude">Meaningful method and variable names</span>

### <span data-proof="authored" data-by="ai:claude">Flows</span>

* <span data-proof="authored" data-by="ai:claude">Clear element naming (e.g.,</span> <span data-proof="authored" data-by="ai:claude">`Get_Account_Details`,</span> <span data-proof="authored" data-by="ai:claude">`Decision_Check_Status`)</span>

* <span data-proof="authored" data-by="ai:claude">Entry conditions to prevent unnecessary execution</span>

* <span data-proof="authored" data-by="ai:claude">Bulkified operations (no DML/SOQL in loops)</span>

* <span data-proof="authored" data-by="ai:claude">Fault handling for error scenarios</span>

### <span data-proof="authored" data-by="ai:claude">LWC</span>

* <span data-proof="authored" data-by="ai:claude">Component naming follows existing conventions</span>

* <span data-proof="authored" data-by="ai:claude">Proper error handling and loading states</span>

* <span data-proof="authored" data-by="ai:claude">Accessible markup (ARIA, keyboard navigation)</span>

* <span data-proof="authored" data-by="ai:claude">Efficient wire/imperative Apex calls</span>

### <span data-proof="authored" data-by="ai:claude">Test Classes</span>

* <span data-proof="authored" data-by="ai:claude">Minimum 90% code coverage target</span>

* <span data-proof="authored" data-by="ai:claude">Bulk tests (200+ records)</span>

* <span data-proof="authored" data-by="ai:claude">Positive and negative scenarios</span>

* <span data-proof="authored" data-by="ai:claude">Test as different user contexts when relevant</span>

***

## <span data-proof="authored" data-by="ai:claude">Step 4: System-Wide Test Check</span>

**<span data-proof="authored" data-by="ai:claude">Before marking implementation complete, answer these 5 questions:</span>**

1. **<span data-proof="authored" data-by="ai:claude">Trigger Fire Check</span>**<span data-proof="authored" data-by="ai:claude">: What triggers fire on the affected objects? Are all contexts (insert/update/delete/undelete) handled correctly?</span>

2. **<span data-proof="authored" data-by="ai:claude">Bulk Test Check</span>**<span data-proof="authored" data-by="ai:claude">: Are bulk tests included that process 200+ records? Do they verify behavior at scale?</span>

3. **<span data-proof="authored" data-by="ai:claude">Governor Limit Test</span>**<span data-proof="authored" data-by="ai:claude">: Are governor limits tested? Specifically SOQL 101, DML 150, CPU timeout scenarios?</span>

4. **<span data-proof="authored" data-by="ai:claude">Sharing Scenario Check</span>**<span data-proof="authored" data-by="ai:claude">: Are sharing scenarios covered? Does the code work correctly under</span> <span data-proof="authored" data-by="ai:claude">`with sharing`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`without sharing`</span> <span data-proof="authored" data-by="ai:claude">contexts?</span>

5. **<span data-proof="authored" data-by="ai:claude">Integration Mock Check</span>**<span data-proof="authored" data-by="ai:claude">: Are all integration points (callouts, platform events) properly mocked in tests?</span>

<span data-proof="authored" data-by="ai:claude">If any answer is "no", add the missing test before proceeding.</span><span data-proof="suggestion" data-id="m1783069520483_1" data-by="ai:claude" data-kind="insert"><span data-proof="authored" data-by="ai:claude">
Answer each with pasted evidence, not a yes/no. Before marking the check complete, paste the fresh output of the command that proves it in this same message. A previous run, or "tests pass" without output, is not evidence.
Claim
Counts as evidence
Does NOT count
"Tests pass"
Fresh sf apex run test --result-format human output in this message
"Previous run passed", "should pass"
"Coverage met"
The actual coverage % from that run
"It was ~80% last time"
"Deploy is safe"
sf project deploy start --dry-run or sf project deploy report output
"It deployed before"
"Within governor limits"
A Limits.getQueries() / Limits.getDmlStatements() value at the 200+ bulk threshold
"It won't hit limits"
Rationalizations (Excuse → Reality)
Pressure-test-pending hypotheses (see docs/pressure-tests/): guidance to pre-empt the excuses used to skip this gate under deadline, not yet independently validated.
Excuse
Reality
"This trigger only ever gets one record from the UI."
Data Loader, the REST/Bulk API, and Flow-triggered DML all pass collections on day one — and the org cannot stop them. Bulk safety is not optional.
"I'll write the tests after, to hit coverage."
Coverage-after tests assert what the code does, not what it should. They won't catch a bulk-safety regression baked into the untested draft.
"Governor limits don't matter in a scratch org."
Scratch-org and sandbox limits mirror production Enterprise Edition. There is no test-only exemption.
"We'll fix sharing after it ships — it's admin-only for now."
Profile/permission-set assignment is a config change an admin makes without redeploying code. without sharing does not auto-correct when the audience widens.
"It's just a config/Flow change, there's no code to test."
Flow, validation-rule, and formula changes still change behavior. They need before/after assertions, not a deploy-succeeded check.</span></span>

***

## <span data-proof="authored" data-by="ai:claude">Step 5: Incremental Commits</span>

<span data-proof="authored" data-by="ai:claude">Make small, focused commits as you go:</span>

* <span data-proof="authored" data-by="ai:claude">One commit per logical unit of work</span>

* <span data-proof="authored" data-by="ai:claude">Clear commit messages describing the change</span>

* <span data-proof="authored" data-by="ai:claude">Don't batch all changes into one commit</span>

***

## <span data-proof="authored" data-by="ai:claude">Output</span>

<span data-proof="authored" data-by="ai:claude">Create/modify only the required Salesforce files and list changed files in your response.</span>

***

## <span data-proof="authored" data-by="ai:claude">After Implementation</span>

<span data-proof="authored" data-by="ai:claude">When implementation is complete:</span>

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

<!-- PROOF
{
  "version": 2,
  "marks": {
    "m1783069520483_1": {
      "kind": "insert",
      "by": "ai:claude",
      "createdAt": "2026-07-03T09:05:20.483Z",
      "range": {
        "from": 6814,
        "to": 8675
      },
      "content": "\nAnswer each with pasted evidence, not a yes/no. Before marking the check complete, paste the fresh output of the command that proves it in this same message. A previous run, or \"tests pass\" without output, is not evidence.\nClaim\nCounts as evidence\nDoes NOT count\n\"Tests pass\"\nFresh sf apex run test --result-format human output in this message\n\"Previous run passed\", \"should pass\"\n\"Coverage met\"\nThe actual coverage % from that run\n\"It was ~80% last time\"\n\"Deploy is safe\"\nsf project deploy start --dry-run or sf project deploy report output\n\"It deployed before\"\n\"Within governor limits\"\nA Limits.getQueries() / Limits.getDmlStatements() value at the 200+ bulk threshold\n\"It won't hit limits\"\nRationalizations (Excuse → Reality)\nPressure-test-pending hypotheses (see docs/pressure-tests/): guidance to pre-empt the excuses used to skip this gate under deadline, not yet independently validated.\nExcuse\nReality\n\"This trigger only ever gets one record from the UI.\"\nData Loader, the REST/Bulk API, and Flow-triggered DML all pass collections on day one — and the org cannot stop them. Bulk safety is not optional.\n\"I'll write the tests after, to hit coverage.\"\nCoverage-after tests assert what the code does, not what it should. They won't catch a bulk-safety regression baked into the untested draft.\n\"Governor limits don't matter in a scratch org.\"\nScratch-org and sandbox limits mirror production Enterprise Edition. There is no test-only exemption.\n\"We'll fix sharing after it ships — it's admin-only for now.\"\nProfile/permission-set assignment is a config change an admin makes without redeploying code. without sharing does not auto-correct when the audience widens.\n\"It's just a config/Flow change, there's no code to test.\"\nFlow, validation-rule, and formula changes still change behavior. They need before/after assertions, not a deploy-succeeded check.",
      "status": "pending"
    }
  }
}
-->

<!-- PROOF:END -->
