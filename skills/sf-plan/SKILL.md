---
name: sf-plan
tier: discipline-gate
description: "Plan Salesforce work: ideate, brainstorm, strategy, plan, deepen. Use for 'plan this', 'how should I build', 'brainstorm', 'what should we improve', 'deepen the plan', STRATEGY.md."
argument-hint: "[mode:ideate|brainstorm|strategy|deepen] [feature, requirements doc, or plan path]"
---

# /sf-plan

## Modes

First argument `mode:<name>` selects a mode; everything after it passes to that mode's guide. Load only the guide for the chosen mode.

| Mode | Use for | Guide |
|---|---|---|
| `(none)` | Write an implementation plan under `docs/plans/` | this file |
| `ideate` | Generate and rank grounded improvement ideas | `references/ideate/guide.md` |
| `brainstorm` | Explore a feature before planning; writes `docs/brainstorms/` | `references/brainstorm/guide.md` |
| `strategy` | Create or update repo-root `STRATEGY.md` | `references/strategy/guide.md` |
| `deepen` | Add parallel research depth to an existing plan | `references/deepen/guide.md` |

> **Persona dispatch.** This skill dispatches its research personas as isolated subagents — see `../sf-work/references/dispatch/guide.md` for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). This skill owns the research personas under `references/personas/`.

> **Principles enforced:** 2 (verifiability), 4 (spec is the artifact), 7 (institutional knowledge). See `PRINCIPLES.md`.

**Strategy grounding:** If a `STRATEGY.md` exists at the repo root, read it first so the plan's tracks and metrics align with the program's stated approach.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Step 0: Check for Brainstorm** — read `references/step-0-check-for-brainstorm.md` before acting on this section.
- **Step 1: Parallel Research (dispatch simultaneously)** — read `references/step-1-parallel-research-dispatch-simultaneously.md` before acting on this section.
- **Step 2: Consolidate Research** — read `references/step-2-consolidate-research.md` before acting on this section.
- **Step 3: Internal-First Discovery** — read `references/step-3-internal-first-discovery.md` before acting on this section.
- **Step 4: Spec Flow Analysis** — read `references/step-4-spec-flow-analysis.md` before acting on this section.
- **Critical Constraint** — read `references/critical-constraint.md` before acting on this section.
- **Available Resources** — read `references/available-resources.md` before acting on this section.
- **Output** — read `references/output.md` before acting on this section.
- **After Planning** — read `references/after-planning.md` before acting on this section.

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
