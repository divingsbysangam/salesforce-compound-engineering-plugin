---
name: sf-lfg
description: "Full autonomous Salesforce delivery pipeline: ideate (if needed) -> brainstorm (if needed) -> plan -> deepen -> work -> review -> resolve feedback -> polish (if UI surface) -> test -> optionally deploy. Use when the user says 'lfg', 'ship this', 'do the whole thing', 'autopilot this Salesforce feature', 'end-to-end this' and wants the full idea-to-deploy flow. Honors Salesforce constraints (governor limits, sharing, deploy targets) and respects deploy-target choice (scratch, sandbox, none)."
argument-hint: "[feature description or plan path; optionally pass 'deploy=scratch'/'deploy=sandbox'/'deploy=none']"
---

# /sf-lfg

> **Persona dispatch (V3.1, agentless).** Where stages below say "dispatch research/review agents", they mean *personas* — prompt assets under `references/personas/<name>.md`, not registered agents. Run each as an **isolated subagent** (Task tool, general-purpose subagent, persona file contents as instructions): parallel on Claude Code, inline-in-sequence on harnesses without subagents. The PLAN stage delegates to `/sf-plan` and the REVIEW stage to `/sf-review`, which own their personas (research → `../sf-plan/references/personas/`, review → `../sf-review/references/personas/`).

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

## <span data-proof="authored" data-by="ai:claude">Interaction Method</span>

<span data-proof="authored" data-by="ai:claude">When asking the user a question, use the platform's blocking question tool:</span> <span data-proof="authored" data-by="ai:claude">`AskUserQuestion`</span> <span data-proof="authored" data-by="ai:claude">in Claude Code (call</span> <span data-proof="authored" data-by="ai:claude">`ToolSearch`</span> <span data-proof="authored" data-by="ai:claude">with</span> <span data-proof="authored" data-by="ai:claude">`select:AskUserQuestion`</span> <span data-proof="authored" data-by="ai:claude">first if its schema isn't loaded),</span> <span data-proof="authored" data-by="ai:claude">`request_user_input`</span> <span data-proof="authored" data-by="ai:claude">in Codex,</span> <span data-proof="authored" data-by="ai:claude">`ask_user`</span> <span data-proof="authored" data-by="ai:claude">in Gemini. Fall back to numbered options in chat only when no blocking tool exists in the harness or the call errors. Never silently skip the question.</span>

<span data-proof="authored" data-by="ai:claude">Ask one question at a time. Prefer a concise single-select choice when natural options exist.</span>

<span data-proof="authored" data-by="ai:claude">Full autonomous pipeline. Takes a feature from idea to deployment with minimal human intervention.</span>

**<span data-proof="authored" data-by="ai:claude">LFG = Let's F</span>**<span data-proof="authored" data-by="ai:claude">*ing Go.**</span>

## <span data-proof="authored" data-by="ai:claude">Goal</span>

<span data-proof="authored" data-by="ai:claude">Execute the full compound engineering loop for:</span> <span data-proof="authored" data-by="ai:claude">`$ARGUMENTS.feature`</span>

***

## <span data-proof="authored" data-by="ai:claude">Pipeline Overview</span>

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

## <span data-proof="authored" data-by="ai:claude">Stage 1: PLAN</span>

<span data-proof="authored" data-by="ai:claude">If</span> <span data-proof="authored" data-by="ai:claude">`$ARGUMENTS.feature`</span> <span data-proof="authored" data-by="ai:claude">is a file path, read it as the plan. Otherwise, create one:</span>

1. <span data-proof="authored" data-by="ai:claude">Check</span> <span data-proof="authored" data-by="ai:claude">`docs/brainstorms/`</span> <span data-proof="authored" data-by="ai:claude">for matching brainstorm.</span>
2. <span data-proof="authored" data-by="ai:claude">Dispatch parallel research personas:</span>

   * <span data-proof="authored" data-by="ai:claude">Task sf-learnings-researcher(feature)</span>

   * <span data-proof="authored" data-by="ai:claude">Task sf-repo-research-analyst(feature)</span>

   * <span data-proof="authored" data-by="ai:claude">Task sf-best-practices-researcher(feature)</span>

   * <span data-proof="authored" data-by="ai:claude">Task sf-framework-docs-researcher(feature)</span>
3. <span data-proof="authored" data-by="ai:claude">Design architecture (no code).</span>
4. <span data-proof="authored" data-by="ai:claude">Run spec flow analysis:</span>

   * <span data-proof="authored" data-by="ai:claude">Task sf-spec-flow-analyzer(plan)</span>
5. <span data-proof="authored" data-by="ai:claude">Save to</span> <span data-proof="authored" data-by="ai:claude">`docs/plans/YYYY-MM-DD-feat-{slug}-plan.md`.</span>

**Gate (Principle 2):** Plan must have acceptance criteria, task list, AND a complete five-field Verification Strategy section: acceptance assertion, bulk threshold, governor boundary, sharing scenario, integration mock or dry-run. Hand-waved fields ("we'll add tests later") fail the gate. If the gate fails, return to Stage 1.

***

## <span data-proof="authored" data-by="ai:claude">Stage 2: DEEPEN</span>

<span data-proof="authored" data-by="ai:claude">Enhance the plan with parallel research per section:</span>

1. <span data-proof="authored" data-by="ai:claude">Parse plan sections.</span>
2. <span data-proof="authored" data-by="ai:claude">Dispatch research personas per section (governor limits, sharing, security, performance).</span>
3. <span data-proof="authored" data-by="ai:claude">Merge findings into plan.</span>
4. <span data-proof="authored" data-by="ai:claude">Add Salesforce-specific depth (order of execution, API versions, known issues).</span>

**<span data-proof="authored" data-by="ai:claude">Gate:</span>** <span data-proof="authored" data-by="ai:claude">Plan sections must have research notes before proceeding.</span>

***

## <span data-proof="authored" data-by="ai:claude">Stage 3: WORK</span>

<span data-proof="authored" data-by="ai:claude">Implement the plan:</span>

1. <span data-proof="authored" data-by="ai:claude">Pre-implementation research (parallel):</span>

   * <span data-proof="authored" data-by="ai:claude">Task sf-learnings-researcher(plan)</span>

   * <span data-proof="authored" data-by="ai:claude">Task sf-repo-research-analyst(plan)</span>
2. <span data-proof="authored" data-by="ai:claude">Route via indexes for applicable agents/skills.</span>
3. <span data-proof="authored" data-by="ai:claude">Implement with native-first approach.</span>
4. <span data-proof="authored" data-by="ai:claude">Write tests alongside code.</span>
5. <span data-proof="authored" data-by="ai:claude">Run System-Wide Test Check (5 questions):</span>

   * <span data-proof="authored" data-by="ai:claude">Trigger fire check</span>

   * <span data-proof="authored" data-by="ai:claude">Bulk test check (200+ records)</span>

   * <span data-proof="authored" data-by="ai:claude">Governor limit test</span>

   * <span data-proof="authored" data-by="ai:claude">Sharing scenario check</span>

   * <span data-proof="authored" data-by="ai:claude">Integration mock check</span>
6. <span data-proof="authored" data-by="ai:claude">Make incremental commits.</span>

**<span data-proof="authored" data-by="ai:claude">Gate:</span>** <span data-proof="authored" data-by="ai:claude">All 5 test check questions must pass before proceeding.</span>

***

## Stage 3.5: VERIFY (independent)

Dispatch `sf-implementation-verifier` (persona under `../sf-review/references/personas/`) as an isolated, read-only subagent with a clean context. It independently re-runs the 5 System-Wide Test Check questions against the diff and returns PASS/FAIL per question with pasted evidence — it does not trust the implementer's self-report.

**Gate:** independent verification returns PASS on all 5 questions (overall GO) before proceeding to Review.

***

## <span data-proof="authored" data-by="ai:claude">Stage 4: REVIEW</span>

<span data-proof="authored" data-by="ai:claude">Review with parallel persona dispatch:</span>

1. <span data-proof="authored" data-by="ai:claude">Classify changed files.</span>
2. <span data-proof="authored" data-by="ai:claude">Dispatch all applicable review personas in parallel (comprehensive depth):</span>

   * <span data-proof="authored" data-by="ai:claude">Stack-specific agents (Apex, LWC, Flow, Integration)</span>

   * <span data-proof="authored" data-by="ai:claude">Architecture agents (pattern recognition, metadata consistency)</span>

   * <span data-proof="authored" data-by="ai:claude">Workflow agents (code simplicity, deployment verification)</span>

   * <span data-proof="authored" data-by="ai:claude">Research personas (best practices validation)</span>
3. <span data-proof="authored" data-by="ai:claude">Consolidate findings by severity.</span>

**<span data-proof="authored" data-by="ai:claude">Gate:</span>** <span data-proof="authored" data-by="ai:claude">No Critical or High findings remaining before proceeding.</span>

***

## <span data-proof="authored" data-by="ai:claude">Stage 5: RESOLVE</span>

<span data-proof="authored" data-by="ai:claude">Fix any review findings:</span>

1. <span data-proof="authored" data-by="ai:claude">Address Critical findings first, then High, then Medium.</span>
2. <span data-proof="authored" data-by="ai:claude">For each fix:</span>

   * <span data-proof="authored" data-by="ai:claude">Make the code change</span>

   * <span data-proof="authored" data-by="ai:claude">Verify the fix doesn't introduce new issues</span>

   * <span data-proof="authored" data-by="ai:claude">Commit with descriptive message</span>
3. <span data-proof="authored" data-by="ai:claude">Re-run review on changed files only (fast depth).</span>

**<span data-proof="authored" data-by="ai:claude">Gate:</span>** <span data-proof="authored" data-by="ai:claude">Re-review returns no Critical or High findings.</span>

***

## Stage 6: POLISH (the back "bread" — conditional, UI surfaces only)

> **Principle 1 (preserve the quality ceiling) and Principle 5 (taste over typing):** correctness passed review; now make it *feel right*.

**Skip entirely** for pure Apex / Flow / metadata backend changes. **Run** only when the changed files include a front-end surface (LWC, Aura, Experience Cloud, or a React / headless client on UI-API / GraphQL).

Run `/sf-polish` — it resolves the changed UI scope, detects the front-end stack (LWC / Aura / Experience Cloud LWR / React-headless) via its stack-profile registry, and applies the matching design + accessibility (WCAG A/AA) + copy lens, dispatching the right agents (`sf-lwc-accessibility-guardian`, `sf-aura-migration-advisor`, …) and `/slds2-uplift`. It verifies with accessibility Jest tests and before/after screenshots where a preview exists.

**Gate (Principle 1):** No WCAG A/AA violations and no obvious UX or copy defects on the changed surface. Polished UI re-enters Stage 7 (TEST).

***

## <span data-proof="authored" data-by="ai:claude">Stage 7: TEST</span>

<span data-proof="authored" data-by="ai:claude">Run comprehensive tests:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTA5LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
# Run all local tests with coverage
sf apex run test --test-level RunLocalTests --code-coverage --synchronous
```

1. <span data-proof="authored" data-by="ai:claude">Verify all tests pass.</span>
2. <span data-proof="authored" data-by="ai:claude">Verify code coverage ≥ 75% org-wide, ≥ 90% per class.</span>
3. <span data-proof="authored" data-by="ai:claude">Check for any test failures or coverage gaps.</span>

**<span data-proof="authored" data-by="ai:claude">Gate:</span>** <span data-proof="authored" data-by="ai:claude">All tests pass with required coverage. If tests fail, return to Stage 5.</span>

***

## <span data-proof="authored" data-by="ai:claude">Stage 8: DEPLOY (conditional)</span>

<span data-proof="authored" data-by="ai:claude">Based on</span> <span data-proof="authored" data-by="ai:claude">`$ARGUMENTS.deploy`:</span>

### <span data-proof="authored" data-by="ai:claude">deploy=none (default)</span>

<span data-proof="authored" data-by="ai:claude">Skip deployment. Report readiness.</span>

### <span data-proof="authored" data-by="ai:claude">deploy=scratch</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTYxLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf org create scratch --definition-file config/project-scratch-def.json --alias lfg-test
sf project deploy start --target-org lfg-test --test-level RunLocalTests
```

### <span data-proof="authored" data-by="ai:claude">deploy=sandbox</span>

1. <span data-proof="authored" data-by="ai:claude">Dispatch deployment verification:</span>

   * <span data-proof="authored" data-by="ai:claude">Task sf-deployment-verification-agent(changed_files)</span>
2. <span data-proof="authored" data-by="ai:claude">Validate deployment:</span>

   ```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NjAsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
   sf project deploy start --dry-run --test-level RunLocalTests
   ```
3. <span data-proof="authored" data-by="ai:claude">If validation passes and Go decision:</span>

   ```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTAsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
   sf project deploy start --test-level RunLocalTests
   ```

**<span data-proof="authored" data-by="ai:claude">Gate:</span>** <span data-proof="authored" data-by="ai:claude">Deployment succeeds with all tests passing.</span>

***

## <span data-proof="authored" data-by="ai:claude">Stage 9: COMPOUND</span>

<span data-proof="authored" data-by="ai:claude">After pipeline completes (regardless of deploy stage):</span>

1. <span data-proof="authored" data-by="ai:claude">Analyze what was built.</span>
2. <span data-proof="authored" data-by="ai:claude">Search for existing knowledge to avoid duplicates.</span>
3. <span data-proof="authored" data-by="ai:claude">Write solution documents to</span> <span data-proof="authored" data-by="ai:claude">`docs/solutions/`.</span>
4. <span data-proof="authored" data-by="ai:claude">Update relevant agents/skills with new patterns.</span>
5. <span data-proof="authored" data-by="ai:claude">Update CLAUDE.md with project context.</span>

***

## <span data-proof="authored" data-by="ai:claude">Abort Conditions</span>

The pipeline aborts and asks for human input if any of the following fire. These map to the principles in `PRINCIPLES.md` — they are not advisory.

* Plan has no clear acceptance criteria (Stage 1).

* Plan is missing a complete five-field Verification Strategy section, or any field is hand-waved (Stage 1, Principle 2).

* Spec flow analysis finds Critical gaps with no obvious fix (Stage 1).

* Independent verification (Stage 3.5) returns NO-GO on any System-Wide Test Check question and no human has overridden (Principle 3).

* Review fires any non-negotiable gate from `sf-review`: security regression, governor regression, test coverage regression, trigger context regression, or sharing regression (Stage 4, Principle 1).

* Tests fail after 2 resolve cycles (Stage 5-7 loop).

* Polish gate fails: an unresolved WCAG A/AA violation on a changed UI surface (Stage 6, Principle 1).

* Deployment validation fails (Stage 8).

* Agent confidence is low on a jagged-edge call — order of execution, mixed-DML, sharing recalculation, async-context governor — and no human has reviewed (Principle 3). When in doubt, abort and ask.

***

## <span data-proof="authored" data-by="ai:claude">Output</span>

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