---
name: sf-work
tier: discipline-gate
description: "Implement Salesforce work from a plan or prompt (Apex, LWC, Flow, metadata). Use for 'build this', 'implement the plan', 'simplify', 'optimize CPU/SOQL', worktrees, todos, handoff."
argument-hint: "[mode:simplify|optimize|worktree|todos|handoff] [plan path or feature description]"
---

# /sf-work

## Modes

First argument `mode:<name>` selects a mode; everything after it passes to that mode's guide. Load only the guide for the chosen mode.

| Mode | Use for | Guide |
|---|---|---|
| `(none)` | Implement against a plan or prompt, test-first | this file |
| `simplify` | Simplify recently changed code | `references/simplify/guide.md` |
| `optimize` | Metric-driven optimization loop (CPU, SOQL, heap) | `references/optimize/guide.md` |
| `worktree` | Create or manage isolated git worktrees | `references/worktree/guide.md` |
| `todos` | File-based task tracking in `todos/` | `references/todos/guide.md` |
| `handoff` | Write or resume a session handoff | `references/handoff/guide.md` |
| `dispatch` | Reference: how skills dispatch personas/lenses as subagents | `references/dispatch/guide.md` |

> **Persona dispatch.** This skill dispatches personas as isolated subagents — see `references/dispatch/guide.md` for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). Review personas are referenced from `../sf-review/references/personas/`, research personas from `../sf-plan/references/personas/`.

> **Principles enforced:** 1 (preserve the quality ceiling), 2 (verifiability), 3 (jagged intelligence). See `PRINCIPLES.md`.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Step 0: Pre-Implementation Research (parallel)** — read `references/step-0-pre-implementation-research-parallel.md` before acting on this section.
- **Step 1: Route via Indexes** — read `references/step-1-route-via-indexes.md` before acting on this section.
- **Step 2: Internal-First Implementation** — read `references/step-2-internal-first-implementation.md` before acting on this section.
- **Step 2.5: Test-First (Red → Green → Refactor)** — read `references/step-2-5-test-first-red-green-refactor.md` before acting on this section.
- **Step 3: Implementation Standards** — read `references/step-3-implementation-standards.md` before acting on this section.
- **Step 4: System-Wide Test Check** — read `references/step-4-system-wide-test-check.md` before acting on this section.
- **Step 5: Incremental Commits** — read `references/step-5-incremental-commits.md` before acting on this section.
- **Output** — read `references/output.md` before acting on this section.
- **After Implementation** — read `references/after-implementation.md` before acting on this section.

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

**Bundled reference loading is fail-closed.** Resolve every path under this skill's `references/` from this `SKILL.md` directory. If a required file cannot be read, stop and report the missing reference instead of approximating.

**Writable checkout.** Repo-local implementation writes need a git checkout you can edit. If this session has no writable checkout, but the user named a repository and the harness exposes a remote repo-work surface, run the work on that surface. Otherwise skip repo-local writes and report that no writable checkout is available.

**Do not ask which branch to start on** when already on a meaningful feature branch. After implementation, invoke `/sf-review`. Critical/High security findings abort `/sf-lfg` (Principle 1) — they are not warnings.

***
