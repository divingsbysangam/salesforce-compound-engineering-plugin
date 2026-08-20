# Stage 0: IDEATE & BRAINSTORM (the front "bread" — human-led, conditional)

Read with `sf-lfg/SKILL.md`. Procedure lives here.

## Stage 0: IDEATE & BRAINSTORM (the front "bread" — human-led, conditional)
> **Principle 5 (taste over typing) and Principle 3 (stay in the loop):** *what to build* is a human call, not an autonomous one.

**Skip** when `$ARGUMENTS.feature` is already a concrete feature description or a plan-file path. **Run** when the input is vague (e.g. "improve our case management") or the user wants to decide *what is worth building* before committing the autonomous middle.

1. If a `STRATEGY.md` exists at the repo root, read it first and ground ideation in its target problem, users, and metrics.
2. If the direction is unclear, run `/sf-ideate` to generate and critically evaluate grounded Salesforce options; surface them to the human and let them pick.
3. Once a direction is chosen, run `/sf-brainstorm` (if the requirements aren't already clear) to shape scope and edge cases, writing to `docs/brainstorms/`.

**Gate (Principle 3):** A human confirms the direction before the autonomous middle runs. In fully autonomous mode with a concrete feature supplied, this stage is a no-op and the pipeline starts at Stage 1.

***

