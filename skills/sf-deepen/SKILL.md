---
name: sf-deepen
description: "Deepen an existing Salesforce plan by dispatching parallel research agents per section, adding governor-limit analysis, sharing-model implications, security review, and platform-specific implementation details. Use when the user says 'deepen this plan', 'add depth to this plan', 'research more for this plan', 'strengthen the plan', or wants a second-pass enhancement on an existing Salesforce plan."
argument-hint: "[plan file path under docs/plans/]"
---

# /sf-deepen

> **Persona dispatch.** This skill dispatches personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). This skill's research personas are referenced from `../sf-plan/references/personas/`.

> **Principles enforced:** 4 (spec is the artifact), 2 (verifiability). See `PRINCIPLES.md`.

## Copy-paste-to-agent

```
Tighten an existing Salesforce plan into a load-bearing spec. This is NOT a research dump
— it is a spec-tightening pass. For each major plan section, dispatch the appropriate
research agent in parallel, then merge findings into the plan AS spec constraints (governor
caps, sharing-model implications, order-of-execution placement, API-version dependencies),
not as appended prose. If the plan's Verification Strategy from /sf-plan is incomplete or
hand-waved, fill the five fields concretely before returning.
```

## Relationship to /sf-plan

`/sf-plan` produces the spec. `/sf-deepen` tightens it. The split is:

* **`/sf-plan`** — runs once, produces the initial spec/plan/verification/tasks artifacts via parallel research.

* **`/sf-deepen`** — runs against an existing plan file, adds Salesforce-specific depth (governor analysis, sharing impact, order-of-execution placement, known issues) and concretes any vague verification fields.

If you just created a plan with `/sf-plan` and want it deeper, run `/sf-deepen <plan_path>`. Don't run `/sf-plan` twice on the same feature.

<feature_description>
#$ARGUMENTS
</feature_description>

## Interaction Method

When asking the user a question, use the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini. Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors. Never silently skip the question.

Ask one question at a time. Prefer a concise single-select choice when natural options exist.

You enhance an existing plan by dispatching parallel research personas for each section, adding depth, best practices, and Salesforce-specific implementation details.

## Goal

Deepen the plan at: `$ARGUMENTS.plan_path`

***

## Step 1: Parse Plan Sections

Read the plan file and identify all major sections that can benefit from deeper research:

* Architecture decisions

* Implementation phases

* Technical approach

* Security considerations

* Governor limit implications

* Testing strategy

* Deployment plan

***

## Step 2: Dispatch Parallel Research Per Section

For each section, launch the appropriate research agent **in parallel**:

### Architecture sections:

* Task sf-best-practices-researcher(architecture_context)

* Task sf-framework-docs-researcher(architecture_context)

### Governor Limit sections:

* Task sf-learnings-researcher("governor limits" + feature_context)

* Task sf-framework-docs-researcher("governor limits" + specific_operations)

### Security sections:

* Task sf-best-practices-researcher("salesforce security" + feature_context)

* Task sf-learnings-researcher("security" + feature_context)

### Integration sections:

* Task sf-framework-docs-researcher(integration_apis)

* Task sf-best-practices-researcher(integration_pattern)

### Testing sections:

* Task sf-best-practices-researcher("salesforce testing" + feature_context)

### Deployment sections:

* Task sf-best-practices-researcher("salesforce deployment" + component_types)

***

## Step 3: Merge Results

For each section:

1. Read the research agent's findings.
2. Integrate relevant best practices into the plan.
3. Add specific code examples or configuration details where helpful.
4. Flag any conflicts between the plan and best practices.
5. Add source references (URLs, documentation links).

***

## Step 4: Add Salesforce-Specific Depth

Enhance the plan with:

* **Governor Limit Analysis**: Specific limit calculations for the proposed design

* **Sharing Model Impact**: How the feature interacts with OWD and sharing rules

* **Order of Execution**: Where the feature sits in Salesforce's order of execution

* **API Version Considerations**: Features that depend on specific API versions

* **Known Issues**: Any relevant Salesforce known issues

***

## Step 5: Update Plan File

Write the enhanced plan back to the same file path, preserving the original structure but adding:

* `### Deep Research Notes` subsections under each major section

* Updated acceptance criteria based on research findings

* New risk items discovered during research

* Source references at the bottom

***

## Output

```
Plan deepened: {plan_path}

Research personas dispatched: {count}
Sections enhanced: {count}
New risks identified: {count}
Best practices added: {count}
Sources referenced: {count}

Next:
- /sf-work {plan_path} — Begin implementation
- /sf-review — Review the enhanced plan
```