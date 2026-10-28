---
name: sf-plan
tier: discipline-gate
description: "Plan Salesforce work before code: ideate, brainstorm, strategy, or an implementation plan. Use for 'plan this' or STRATEGY.md. Use sf-work to implement; use sf-debug when a test is already failing."
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

**Strategy grounding:** If a `STRATEGY.md` exists at the repo root, read it first. It is the agreed shared project document: written sections are settled direction, not a private draft. Align the plan's tracks and metrics with it, and do not reopen a section the user did not ask to revisit.

## Output contract

Classify the request before any research read. When the tier is uncertain, take the heavier one. `sf-lfg` and any caller that requires a Verification Strategy section takes **Durable**. These three names stay in this file; a reference does not replace the gate.

- **Direct** — one Salesforce change whose files, behavior, and check are already obvious (a label, help text, or a named assertion). Say what changes, where, and how it is verified, in a few sentences. Offer `sf-work`, or the user makes the edit. Do not write `docs/plans/`, dispatch research, or run document review.
- **Chat brief** — a bounded change with a few units and no cross-object sharing or governor design. In chat: what changes and why, each unit's files and test expectations, and one decisions line when a choice is already settled. Offer to save the brief or hand it to `sf-work`. No subagents and no document review.
- **Durable** — anything else, a request for a file, or a brainstorm decision an implementer must honor by id. Read the references below when each step starts (a read during intake does not replace the read at that step) and write `docs/plans/`.

A saved chat brief is plain markdown under `docs/plans/` with `title`, `type`, and `date` only. Do not mark it implementation-ready. Direct and Chat brief still name the check that proves the change (Principle 2); they do not skip it. Full section rules for the two chat tiers are in `references/output-contracts.md`, read only when that tier is selected.

## Durable reads

Procedure for a Durable plan lives in sibling files. Load each when its step starts:

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
Plan a Salesforce feature without writing code. Classify Direct, Chat brief, or Durable first.
Direct and Chat brief stay in chat and still name the check that proves the change.
Durable writes spec, plan, and tasks under docs/plans/ after parallel research, and the
Verification Strategy section is mandatory — no verification, no durable plan.
sf-lfg always takes Durable.
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

Repo-local plan writes need a git checkout you can edit. If this session has no writable checkout, but the user named a repository and the harness exposes a remote repo-work surface, write the plan there. Otherwise report that no writable checkout is available and return the plan in chat.

Leave the bootstrap when the problem frame is stated, the boundaries that matter are known, and success criteria or a verification strategy can be named — or when the user says to proceed. Confirm that frame before research when it is still open.

***
