# sf-ship mode:commit

Create well-crafted local commit(s) from the current working tree. No push, no PR — use `sf-ship mode:pr` for the full ship flow.

**Done when:** each logical change is committed with an explicit file list and a message that states the outcome, and `git status` is clean of those changes. **Stop when:** the tree is clean (nothing to commit).

## Salesforce Angle

- Type/scope examples: `feat(apex):`, `fix(lwc):`, `feat(flow):`, `chore(metadata):`, `feat(integration):`, `fix(data):`, `chore(permset):`, `chore(profile):`.
- Stage only files relevant to this logical Salesforce unit (never `git add -A` / `git add .` — unrelated metadata is easy to pick up).
- Do not include attribution footers in incremental commits — only on the final ship commit when the project asks for one.

## Context

Gather context with each command as its **own** shell tool call (program + args only). Do **not** join with `;`, `&&`, `||`, pipes, `$(...)`, or redirects — that syntax fails under Windows PowerShell. A non-zero exit is a normal state to interpret, not a failure to suppress.

| Command | Purpose | Non-zero / empty means |
| --- | --- | --- |
| `git status` | Working-tree state | Not a git repo — stop |
| `git diff HEAD` | Uncommitted changes | Unborn repo / no commits yet |
| `git branch --show-current` | Current branch | Empty = detached HEAD |
| `git log --oneline -10` | Recent message style | Unborn repo — no history |
| `git rev-parse --abbrev-ref origin/HEAD` | Remote default branch | No `origin/HEAD` — try `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'`, else `main` |

Treat this as a snapshot. Re-read branch and staged set immediately before committing if anything may have changed.

**Default branch name:** strip a leading `origin/` from `origin/HEAD` (so `origin/trunk` → `trunk`). Use that bare name for all “on the default branch?” checks — never compare against `origin/<name>`.

## Workflow

0. **Gather** — run every Context command above (own shell call each), then continue.

1. **Nothing to commit** — if `git status` shows no staged, modified, or untracked files, report that and stop. Do not use `git diff HEAD` alone as cleanliness (it misses untracked files).

2. **Branch first** — if detached HEAD, or on the default branch (`main` / `master` / the bare default name above), create a feature branch from the change content (`git checkout -b <name>`), then re-read `git branch --show-current`. Do not ask — commit-only still must not leave work only on a detached HEAD or the default branch. If the derived name exists, pick a non-conflicting suffix.

3. **Convention** — match project commit conventions already in context; else match the recent log pattern; else conventional commits (`type(scope): description`). When using conventional commits and `fix`/`feat` both fit, default to `fix:` (remedying broken or missing behavior); reserve `feat:` for new capabilities. User override wins.

4. **Logical commits** — if changed files clearly split into distinct concerns (e.g. Apex handler vs permission set vs LWC), make separate commits (file level only, 2–3 max, no `git add -p`). If ambiguous, one commit.

5. **Message** — subject is imperative and names the outcome (what is now possible or fixed), not the file list. Body only when motivation or trade-offs are not obvious from the subject.

   - Bad: `Update AccountTriggerHandler.cls` / `Add tests and fix stuff`
   - Good: `fix(apex): bulk-safe Account owner reassignment (U3)` when the plan names unit U3. Omit the unit id when none is known.

   Honor `exclude:<paths>` when the caller passes it: those files stay uncommitted no matter what else changed, and the report names them. Pass the staged paths on `git commit --` as well, so a bare commit cannot take the whole index.

6. **Stage and commit** — stage **named files only**. Prefer one shell call per commit group:

```bash
git add force-app/main/default/classes/Foo.cls force-app/main/default/classes/FooTest.cls && git commit -m "$(cat <<'EOF'
fix(apex): subject line here

Optional body when the why is not obvious from the subject.
EOF
)"
```

7. **Confirm** — `git status`; report hash(es) and subject(s).

## Related

- Full ship flow: `sf-ship mode:pr`
- Plugin conventions: see `CLAUDE.md`
