# sf-ship mode:pr

Atomic flow: commit (using `sf-ship mode:commit` conventions) → push → open or update a PR (using `sf-ship mode:pr-description`) → hand off to babysit when appropriate.

<feature_description>
#$ARGUMENTS
</feature_description>

## Salesforce Angle

- PR description includes deploy plan, test plan, and Salesforce-specific risk callouts (see `../pr-description/guide.md`).
- Push refuses force-push to main/master without explicit user confirmation.
- **Project publishing gate.** Before `git push`, satisfy every pre-push or review-ready requirement the project's instructions already name for the paths in this commit (active instructions in context, a package script, a git hook). The evidence has to be for this commit, not an earlier tree. If a requirement is missing or failing, stop before the push and name it. When the project names no gate, Salesforce source still passes `/sf-deploy mode:validate` or the project's CI equivalent.
- Include `isDraft` when listing open PRs so draft babysit handoff can be skipped correctly.

## Interaction Method

When asking the user a question, use the host's blocking question tool already in the current tool list (match by capability, not by a host-specific name). Presence in that list is proof the tool exists; never call a question tool to discover it. Fall back to numbered options in chat when no blocking tool is available. Ask one question at a time.

## Procedure

1. **Commit** — follow `../commit/guide.md` (named-file staging, logical commits, outcome-focused messages).
2. **Push** the feature branch with ordinary `git push -u` (never force-push protected branches). Apply the project publishing gate in the Salesforce Angle section immediately before the push, on the commit you are sending. Re-apply it if a later docs commit lands in the same run.
3. **Open or update the PR** — compose title/body via `../pr-description/guide.md`. When listing existing PRs, request `isDraft` in the JSON fields. Re-check for an existing PR immediately before `gh pr create` to avoid duplicates. When review left findings this run did not apply, render them verbatim as `## Unapplied review findings`: one `- [ ] <severity> — <file:line> — <title>` bullet each, with the suggested fix on the following line when present. Do not open a tracker ticket for those residuals. The opening still states what is now different for someone using this, not the files the diff touched.
4. **Babysit handoff — default on; completion gate.** In interactive full workflow, after reporting a newly-created PR URL (or after new commits land on an existing open PR), this run is **not done** until `sf-ship mode:babysit` owns follow-on for that PR — or an explicit skip below applies. Reporting the PR URL alone is not success. Declining a description rewrite on an existing PR skips the rewrite and still reaches this gate.
   - **Standing opt-out, read here.** Read `auto_babysit` at this handoff, not from an earlier config pass. Ordinary keys: `<repo-root>/.compound-engineering/config.local.yaml`, then `config.yaml`. The first active value wins. An empty scalar is unset. Only the exact boolean `false` opts out. A missing key leaves the default on. That skip is a successful end of this run: report the PR URL and one line that the standing opt-out skipped the watch. A `babysit:` token on this invocation wins over the file.
   - **Auto-hand off by default:** announce in one non-blocking line (e.g. "Babysitting toward merge-ready — pass `babysit:off` to skip"), then invoke `sf-ship mode:babysit` through the host's normal skill-invocation mechanism with the PR URL — never ask yes/no. Load its instructions and stay with the watch until its stop condition. "Started" is not success when this session is the one running the watch.
   - **Success** = babysit owns the monitoring lifecycle for that PR (its stop condition, or an explicit skip). In `mode:pipeline`, wait for the bounded result.
   - **Never substitute** a narrower watch: `gh pr checks --watch`, ad-hoc poll loops, reconstructing babysit from memory, or "I'll babysit later" do not count. Never start babysit mechanics yourself (`pr-snapshot`, arming a watcher).
   - **Handoff blocked:** if babysit cannot be loaded or started, stop and report blocked (name the failure). Do not invent a parallel or narrower watch.
   - *Off is the explicit choice:* `babysit:off` skips this run even when config leaves the watch on. `babysit:continuous` / `babysit:checkpoint` force that watch mode even when `auto_babysit` is false. With no token, the resolved `auto_babysit` value decides. `sf-lfg`'s bounded pipeline watch is not this opt-out; it still runs so the pipeline can report that checks are decided.
5. **Do not fire babysit (auto-detected):** `mode:pipeline` (orchestrator owns follow-on), description-only / description-update modes, no PR created or updated this run, non-GitHub, **the PR this run created or updated is a draft** (announce skip in one line; an explicit `babysit:continuous` / `babysit:checkpoint` token still forces the watch — when forcing on a draft, pass the corresponding watch mode so babysit's draft boundary arms), or a head branch you cannot push to.
6. **Soft-degrade (after successful handoff only):** babysit decides whether checkpoint applies and owns the resume line. Checkpoint is not a substitute for a failed handoff.

## Related

- Description framing: `../pr-description/guide.md`
- Watch loop: `../babysit/guide.md`

## Named parent

When the user names a parent pull request or branch to stack on, root the new work there. Classify by pull request number when one exists. Record the work branch and its tip before any checkout, and return to them before building the layer. An unproven parent is a stop, not a guess: do not open a second stack beside the one the user named. A request that names a stack is the request; do not reread it as a single pull request with a custom base.
