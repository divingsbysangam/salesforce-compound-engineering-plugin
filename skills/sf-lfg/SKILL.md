---
name: sf-lfg
tier: discipline-gate
description: "Full autonomous Salesforce delivery pipeline: ideate (if needed) -> brainstorm (if needed) -> plan -> deepen -> work -> review -> resolve feedback -> polish (if UI surface) -> test -> optionally deploy. Use when the user says 'lfg', 'ship this', 'do the whole thing', 'autopilot this Salesforce feature', 'end-to-end this' and wants the full idea-to-deploy flow. Honors Salesforce constraints (governor limits, sharing, deploy targets) and respects deploy-target choice (scratch, sandbox, none)."
argument-hint: "[feature description or plan path; optionally pass 'deploy=scratch'/'deploy=sandbox'/'deploy=none']"
---

# /sf-lfg

> **Persona dispatch.** This pipeline dispatches personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). The PLAN stage delegates to `/sf-plan` and the REVIEW stage to `/sf-review`, which own their personas (research → `../sf-plan/references/personas/`, review → `../sf-review/references/personas/`).

> **Principles enforced:** all seven, but especially 1 (preserve the quality ceiling) and 2 (verifiability). See `PRINCIPLES.md`.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Stage 0: IDEATE & BRAINSTORM (the front "bread" — human-led, conditional)** — read `references/stage-0-ideate-brainstorm-the-front-bread-human-led-conditional.md` before acting on this section.
- **Stage 1: PLAN** — read `references/stage-1-plan.md` before acting on this section.
- **Stage 2: DEEPEN** — read `references/stage-2-deepen.md` before acting on this section.
- **Stage 3: WORK** — read `references/stage-3-work.md` before acting on this section.
- **Stage 3.5: VERIFY (independent)** — read `references/stage-3-5-verify-independent.md` before acting on this section.
- **Stage 4: REVIEW** — read `references/stage-4-review.md` before acting on this section.
- **Stage 5: RESOLVE** — read `references/stage-5-resolve.md` before acting on this section.
- **Stage 6: POLISH (the back "bread" — conditional, UI surfaces only)** — read `references/stage-6-polish-the-back-bread-conditional-ui-surfaces-only.md` before acting on this section.
- **Stage 7: TEST** — read `references/stage-7-test.md` before acting on this section.
- **Stage 8: DEPLOY (conditional)** — read `references/stage-8-deploy-conditional.md` before acting on this section.
- **Stage 9: COMPOUND** — read `references/stage-9-compound.md` before acting on this section.
- **Output** — read `references/output.md` before acting on this section.

## Copy-paste-to-agent

```
Run the full Salesforce delivery pipeline: ideate (if needed) → brainstorm (if needed) → plan →
deepen → work → review → resolve → polish (if UI surface) → test → deploy. Each stage has a gate.
Ideate and polish are the human "bread" (Principle 5 — taste over typing); the middle is the
AI loop. Aborts on Critical/High security findings, governor regressions, missing Verification
Strategy, repeated test failures, WCAG A/AA violations on changed UI, or deploy-validation
failures. Honors $ARGUMENTS.deploy = scratch | sandbox | none.
```

\<feature\_description>
\#$ARGUMENTS
\</feature\_description>

## Interaction Method

When asking the user a question, use the platform's blocking question tool: `AskUserQuestion` in Claude Code (call `ToolSearch` with `select:AskUserQuestion` first if its schema isn't loaded), `request_user_input` in Codex, `ask_user` in Gemini. Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors. Never silently skip the question.

Ask one question at a time. Prefer a concise single-select choice when natural options exist.

Full autonomous pipeline. Takes a feature from idea to deployment with minimal human intervention.

**LFG = Let's F***ing Go.**

## Goal

Execute the full compound engineering loop for: `$ARGUMENTS.feature`

***

## Pipeline Overview

```
 ┌─ HUMAN "bread" (taste) ─┐   ────────── AI "filling" (in the loop) ──────────   ┌─ HUMAN "bread" ─┐

  0. IDEATE → BRAINSTORM  →  1.PLAN → 2.DEEPEN → 3.WORK → 4.REVIEW → 5.RESOLVE  →  6. POLISH  →  7.TEST → 8.DEPLOY
  (what's worth building)      (40%)                      (20%)                    (UX/SLDS/a11y)         (optional)

                        9. COMPOUND  →  capture learnings to docs/solutions/ (runs after, feeds the next loop)

 Skills:  /sf-ideate · /sf-brainstorm · /sf-plan · /sf-deepen · /sf-work · /sf-review · /sf-polish · /sf-compound
 Stage 0 (ideate/brainstorm) and Stage 6 (polish) are human-led and conditional; the middle stages auto-run behind gates.
```

***

## Abort Conditions

The pipeline aborts and asks for human input if any of the following fire. These map to the principles in `PRINCIPLES.md` — they are not advisory.

* Plan has no clear acceptance criteria (Stage 1).

* Plan is missing a complete five-field Verification Strategy section, or any field is hand-waved (Stage 1, Principle 2).

* Spec flow analysis finds Critical gaps with no obvious fix (Stage 1).
  Independent verification (Stage 3.5) returns NO-GO on any System-Wide Test Check question and no human has overridden (Principle 3).

* A p0 file-todo remains active or blocked at the Stage 3→4 boundary (Principle 2).

* Review fires any non-negotiable gate from `sf-review`: security regression, governor regression, test coverage regression, trigger context regression, or sharing regression (Stage 4, Principle 1).

* Tests fail after 2 resolve cycles (Stage 5-7 loop).

* Polish gate fails: an unresolved WCAG A/AA violation on a changed UI surface (Stage 6, Principle 1).

* Deployment validation fails (Stage 8).

* Agent confidence is low on a jagged-edge call — order of execution, mixed-DML, sharing recalculation, async-context governor — and no human has reviewed (Principle 3). When in doubt, abort and ask.

***
