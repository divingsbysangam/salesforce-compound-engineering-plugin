# Step 4: Consolidate Findings

Read with `sf-review/SKILL.md`. Procedure lives here.

## Step 4: Consolidate Findings
Collect results from all dispatched agents and:

1. Deduplicate findings across agents using the merge/dedup rule in `references/subagent-confidence-rubric.md` (same `file:line` + same root cause → merge; conflicting severity → take the higher).
2. Attach a confidence tier (High / Medium / Low) to every finding per the tiers in `references/subagent-confidence-rubric.md`; a finding confirmed by a second agent upgrades to High.
3. Categorize by severity: Critical, High, Medium, Low.
4. Group by file for easy navigation.
5. Include fix suggestions with code references.

***

