---
name: sf-resolve-pr-feedback
description: "Resolve PR review feedback on a Salesforce PR by evaluating validity and fixing issues in parallel. Use when the user says 'resolve PR feedback', 'address review comments', 'fix the review threads'. Salesforce-aware: distinguishes Apex-style reviewer suggestions from valid governor-limit/security/sharing concerns."
argument-hint: "[PR URL or number]"
---

# sf-resolve-pr-feedback

> **Persona dispatch.** This skill dispatches personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). The thread-resolver it spawns is the `sf-pr-comment-resolver` persona (a writer) at `references/personas/sf-pr-comment-resolver.md`, dispatched one per thread or thread-group — mind the same-file-conflict check when two threads touch one file.

Dispatch sub-agents to evaluate each review thread, classify validity, implement the fix, and respond. Each thread is processed in parallel with metadata-diff awareness.

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Salesforce Angle

* Distinguish style-preference comments from governor-limit / FLS / sharing correctness comments.

* When fix touches metadata (object, field, profile, permset), include the metadata XML diff in the resolution and re-run the affected Apex tests via `sf apex run test`.

* When fix touches a trigger or handler, verify the bulk test still passes against 200+ records.

* When fix involves a callout, confirm Named Credential and `Test.setMock` coverage remain aligned.

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