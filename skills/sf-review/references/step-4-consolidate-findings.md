# Step 4: Consolidate Findings

Read with `sf-review/SKILL.md`. Procedure lives here.

## Step 4: Consolidate Findings
Collect results from all dispatched agents and:

1. Deduplicate findings across agents using the merge/dedup rule in `subagent-confidence-rubric.md` (same `file:line` + same root cause → merge; conflicting severity → take the higher).
2. Attach a confidence tier (High / Medium / Low) to every finding per `subagent-confidence-rubric.md`. Same-model lenses agreeing does not raise the tier. A different-model pass raises it only when that pass records it was independent.
3. Categorize by severity: Critical, High, Medium, Low.
4. Group by file for easy navigation.
5. Include fix suggestions with code references.
6. Keep a finding whose on-disk lens artifact quotes the line, even when the compact return omitted the quote. Copy the quote from the artifact. Do not drop the finding for a missing quote the file already has.
7. Do not reject a gate finding (security, sharing, governor limit, trigger context, test coverage) without evidence you checked against the reviewed revision: a quoted line with file and line, a doc that names the API version in force, or a test result that names this revision and the assertion. "No evidence found" is not a rejection. An uncited rejection stays in the report as unresolved, and the verdict stays not ready while a Critical or High gate is unresolved.
8. Finish this consolidation from the returned lines and any on-disk lens files. If the dispatch turn is long, re-read those artifacts. Do not reconstruct findings from memory of the launch.

***

