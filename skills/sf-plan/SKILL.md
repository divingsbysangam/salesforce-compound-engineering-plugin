---
name: sf-plan
tier: discipline-gate
description: "Create structured implementation plans for Salesforce features. Use when planning Apex changes, LWC components, Flow automation, integrations, metadata deployments, or any multi-step Salesforce build. Also deepen existing plans. Use when the user says 'plan this Apex feature', 'how should I build this LWC', 'plan the integration', 'break down this Salesforce requirement', 'plan a trigger refactor', 'plan the deployment', or when a brainstorm/requirements document is ready for planning. For exploratory or ambiguous requests, prefer sf-brainstorm first."
argument-hint: "[optional: feature description, requirements doc path, plan path to deepen, or Salesforce work to plan]"
---

# /sf-plan

> **Persona dispatch.** This skill dispatches its research personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). This skill owns the research personas under `references/personas/`.

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

## Interaction Method

When asking the user a question, use the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini. Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors. Never silently skip the question.

Ask one question at a time. Prefer a concise single-select choice when natural options exist.

You are planning a Salesforce implementation using parallel research personas. Your job is to research and design — **NOT write code**.

## Goal

Create a specification and technical design for: `$ARGUMENTS.feature`

***

## Step 0: Check for Brainstorm

Before starting, check if a relevant brainstorm exists:

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTEsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
ls -la docs/brainstorms/*.md 2>/dev/null | head -10
```

If a recent brainstorm matches this feature:

1. Read it and extract key decisions.
2. Skip idea refinement — use brainstorm decisions as input.
3. Announce: "Found brainstorm from {date}: {topic}. Using as context."

If no brainstorm found, proceed with research.

***

## Step 1: Parallel Research (dispatch simultaneously)

Launch these research personas **in parallel** as isolated subagents (see the convention above):

* Task sf-learnings-researcher(feature_description) — Check institutional knowledge

* Task sf-repo-research-analyst(feature_description) — Understand project patterns

* Task sf-best-practices-researcher(feature_description) — Research best practices

* Task sf-framework-docs-researcher(feature_description) — Platform documentation

### Conditional agents:

* Task sf-git-history-analyzer(feature_description) — If modifying existing code

***

## Step 2: Consolidate Research

After all research agents return:

1. Document relevant file paths from repo research.
2. Include institutional learnings from `docs/solutions/`.
3. Note external documentation URLs and best practices.
4. Capture CLAUDE.md conventions.

***

## Step 3: Internal-First Discovery

Prefer Salesforce-native capabilities:

* Declarative automation (Flows, Validation Rules, Approval Processes)

* Apex and platform events

* LWC, standard UI patterns

* Standard objects, fields, and metadata

* Standard security model

If external services are proposed, justify why native options are insufficient.

***

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

## Critical Constraint

**DO NOT WRITE CODE.** This command produces:

* Architecture decisions (which components, how they connect)

* Method signatures (names, parameters, return types)

* Configuration specifications (object names, field names, Flow structure)

* Task lists for implementation

Code implementation happens in `/sf-work`.

***

## Available Resources

### Agents (Expertise)

Read `../sf-review/references/personas/` to route to relevant review personas.

### Skills (Domain Knowledge)

Read `skills/index.md` to route to relevant skills.

### Existing Codebase

Explore the codebase to understand existing patterns.

***

## Output

Save plan under `docs/plans/` with format:
`docs/plans/YYYY-MM-DD-<type>-<feature-slug>-plan.md`

Include:

* `spec.md` section (business requirements, acceptance criteria, constraints)

* `plan.md` section (components, architecture, design decisions, limits, security)
  verification.md section (the five-field Verification Strategy from Step 5 — mandatory, Principle 2)

* `tasks.md` section (implementation, testing, deployment checklist)

***

## After Planning

When plan is complete:

```
Plan created: docs/plans/YYYY-MM-DD-<type>-<feature>-plan.md

Research agents dispatched: {count}
Institutional learnings applied: {count}
Spec flow gaps identified: {count}

Next steps:
- /sf-deepen docs/plans/<plan>.md — Enhance with deeper research
- /sf-work docs/plans/<plan>.md — Begin implementation
```
