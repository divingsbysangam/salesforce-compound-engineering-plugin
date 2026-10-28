---
name: sf-ship
description: "Commit, open or describe a PR, judge review feedback, or watch a PR until it looks mergeable. Use for 'open a PR' or 'babysit this PR'. Use sf-review before feedback exists."
argument-hint: "mode:<commit|pr|pr-description|resolve-feedback|babysit|release-notes|clean-branches> [PR number or scope] [posture:target|stack-ready|stack-land]"
---

# /sf-ship

> **Principles enforced:** 2 (verifiability), 5 (taste and oversight). See `PRINCIPLES.md`.

## Modes

First argument `mode:<name>` selects a mode; everything after it passes to that mode's guide. If absent, infer from the request ("commit" → `commit`, "open a PR" → `pr`). Load only the guide for the chosen mode.

| Mode | Use for | Guide |
|---|---|---|
| `commit` | Conventional commit for the current change | `references/commit/guide.md` |
| `pr` | Commit, push, and open a PR | `references/pr/guide.md` |
| `pr-description` | Write or refresh a PR description | `references/pr-description/guide.md` |
| `resolve-feedback` | Evaluate and fix PR review comments | `references/resolve-feedback/guide.md` |
| `babysit` | Watch a PR: CI, reviews, conflicts, until mergeable | `references/babysit/guide.md` |
| `release-notes` | Release notes from PRs and commits | `references/release-notes/guide.md` |
| `clean-branches` | Delete local branches whose remote is gone | `references/clean-branches/guide.md` |

## Rules for every mode

- Never push to a protected branch, force-push someone else's branch, or skip hooks.
- Before pushing Salesforce source, the change must pass `/sf-deploy mode:validate` or the project's CI equivalent.
- Keep commit and PR text about the value delivered, not the steps taken.
