---
name: sf-doc-review
description: "Review Salesforce planning documents (plans, requirements, brainstorms) using parallel persona agents that surface role-specific issues. Use when a Salesforce plan or requirements doc exists and the user wants to improve it. Trigger phrases: 'review this plan', 'doc-review this spec', 'persona review', 'find gaps in this Salesforce plan'."
argument-hint: "[path to a plan or requirements document under docs/plans/ or docs/brainstorms/]"
---

# sf-doc-review

**Persona dispatch.** This skill dispatches personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). This skill's own doc-review personas live under `references/personas/`; personas owned by another skill are referenced by relative path (review → `../sf-review/references/personas/`, research → `../sf-plan/references/personas/`).

Dispatch sf-feasibility-reviewer, sf-coherence-reviewer, sf-product-lens-reviewer, sf-scope-guardian-reviewer, sf-security-lens-reviewer, sf-design-lens-reviewer, and sf-adversarial-document-reviewer in parallel against a Salesforce planning document. Merge findings, dedupe, and present them with confidence scores.

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Salesforce Angle

* **Feasibility persona** flags governor-limit risks at plan time (e.g., 'this batch design is unbounded by record count').

* **Security lens** flags missing CRUD/FLS handling, sharing-rule changes that affect the data model, or external API auth gaps.

* **Scope guardian** challenges premature trigger-handler abstractions or fflib introduction when a simpler pattern fits.

* **Adversarial document reviewer** constructs Salesforce-specific failure scenarios (Bulk API + UI concurrent saves, Process Builder fanning into trigger, packaging-time consequences).

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