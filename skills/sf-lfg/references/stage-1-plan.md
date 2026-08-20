# Stage 1: PLAN

Read with `sf-lfg/SKILL.md`. Procedure lives here.

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

