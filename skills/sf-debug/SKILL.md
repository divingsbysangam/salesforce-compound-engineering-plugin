---
name: sf-debug
tier: discipline-gate
description: "Diagnose a Salesforce failure or explain code: tests, governor limits, deploys, LWC, sharing. Use for 'debug' or 'why is this failing'. Use sf-work when the change is already known."
argument-hint: "[mode:explain|agent-observe] [error, test path, log, or subject]"
---

# sf-debug

## Modes

First argument `mode:<name>` selects a mode; everything after it passes to that mode's guide. Load only the guide for the chosen mode.

| Mode | Use for | Guide |
|---|---|---|
| `(none)` | Reproduce, find the root cause, fix | this file |
| `explain` | Explain how or why code works, or recap work | `references/explain/guide.md` |
| `agent-observe` | Analyze production Agentforce sessions (STDM traces) | `references/agent-observe/guide.md` |

> **Principles enforced:** 2 (verifiability), 3 (jagged intelligence). See `PRINCIPLES.md`.

> **Persona dispatch.** This skill dispatches personas as isolated subagents — see `../sf-work/references/dispatch/guide.md` for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). The `sf-bug-reproduction-validator` (a writer) and any reviewers it spawns live under `references/personas/`; research personas are referenced from `../sf-plan/references/personas/`.

Investigate Salesforce-specific bugs systematically — tracing the full causal chain (UI → Flow → trigger → Apex → DML → callback) before proposing a fix — and optionally implement the fix with test-first discipline.

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Mandatory debugging gate** — read `references/mandatory-debugging-gate.md` before acting on this section.
- **3-strikes escalation rule** — read `references/3-strikes-escalation-rule.md` before acting on this section.
- **Defense-in-depth pattern** — read `references/defense-in-depth-pattern.md` before acting on this section.
- **Related** — read `references/related.md` before acting on this section.
- **Pipeline mode** — when invoked with `mode:pipeline`, read `references/pipeline-mode.md` before mutating.

**Iron Law:** no fixes without root-cause classification first (`references/mandatory-debugging-gate.md`).

## Mode

Default is interactive. **`mode:pipeline`** (set by `sf-ship mode:babysit` or `sf-lfg`) is non-interactive: never ask the user; fix only convergent bugs; return the structured JSON in `references/pipeline-mode.md`. Status spellings are fixed: `fixed-and-pushed | fixed-not-pushed | diagnosed-no-fix | flaky-infra | needs-human`. Those spellings stay in this file. A caller branches on them; a reference that restates them does not replace this line. `fixed-not-pushed` means the fix is committed locally and the push did not happen — never report that as `fixed-and-pushed` or as `diagnosed-no-fix`.

## Salesforce Angle

* **Trigger context awareness**: when a bug surfaces in a trigger, identify whether it fires on `before insert`, `after update`, `after undelete`, etc., and whether the same logic must hold across all relevant contexts.

* **Governor limit framing**: `System.LimitException` or `Too many SOQL queries: 101` errors are causal-chain symptoms; the cause is usually a query inside a loop, a recursive trigger, or unbatched DML several layers up.

* **Sharing-context bugs**: failing tests in production that pass in sandbox often trace to `with sharing` / `without sharing` / `inherited sharing` mismatches; reproduce with `System.runAs(User)` for the suspect role.

* **Mixed DML / setup/non-setup**: errors of the form `MIXED_DML_OPERATION` mean a DML on a setup object (User, Group, GroupMember) and a non-setup object happen in the same transaction; the fix is to split into asynchronous contexts.

* **Deploy validation failures**: `sf project deploy validate` failures are reproducible against a sandbox; capture the validation ID and run the relevant Apex test selectively before re-validating.

## Interaction Method

When asking the user a question, use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). Fall back to numbered options in chat when no blocking tool is available. Ask one question at a time. Prefer concise single-select choices when natural options exist.

## After the fix

Record which files this fix owns, and which files were already dirty. Commit and publish only the fix-owned files.

Do not ask whether to open a pull request when the branch contains only this fix. State the branch, the files, and that a pull request will be opened, then continue. If the branch also holds work this run did not create, commit the fix-owned files when they are separable and stop before push, naming the other files. If a fix-owned file was already dirty, ask once before including the user's edits.

An instruction already in context that names how this repo ships (drafts only, commit only, review first) outranks that default. Do not widen the diff to the rest of the branch. `mode:pipeline` still follows `references/pipeline-mode.md` and does not open a pull request on its own.
