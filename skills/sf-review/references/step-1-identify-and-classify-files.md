# Step 1: Identify and Classify Files

Read with `sf-review/SKILL.md`. Procedure lives here.

## Step 1: Identify and Classify Files
1. Get files in scope (git diff, directory listing, or PR files). When the target is a pull request, read `headRefName` and `headRefOid` with `gh pr view`, then `git fetch --no-tags origin <headRefName>:refs/review/pr-<n>-head`. Trust that ref only when `git rev-parse refs/review/pr-<n>-head` equals `headRefOid`. A same-named branch on `origin` can satisfy the fetch for a fork, and the PR can move between the two calls. When the fetch fails or the OID differs, review the diff hunks only and say which in the summary.
2. Classify each file by type:

   * `.cls`, `.trigger` → APEX

   * `.flow-meta.xml` → AUTOMATION

   * `.js`, `.html` (in `lwc/`) → LWC

   * `.xml` (metadata) → ARCHITECTURE

   * Callout/API related → INTEGRATION

***

