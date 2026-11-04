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

* Before any git command in a worker or a verification step, unset `GIT_INTERNAL_SUPER_PREFIX` when it is set. Git before 2.41 lists it in `git rev-parse --local-env-vars`; newer git dropped it, so an inherited value still leaks into unit verification on old git. Do not pass a parent worktree's git environment into a worker.

* A unit whose completion is outside the repo has no git-derived done signal. Permission-set assignment, a Remote Site created only in Setup, a Named Credential secret, or a sharing rule activated in the org is done when `sf org`, `sf data query`, or the setup describe the plan named shows that state. A clean `git status` does not finish it. When the unit's whole signal is in the repo and the files already match the plan, do not re-implement them.

***

