---
name: sf-lfg
description: "Full autonomous Salesforce delivery pipeline: ideate (if needed) -> brainstorm (if needed) -> plan -> deepen -> work -> review -> resolve feedback -> polish (if UI surface) -> test -> optionally deploy. Use when the user says 'lfg', 'ship this', 'do the whole thing', 'autopilot this Salesforce feature', 'end-to-end this' and wants the full idea-to-deploy flow. Honors Salesforce constraints (governor limits, sharing, deploy targets) and respects deploy-target choice (scratch, sandbox, none)."
argument-hint: "[feature description or plan path; optionally pass 'deploy=scratch'/'deploy=sandbox'/'deploy=none']"
---

# /sf-lfg

> **Persona dispatch.** This pipeline dispatches personas as isolated subagents — see the `dispatching-parallel-personas` skill for the mechanics (isolated subagents, same-response parallelism, same-file-conflict check). The PLAN stage delegates to `/sf-plan` and the REVIEW stage to `/sf-review`, which own their personas (research → `../sf-plan/references/personas/`, review → `../sf-review/references/personas/`).

> **Principles enforced:** all seven, but especially 1 (preserve the quality ceiling) and 2 (verifiability). See `PRINCIPLES.md`.

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

## Stage 0: IDEATE & BRAINSTORM (the front "bread" — human-led, conditional)

> **Principle 5 (taste over typing) and Principle 3 (stay in the loop):** *what to build* is a human call, not an autonomous one.

**Skip** when `$ARGUMENTS.feature` is already a concrete feature description or a plan-file path. **Run** when the input is vague (e.g. "improve our case management") or the user wants to decide *what is worth building* before committing the autonomous middle.

1. If a `STRATEGY.md` exists at the repo root, read it first and ground ideation in its target problem, users, and metrics.
2. If the direction is unclear, run `/sf-ideate` to generate and critically evaluate grounded Salesforce options; surface them to the human and let them pick.
3. Once a direction is chosen, run `/sf-brainstorm` (if the requirements aren't already clear) to shape scope and edge cases, writing to `docs/brainstorms/`.

**Gate (Principle 3):** A human confirms the direction before the autonomous middle runs. In fully autonomous mode with a concrete feature supplied, this stage is a no-op and the pipeline starts at Stage 1.

***

## Stage 1: PLAN

If `$ARGUMENTS.feature` is a file path, read it as the plan. Otherwise, create one:

1. Check `docs/brainstorms/` for matching brainstorm.
2. Dispatch parallel research personas:

   * Task sf-learnings-researcher(feature)

   * Task sf-repo-research-analyst(feature)

   * Task sf-best-practices-researcher(feature)

   * Task sf-framework-docs-researcher(feature)
3. Design architecture (no code).
4. Run spec flow analysis:

   * Task sf-spec-flow-analyzer(plan)
5. Save to `docs/plans/YYYY-MM-DD-feat-{slug}-plan.md`.

**Gate (Principle 2):** Plan must have acceptance criteria, task list, AND a complete five-field Verification Strategy section: acceptance assertion, bulk threshold, governor boundary, sharing scenario, integration mock or dry-run. Hand-waved fields ("we'll add tests later") fail the gate. If the gate fails, return to Stage 1.

***

## Stage 2: DEEPEN

Enhance the plan with parallel research per section:

1. Parse plan sections.
2. Dispatch research personas per section (governor limits, sharing, security, performance).
3. Merge findings into plan.
4. Add Salesforce-specific depth (order of execution, API versions, known issues).

**Gate:** Plan sections must have research notes before proceeding.

***

## Stage 3: WORK

Implement the plan:

1. Pre-implementation research (parallel):

   * Task sf-learnings-researcher(plan)

   * Task sf-repo-research-analyst(plan)
2. Route via indexes for applicable agents/skills.
3. Implement with native-first approach.
4. Write tests alongside code.
5. Run System-Wide Test Check (5 questions):

   * Trigger fire check

   * Bulk test check (200+ records)

   * Governor limit test

   * Sharing scenario check

   * Integration mock check
6. Make incremental commits.

**Gate:** All 5 test check questions must pass before proceeding.

***

## Stage 3.5: VERIFY (independent)

Dispatch `sf-implementation-verifier` (persona under `../sf-review/references/personas/`) as an isolated, read-only subagent with a clean context. It independently re-runs the 5 System-Wide Test Check questions against the diff and returns PASS/FAIL per question with pasted evidence — it does not trust the implementer's self-report.

**Gate:** independent verification returns PASS on all 5 questions (overall GO) before proceeding to Review.

***

## Stage 4: REVIEW

Review with parallel persona dispatch:

1. Classify changed files.
2. Dispatch all applicable review personas in parallel (comprehensive depth):

   * Stack-specific agents (Apex, LWC, Flow, Integration)

   * Architecture agents (pattern recognition, metadata consistency)

   * Workflow agents (code simplicity, deployment verification)

   * Research personas (best practices validation)
3. Consolidate findings by severity.

**Gate:** No Critical or High findings remaining before proceeding.

***

## Stage 5: RESOLVE

Fix any review findings:

1. Address Critical findings first, then High, then Medium.
2. For each fix:

   * Make the code change

   * Verify the fix doesn't introduce new issues

   * Commit with descriptive message
3. Re-run review on changed files only (fast depth).

**Gate:** Re-review returns no Critical or High findings.

***

## Stage 6: POLISH (the back "bread" — conditional, UI surfaces only)

> **Principle 1 (preserve the quality ceiling) and Principle 5 (taste over typing):** correctness passed review; now make it *feel right*.

**Skip entirely** for pure Apex / Flow / metadata backend changes. **Run** only when the changed files include a front-end surface (LWC, Aura, Experience Cloud, or a React / headless client on UI-API / GraphQL).

Run `/sf-polish` — it resolves the changed UI scope, detects the front-end stack (LWC / Aura / Experience Cloud LWR / React-headless) via its stack-profile registry, and applies the matching design + accessibility (WCAG A/AA) + copy lens, dispatching the right agents (`sf-lwc-accessibility-guardian`, `sf-aura-migration-advisor`, …) and `/slds2-uplift`. It verifies with accessibility Jest tests and before/after screenshots where a preview exists.

**Gate (Principle 1):** No WCAG A/AA violations and no obvious UX or copy defects on the changed surface. Polished UI re-enters Stage 7 (TEST).

***

## Stage 7: TEST

Run comprehensive tests:

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTA5LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
# Run all local tests with coverage
sf apex run test --test-level RunLocalTests --code-coverage --synchronous
```

1. Verify all tests pass.
2. Verify code coverage ≥ 75% org-wide, ≥ 90% per class.
3. Check for any test failures or coverage gaps.

**Gate:** All tests pass with required coverage. If tests fail, return to Stage 5.

***

## Stage 8: DEPLOY (conditional)

Based on `$ARGUMENTS.deploy`:

### deploy=none (default)

Skip deployment. Report readiness.

### deploy=scratch

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTYxLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf org create scratch --definition-file config/project-scratch-def.json --alias lfg-test
sf project deploy start --target-org lfg-test --test-level RunLocalTests
```

### deploy=sandbox

1. Dispatch deployment verification:

   * Task sf-deployment-verification-agent(changed_files)
2. Validate deployment:

   ```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NjAsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
   sf project deploy start --dry-run --test-level RunLocalTests
   ```
3. If validation passes and Go decision:

   ```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTAsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
   sf project deploy start --test-level RunLocalTests
   ```

**Gate:** Deployment succeeds with all tests passing.

***

## Stage 9: COMPOUND

After pipeline completes (regardless of deploy stage):

1. Analyze what was built.
2. Search for existing knowledge to avoid duplicates.
3. Write solution documents to `docs/solutions/`.
4. Update relevant agents/skills with new patterns.
5. Update CLAUDE.md with project context.

***

## Abort Conditions

The pipeline aborts and asks for human input if any of the following fire. These map to the principles in `PRINCIPLES.md` — they are not advisory.

* Plan has no clear acceptance criteria (Stage 1).

* Plan is missing a complete five-field Verification Strategy section, or any field is hand-waved (Stage 1, Principle 2).

* Spec flow analysis finds Critical gaps with no obvious fix (Stage 1).
  Independent verification (Stage 3.5) returns NO-GO on any System-Wide Test Check question and no human has overridden (Principle 3).

* Review fires any non-negotiable gate from `sf-review`: security regression, governor regression, test coverage regression, trigger context regression, or sharing regression (Stage 4, Principle 1).

* Tests fail after 2 resolve cycles (Stage 5-7 loop).

* Polish gate fails: an unresolved WCAG A/AA violation on a changed UI surface (Stage 6, Principle 1).

* Deployment validation fails (Stage 8).

* Agent confidence is low on a jagged-edge call — order of execution, mixed-DML, sharing recalculation, async-context governor — and no human has reviewed (Principle 3). When in doubt, abort and ask.

***

## Output

```
🚀 LFG Pipeline Complete

Feature: {feature_name}
Plan: docs/plans/{plan_file}

Pipeline Results:
├── Ideate:  ✅ {direction chosen|skipped (concrete input)}
├── Plan:    ✅ Created with {n} research agents
├── Deepen:  ✅ {n} sections enhanced
├── Work:    ✅ {n} files created/modified
├── Review:  ✅ {n} agents dispatched, {n} findings resolved
├── Resolve: ✅ {n} fixes applied
├── Polish:  ✅ {UI surfaces polished|skipped (no UI)}
├── Test:    ✅ All tests passing, {n}% coverage
├── Deploy:  ✅ {deployed_to|skipped}
└── Compound:✅ {n} solutions documented

Knowledge captured:
- docs/solutions/: {n} new entries
- Skills updated: {list}
- Agents updated: {list}

Total time: {duration}
```
