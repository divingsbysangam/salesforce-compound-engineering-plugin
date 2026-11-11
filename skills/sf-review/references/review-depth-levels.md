# Review Depth Levels

Read with `sf-review/SKILL.md`. Procedure lives here.

## Review Depth Levels
Select depth based on `$ARGUMENTS.depth` (default: thorough):

| Level | Lenses | Use case |
|---|---|---|
| **fast** | Lenses for the file classes present | Small code-only changes. Run `python3 skills/sf-review/scripts/executable-lines.py` on `git diff --numstat` for the reviewed range. `lite_eligible` must be true: 1–39 executable lines in `.cls`, `.trigger`, `.js`, `.mjs`, `.cjs`, `.page`, `.component`, or `.cmp`, and no uncounted file. Companion `*-meta.xml` beside those sources is ignored. Flow, object, permission, profile, and sharing metadata are uncounted, so they stay on thorough. |
| **thorough** | All applicable lenses (see Step 2) | Standard review (default) |
| **comprehensive** | All + `architecture` + research + deployment verification | Pre-production, risky changes |

***

