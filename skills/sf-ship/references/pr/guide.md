# sf-ship mode:pr

Atomic flow: commit (using `sf-ship mode:commit` conventions) → push → open or update a PR (using `sf-ship mode:pr-description`) → hand off to babysit when appropriate.

<feature_description>
#$ARGUMENTS
</feature_description>

## Salesforce Angle

- PR description includes deploy plan, test plan, and Salesforce-specific risk callouts (see `../pr-description/guide.md`).
- Push refuses force-push to main/master without explicit user confirmation.
- Before pushing Salesforce source, the change must pass `/sf-deploy mode:validate` or the project's CI equivalent.
- Include `isDraft` when listing open PRs so draft babysit handoff can be skipped correctly.

## Interaction Method

When asking the user a question, use the platform's blocking question tool (`AskUserQuestion` in Claude Code, `request_user_input` in Codex, `ask_user` in Gemini). Fall back to numbered options in chat when no blocking tool is available. Ask one question at a time.

## Procedure

1. **Commit** — follow `../commit/guide.md` (named-file staging, logical commits, outcome-focused messages).
2. **Push** the feature branch with ordinary `git push -u` (never force-push protected branches).
3. **Open or update the PR** — compose title/body via `../pr-description/guide.md`. When listing existing PRs, request `isDraft` in the JSON fields. Re-check for an existing PR immediately before `gh pr create` to avoid duplicates.
4. **Babysit handoff — default on; completion gate.** In interactive full workflow, after reporting a newly-created PR URL (or after new commits land on an existing open PR), this run is **not done** until `sf-ship mode:babysit` owns follow-on for that PR — or an explicit skip below applies. Reporting the PR URL alone is not success.
   - **Auto-hand off by default:** announce in one non-blocking line (e.g. "Babysitting toward merge-ready — pass `babysit:off` to skip"), then invoke `sf-ship mode:babysit` through the host's normal skill-invocation mechanism with the PR URL — never ask yes/no.
   - **Success** = babysit has started on that PR (its own bootstrap/watch path).
   - **Never substitute** a narrower watch: `gh pr checks --watch`, ad-hoc poll loops, reconstructing babysit from memory, or "I'll babysit later" do not count. Never start babysit mechanics yourself (`pr-snapshot`, arming a watcher).
   - **Handoff blocked:** if babysit cannot be loaded or started, stop and report blocked (name the failure). Do not invent a parallel or narrower watch.
   - *Off is the explicit choice:* `babysit:off` skips this run; `babysit:continuous` / `babysit:checkpoint` forces that watch mode.
5. **Do not fire babysit (auto-detected):** `mode:pipeline` (orchestrator owns follow-on), description-only / description-update modes, no PR created or updated this run, non-GitHub, **the PR this run created or updated is a draft** (announce skip in one line; an explicit `babysit:continuous` / `babysit:checkpoint` token still forces the watch — when forcing on a draft, pass the corresponding watch mode so babysit's draft boundary arms), or a head branch you cannot push to.
6. **Soft-degrade (after successful handoff only):** once babysit owns the PR, a checkpoint-only harness runs one tick and prints the resume command instead of a live loop. Soft-degrade is not a substitute for a failed handoff.

## Related

- Description framing: `../pr-description/guide.md`
- Watch loop: `../babysit/guide.md`
