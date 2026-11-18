# Review Depth Levels

Read with `sf-review/SKILL.md`. Procedure lives here.

## Review Depth Levels

Run `python3 skills/sf-review/scripts/executable-lines.py` on `git diff --numstat` for the reviewed range before choosing a depth. The script reports facts. It never awards `fast`.

Apply the first row that matches.

| Fact | Depth |
|---|---|
| `hard_block`, or `full_floor` without `ci_only` | `comprehensive`. A floor cannot be talked down. `hard_block` means Flow, object, permission, profile, or sharing metadata changed, or a file the script could not classify. `full_floor` is also set when `size_band` is `large`: 200 or more non-test executable lines, or 400 or more changed lines of any kind. |
| `ci_only` | Review those workflow files only, including when the file is long: what the job gates (deploy validate, test level, org alias, secrets in the file). Do not dispatch Apex, LWC, or Flow lenses. |
| neither | Line count decides nothing. Read the diff and judge where a wrong version would fail. |

**Where a wrong change fails**

- **Loud and local** — a label, comment, rename, or assertion message whose failure shows up at that line. Depth is `fast`: the lenses for the file classes present, and skip `tests` when no logic changed.
- **Silent** — sharing, CRUD/FLS, SOQL or DML in a loop, a callout, trigger order, `@AuraEnabled`, or a public entry. The failure shows up somewhere else, or not as an error at the change. Depth is `thorough`.
- **Auth, money, or a public contract** — `without sharing` on an entry point, a guest-user path, a payment or billing field, `@RestResource`, `global`, or a managed-package boundary. Depth is `comprehensive` even when the diff is small.
- **Unsure** — `thorough`. Do not pick `fast` because the diff is short.

`depth:fast` does not override `full_floor`, `hard_block`, a silent failure, or `ci_only`. `depth:comprehensive` forces `comprehensive`. The summary names the depth and the one fact that chose it.

An empty diff is not a small code change. Say there was nothing to review.
