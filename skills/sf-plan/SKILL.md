---
name: sf-plan
description: "Create structured implementation plans for Salesforce features. Use when planning Apex changes, LWC components, Flow automation, integrations, metadata deployments, or any multi-step Salesforce build. Also deepen existing plans. Use when the user says 'plan this Apex feature', 'how should I build this LWC', 'plan the integration', 'break down this Salesforce requirement', 'plan a trigger refactor', 'plan the deployment', or when a brainstorm/requirements document is ready for planning. For exploratory or ambiguous requests, prefer sf-brainstorm first."
argument-hint: "[optional: feature description, requirements doc path, plan path to deepen, or Salesforce work to plan]"
---

# /sf-plan

> **Persona dispatch (V3.1, agentless).** The research personas below are prompt assets under `references/personas/<name>.md`, not registered agents. Run each as an **isolated subagent**: use the Task tool with a general-purpose subagent and pass the persona file's contents as its instructions. On Claude Code these run in parallel with isolated context; on harnesses without a subagent primitive, apply each persona's prompt **inline, in sequence**.

> **Principles enforced:** 2 (verifiability), 4 (spec is the artifact), 7 (institutional knowledge). See `PRINCIPLES.md`.

**Strategy grounding:** If a `STRATEGY.md` exists at the repo root, read it first so the plan's tracks and metrics align with the program's stated approach.

## Copy-paste-to-agent

```
Plan a Salesforce feature without writing code. Produce three artifacts: spec.md (business
requirements + acceptance criteria), plan.md (architecture + governor/sharing/security analysis),
and tasks.md (ordered implementation checklist). Before writing the plan, dispatch
sf-learnings-researcher, sf-repo-research-analyst, sf-best-practices-researcher, and
sf-framework-docs-researcher in parallel. The plan MUST include a "Verification Strategy"
section that names the test, assertion, or dry-run that proves the feature works — no
verification, no plan. Save under docs/plans/YYYY-MM-DD-<type>-<slug>-plan.md.
```

<feature_description>
#$ARGUMENTS
</feature_description>

## <span data-proof="authored" data-by="ai:claude">Interaction Method</span>

<span data-proof="authored" data-by="ai:claude">When asking the user a question, use the platform's blocking question tool:</span> <span data-proof="authored" data-by="ai:claude">`AskUserQuestion`</span> <span data-proof="authored" data-by="ai:claude">in Claude Code (call</span> <span data-proof="authored" data-by="ai:claude">`ToolSearch`</span> <span data-proof="authored" data-by="ai:claude">with</span> <span data-proof="authored" data-by="ai:claude">`select:AskUserQuestion`</span> <span data-proof="authored" data-by="ai:claude">first if its schema isn't loaded),</span> <span data-proof="authored" data-by="ai:claude">`request_user_input`</span> <span data-proof="authored" data-by="ai:claude">in Codex,</span> <span data-proof="authored" data-by="ai:claude">`ask_user`</span> <span data-proof="authored" data-by="ai:claude">in Gemini. Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors. Never silently skip the question.</span>

<span data-proof="authored" data-by="ai:claude">Ask one question at a time. Prefer a concise single-select choice when natural options exist.</span>

<span data-proof="authored" data-by="ai:claude">You are planning a Salesforce implementation using parallel research personas. Your job is to research and design —</span> **<span data-proof="authored" data-by="ai:claude">NOT write code</span>**<span data-proof="authored" data-by="ai:claude">.</span>

## <span data-proof="authored" data-by="ai:claude">Goal</span>

<span data-proof="authored" data-by="ai:claude">Create a specification and technical design for:</span> <span data-proof="authored" data-by="ai:claude">`$ARGUMENTS.feature`</span>

***

## <span data-proof="authored" data-by="ai:claude">Step 0: Check for Brainstorm</span>

<span data-proof="authored" data-by="ai:claude">Before starting, check if a relevant brainstorm exists:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTEsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
ls -la docs/brainstorms/*.md 2>/dev/null | head -10
```

<span data-proof="authored" data-by="ai:claude">If a recent brainstorm matches this feature:</span>

1. <span data-proof="authored" data-by="ai:claude">Read it and extract key decisions.</span>
2. <span data-proof="authored" data-by="ai:claude">Skip idea refinement — use brainstorm decisions as input.</span>
3. <span data-proof="authored" data-by="ai:claude">Announce: "Found brainstorm from {date}: {topic}. Using as context."</span>

<span data-proof="authored" data-by="ai:claude">If no brainstorm found, proceed with research.</span>

***

## <span data-proof="authored" data-by="ai:claude">Step 1: Parallel Research (dispatch simultaneously)</span>

<span data-proof="authored" data-by="ai:claude">Launch these research personas</span> **<span data-proof="authored" data-by="ai:claude">in parallel</span>** <span data-proof="authored" data-by="ai:claude">as isolated subagents (see the convention above):</span>

* <span data-proof="authored" data-by="ai:claude">Task sf-learnings-researcher(feature_description) — Check institutional knowledge</span>

* <span data-proof="authored" data-by="ai:claude">Task sf-repo-research-analyst(feature_description) — Understand project patterns</span>

* <span data-proof="authored" data-by="ai:claude">Task sf-best-practices-researcher(feature_description) — Research best practices</span>

* <span data-proof="authored" data-by="ai:claude">Task sf-framework-docs-researcher(feature_description) — Platform documentation</span>

### <span data-proof="authored" data-by="ai:claude">Conditional agents:</span>

* <span data-proof="authored" data-by="ai:claude">Task sf-git-history-analyzer(feature_description) — If modifying existing code</span>

***

## <span data-proof="authored" data-by="ai:claude">Step 2: Consolidate Research</span>

<span data-proof="authored" data-by="ai:claude">After all research agents return:</span>

1. <span data-proof="authored" data-by="ai:claude">Document relevant file paths from repo research.</span>
2. <span data-proof="authored" data-by="ai:claude">Include institutional learnings from</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`.</span>
3. <span data-proof="authored" data-by="ai:claude">Note external documentation URLs and best practices.</span>
4. <span data-proof="authored" data-by="ai:claude">Capture CLAUDE.md conventions.</span>

***

## <span data-proof="authored" data-by="ai:claude">Step 3: Internal-First Discovery</span>

<span data-proof="authored" data-by="ai:claude">Prefer Salesforce-native capabilities:</span>

* <span data-proof="authored" data-by="ai:claude">Declarative automation (Flows, Validation Rules, Approval Processes)</span>

* <span data-proof="authored" data-by="ai:claude">Apex and platform events</span>

* <span data-proof="authored" data-by="ai:claude">LWC, standard UI patterns</span>

* <span data-proof="authored" data-by="ai:claude">Standard objects, fields, and metadata</span>

* <span data-proof="authored" data-by="ai:claude">Standard security model</span>

<span data-proof="authored" data-by="ai:claude">If external services are proposed, justify why native options are insufficient.</span>

***

## <span data-proof="authored" data-by="ai:claude">Step 4: Spec Flow Analysis</span>

<span data-proof="authored" data-by="ai:claude">Dispatch the spec flow analyzer to validate the design:</span>

* <span data-proof="authored" data-by="ai:claude">Task sf-spec-flow-analyzer(feature_spec, research_findings)</span>

<span data-proof="authored" data-by="ai:claude">Review the permutation matrix and address any gaps identified.</span><span data-proof="authored" data-by="ai:claude">


Step 5: Verification Strategy (mandatory, Principle 2)
Before the plan is considered complete, fill in a Verification Strategy section. This is the single non-negotiable section in every plan. If you cannot describe how the feature will be verified, the feature is not ready to be planned — return to spec.
The Verification Strategy section must answer all five of the following:
Acceptance assertion — What is the boolean check that proves the feature works? Express as an Apex assertion, SOQL count, Flow path, or LWC behavior. Example: assertEquals(1, [SELECT COUNT() FROM Lead WHERE Owner.Id = :territoryOwner.Id]).
Bulk threshold — At what record count is bulkification verified? For Apex, default to 200; for batch contexts, state the chunk size and the total. If bulk is not applicable (e.g., single-record UI flow), say so explicitly.
Governor boundary — Which governor limit is closest to the feature's worst case? Name it (SOQL 101, DML 150, CPU 10s, Heap 6MB, callout 100, etc.) and state the projected utilization at the verification threshold.
Sharing scenario — Under which sharing context is the feature verified? List the user profile or permission set used, and whether the feature runs with sharing, without sharing, or inherited sharing. State the expected behavior for an unprivileged user explicitly.
Integration mock or dry-run — For features with callouts, platform events, or deploy steps: name the mock class (HttpCalloutMock), the event publish assertion, or the sf project deploy start --dry-run command that proves the integration boundary works without side effects.
Verification Strategy is the gate between /sf-plan and /sf-work. /sf-lfg will refuse to advance from plan to work if any of the five fields are blank or hand-waved ("we'll add tests later" is not a verification strategy).</span>

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

## <span data-proof="authored" data-by="ai:claude">Critical Constraint</span>

**<span data-proof="authored" data-by="ai:claude">DO NOT WRITE CODE.</span>** <span data-proof="authored" data-by="ai:claude">This command produces:</span>

* <span data-proof="authored" data-by="ai:claude">Architecture decisions (which components, how they connect)</span>

* <span data-proof="authored" data-by="ai:claude">Method signatures (names, parameters, return types)</span>

* <span data-proof="authored" data-by="ai:claude">Configuration specifications (object names, field names, Flow structure)</span>

* <span data-proof="authored" data-by="ai:claude">Task lists for implementation</span>

<span data-proof="authored" data-by="ai:claude">Code implementation happens in</span> <span data-proof="authored" data-by="ai:claude">`/sf-work`.</span>

***

## <span data-proof="authored" data-by="ai:claude">Available Resources</span>

### <span data-proof="authored" data-by="ai:claude">Agents (Expertise)</span>

<span data-proof="authored" data-by="ai:claude">Read</span> <span data-proof="authored" data-by="ai:claude">`../sf-review/references/personas/`</span> <span data-proof="authored" data-by="ai:claude">to route to relevant review personas.</span>

### <span data-proof="authored" data-by="ai:claude">Skills (Domain Knowledge)</span>

<span data-proof="authored" data-by="ai:claude">Read</span> <span data-proof="authored" data-by="ai:claude">`skills/index.md`</span> <span data-proof="authored" data-by="ai:claude">to route to relevant skills.</span>

### <span data-proof="authored" data-by="ai:claude">Existing Codebase</span>

<span data-proof="authored" data-by="ai:claude">Explore the codebase to understand existing patterns.</span>

***

## <span data-proof="authored" data-by="ai:claude">Output</span>

<span data-proof="authored" data-by="ai:claude">Save plan under</span> <span data-proof="authored" data-by="ai:claude">`docs/plans/`</span> <span data-proof="authored" data-by="ai:claude">with format:
`docs/plans/YYYY-MM-DD-<type>-<feature-slug>-plan.md`</span>

<span data-proof="authored" data-by="ai:claude">Include:</span>

* <span data-proof="authored" data-by="ai:claude">`spec.md`</span> <span data-proof="authored" data-by="ai:claude">section (business requirements, acceptance criteria, constraints)</span>

* <span data-proof="authored" data-by="ai:claude">`plan.md`</span> <span data-proof="authored" data-by="ai:claude">section (components, architecture, design decisions, limits, security)</span><span data-proof="authored" data-by="ai:claude">
  verification.md section (the five-field Verification Strategy from Step 5 — mandatory, Principle 2)</span>

* <span data-proof="authored" data-by="ai:claude">`tasks.md`</span> <span data-proof="authored" data-by="ai:claude">section (implementation, testing, deployment checklist)</span>

***

## <span data-proof="authored" data-by="ai:claude">After Planning</span>

<span data-proof="authored" data-by="ai:claude">When plan is complete:</span>

```
Plan created: docs/plans/YYYY-MM-DD-<type>-<feature>-plan.md

Research agents dispatched: {count}
Institutional learnings applied: {count}
Spec flow gaps identified: {count}

Next steps:
- /sf-deepen docs/plans/<plan>.md — Enhance with deeper research
- /sf-work docs/plans/<plan>.md — Begin implementation
```

<!-- PROOF
{
  "version": 2,
  "marks": {
    "m1777551864066_5": {
      "kind": "replace",
      "by": "ai:claude",
      "createdAt": "2026-04-30T12:24:24.066Z",
      "range": {
        "from": 2764,
        "to": 2845
      },
      "content": "Task sf-learnings-researcher(feature_description) — Check institutional knowledge. Must-read (Principle 7). Treat returned solutions as constraints on the plan, not optional context. If the researcher returns matches, the plan must explicitly state how each match is applied or explicitly state why it does not apply.",
      "status": "pending"
    },
    "m1777551856091_2": {
      "kind": "insert",
      "by": "ai:claude",
      "createdAt": "2026-04-30T12:24:16.091Z",
      "range": {
        "from": 4041,
        "to": 5861
      },
      "content": "\n\n\nStep 5: Verification Strategy (mandatory, Principle 2)\nBefore the plan is considered complete, fill in a Verification Strategy section. This is the single non-negotiable section in every plan. If you cannot describe how the feature will be verified, the feature is not ready to be planned — return to spec.\nThe Verification Strategy section must answer all five of the following:\nAcceptance assertion — What is the boolean check that proves the feature works? Express as an Apex assertion, SOQL count, Flow path, or LWC behavior. Example: assertEquals(1, [SELECT COUNT() FROM Lead WHERE Owner.Id = :territoryOwner.Id]).\nBulk threshold — At what record count is bulkification verified? For Apex, default to 200; for batch contexts, state the chunk size and the total. If bulk is not applicable (e.g., single-record UI flow), say so explicitly.\nGovernor boundary — Which governor limit is closest to the feature's worst case? Name it (SOQL 101, DML 150, CPU 10s, Heap 6MB, callout 100, etc.) and state the projected utilization at the verification threshold.\nSharing scenario — Under which sharing context is the feature verified? List the user profile or permission set used, and whether the feature runs with sharing, without sharing, or inherited sharing. State the expected behavior for an unprivileged user explicitly.\nIntegration mock or dry-run — For features with callouts, platform events, or deploy steps: name the mock class (HttpCalloutMock), the event publish assertion, or the sf project deploy start --dry-run command that proves the integration boundary works without side effects.\nVerification Strategy is the gate between /sf-plan and /sf-work. /sf-lfg will refuse to advance from plan to work if any of the five fields are blank or hand-waved (\"we'll add tests later\" is not a verification strategy).",
      "status": "pending"
    },
    "m1777551864061_4": {
      "kind": "insert",
      "by": "ai:claude",
      "createdAt": "2026-04-30T12:24:24.061Z",
      "range": {
        "from": 6721,
        "to": 6821
      },
      "content": "\nverification.md section (the five-field Verification Strategy from Step 5 — mandatory, Principle 2)",
      "status": "pending"
    }
  }
}
-->

<!-- PROOF:END -->
