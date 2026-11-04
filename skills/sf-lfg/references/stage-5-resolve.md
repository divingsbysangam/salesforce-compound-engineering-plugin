# Stage 5: RESOLVE

Read with `sf-lfg/SKILL.md`. Procedure lives here.

## Stage 5: RESOLVE
Fix any review findings:

1. Address Critical findings first, then High, then Medium.
2. For each fix:

   * Make the code change

   * Verify the fix doesn't introduce new issues

   * Commit with descriptive message
3. Re-run `sf-review` on changed files only (fast depth), from the host catalog path.
4. Findings that need a product, sharing-model, or design decision are not filed as tracker tickets. They go in the pull request body as `## Unapplied review findings`, one unchecked bullet each: `- [ ] <severity> — <file:line> — <title>`, plus the suggested fix on the next line when the review gave one. The pipeline is not done until that section is in the PR body, or the summary states that no PR will exist and lists the same bullets there.

**Gate:** Re-review returns no Critical or High findings. Residual product decisions may remain only as that checklist.

***

