---
name: sf-debug
description: "Systematically find root causes and fix Salesforce bugs. Use when debugging Apex test failures, trigger fires, LWC runtime errors, deploy failures, governor limit exceptions, sharing/permission errors, integration callout failures, or metadata deploy validation errors. Trigger phrases: 'debug this trigger', 'why is this Apex test failing', 'trace this LWC error', 'investigate this deploy failure', 'why did this validate fail', 'fix this governor limit error'."
argument-hint: "[issue reference, error message, test path, log file, or description of broken behavior]"
---

# sf-debug

> **Persona dispatch.** This skill dispatches personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). The `sf-bug-reproduction-validator` (a writer) and any reviewers it spawns live under `references/personas/`; research personas are referenced from `../sf-plan/references/personas/`.

Investigate Salesforce-specific bugs systematically — tracing the full causal chain (UI → Flow → trigger → Apex → DML → callback) before proposing a fix — and optionally implement the fix with test-first discipline.

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Salesforce Angle

* **Trigger context awareness**: when a bug surfaces in a trigger, identify whether it fires on `before insert`, `after update`, `after undelete`, etc., and whether the same logic must hold across all relevant contexts.

* **Governor limit framing**: `System.LimitException` or `Too many SOQL queries: 101` errors are causal-chain symptoms; the cause is usually a query inside a loop, a recursive trigger, or unbatched DML several layers up.

* **Sharing-context bugs**: failing tests in production that pass in sandbox often trace to `with sharing` / `without sharing` / `inherited sharing` mismatches; reproduce with `System.runAs(User)` for the suspect role.

* **Mixed DML / setup/non-setup**: errors of the form `MIXED_DML_OPERATION` mean a DML on a setup object (User, Group, GroupMember) and a non-setup object happen in the same transaction; the fix is to split into asynchronous contexts.

* **Deploy validation failures**: `sf project deploy validate` failures are reproducible against a sandbox; capture the validation ID and run the relevant Apex test selectively before re-validating.

## Interaction Method

When asking the user a question, use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). Fall back to numbered options in chat when no blocking tool is available. Ask one question at a time. Prefer concise single-select choices when natural options exist.

## Procedure

This skill follows the standard sf-compound-engineering execution discipline:

1. **Understand the input** — read the `<feature_description>` block above and any referenced files, plans, or issues.
2. **Plan a small set of phases** — break the work into 2-5 ordered steps that an implementer (or another skill) can verify.
3. **Apply the Salesforce Angle notes above** — these encode the platform-specific considerations (governor limits, sharing context, deploy ordering, FLS, metadata semantics) that distinguish this skill from generic counterparts.
4. **Use Salesforce-aware contexts and commands** — file paths under `force-app/main/default/...`, test commands like `sf apex run test`, deploy commands like `sf project deploy validate` and `sf project deploy start`, query the org with `sf data query` when state inspection is needed.
5. **Surface decisions back to the user** — when a step requires a choice that materially affects scope or risk, ask using the platform's blocking question tool rather than guessing.

## Related

* Salesforce knowledge: `docs/solutions/` (search via the `sf-learnings-researcher` agent).

* Plugin conventions: see `CLAUDE.md` for frontmatter, naming, and protected-artifact rules.