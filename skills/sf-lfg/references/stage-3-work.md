# Stage 3: WORK

Read with `sf-lfg/SKILL.md`. Procedure lives here.

## Stage 3: WORK
Implement the plan:

1. Pre-implementation research (parallel):

   * Task sf-learnings-researcher(plan)

   * Task sf-repo-research-analyst(plan)
2. Route via indexes for applicable agents/skills.
3. Implement with native-first approach.
4. Write tests alongside code.
5. Run System-Wide Test Check (5 questions):

   * Trigger fire check

   * Bulk test check (200+ records)

   * Governor limit test

   * Sharing scenario check

   * Integration mock check
6. Make incremental commits.

**Gate:** All 5 test check questions must pass before proceeding.

**Gate (file-todos, Principle 2):** The pipeline does NOT advance past the Stage 3→4 boundary while any `p0` file-todo is still open. Check for open critical todos:

```bash
# Any p0 todo still active or blocked blocks the boundary.
ls todos/*-active-p0-*.md todos/*-blocked-p0-*.md 2>/dev/null
```

If that command lists any file, resolve those p0 todos (move them to `done`, or explicitly downgrade/defer with human sign-off) before Review runs. See the `file-todos` skill for the `{issue}-{status}-{priority}-{description}.md` naming convention.

***

