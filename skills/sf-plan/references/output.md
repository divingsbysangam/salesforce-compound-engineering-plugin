# Output

Read with `sf-plan/SKILL.md`. Procedure lives here.

## Output
Save plan under `docs/plans/` with format:
`docs/plans/YYYY-MM-DD-<type>-<feature-slug>-plan.md`

Reserve that path with an exclusive create. If it already exists, append the smallest numeric suffix (`-2`, `-3`) before the extension. Do not overwrite a plan.

Include:

* `spec.md` section (business requirements, acceptance criteria, constraints). When `PRODUCT.md` or `VISION.md` exists at the repo root, read it with `STRATEGY.md` and flag a choice that lands inside a stated non-goal.

* **Objective and means.** The objective is the outcome: what is true afterwards, still true if the implementation changed. The chosen approach is the means, its own line, and only when the request or the plan has fixed one. Do not invent a means for outcome-only work. If the request supplies only an approach ("move this lookup out of the trigger into a before-save flow"), that line is the means; the objective is the outcome it serves.

* **Problem frame** stays backward-looking. It does not restate the proposal. Give it paragraphs when motivation is not obvious; keep it short when a brainstorm or strategy doc already settled it.

* **Product choices** (scope cuts, defaults chosen against a real alternative) are a short index: the decision, one line of why, and which requirements it governs. Normative text stays on the requirements. Skip the index when no such choice exists.

* `plan.md` section (components, architecture, design decisions, limits, security)
  verification.md section (the five-field Verification Strategy from Step 5 — mandatory, Principle 2)

* `tasks.md` section (implementation, testing, deployment checklist). Each unit has an id (`U1`, `U2`) that commit subjects can cite.

***

