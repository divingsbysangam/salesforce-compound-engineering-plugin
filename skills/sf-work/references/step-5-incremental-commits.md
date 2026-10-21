# Step 5: Incremental Commits

Read with `sf-work/SKILL.md`. Procedure lives here.

## Step 5: Incremental Commits
Make small, focused commits as you go:

* One commit per logical unit of work

* Clear commit messages describing the change. When the plan names a unit id, append it: `fix(apex): bulk-safe owner reassignment (U3)`.

* Don't batch all changes into one commit

* Stage named paths, then pass those same paths to `git commit --`. A bare `git commit` takes the whole index, so work the user had already staged would ride along.

* Leave paths that were dirty before this run out of the commit. If a unit must edit one of those files, ask once before including the user's edits.

* An implementation subagent does not commit. The orchestrator stages, commits, and runs the authoritative tests. A worker must not write the git index of a linked worktree; that index is shared with the parent checkout.

***

