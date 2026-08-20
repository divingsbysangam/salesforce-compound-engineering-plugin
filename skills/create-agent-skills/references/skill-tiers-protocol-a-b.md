# Skill tiers (Protocol A/B)

Read with `create-agent-skills/SKILL.md`. Procedure lives here.

## Skill tiers (Protocol A/B)
Skills are not uniform. Some enforce a hard, non-negotiable gate; some run a structured multi-step workflow with no hard stop; some are pure reference or single-action utilities. The rigor a skill owes its reader depends on which of these it is. Every skill declares its tier in frontmatter (`tier:`, added after `name:`), and each tier has a **mandatory set of sections**. This makes the rigor split intentional policy — the difference between a discipline-gate skill and a utility skill is a design decision recorded in frontmatter, not an accident of who wrote it.

### The three tiers

| Tier | What it is | Current examples |
| --- | --- | --- |
| `discipline-gate` | Enforces an Iron-Law-style, non-negotiable check — the agent must stop and satisfy explicit criteria before proceeding. | `sf-plan`, `sf-work`, `sf-review`, `sf-polish`, `sf-lfg`, `sf-debug` |
| `workflow` | A structured, multi-step process with no hard gate — it guides but does not block. | `sf-brainstorm`, `sf-deepen`, `sf-compound`, `sf-strategy` |
| `utility` | A reference or single-action skill — knowledge lookup or a discrete action, no multi-step discipline. | `sf-pr-description`, `sf-report-bug` |

### Mandatory sections per tier

**`discipline-gate`** — the highest-rigor tier. Must carry:

* A **named gate list** — each gate stated with explicit **abort/proceed criteria** (what condition blocks, what condition lets the agent continue).
* A **rationalization table** with **at least 5 rows** — each naming a real excuse an agent would use to skip the gate, paired with the rebuttal (see "Match the Form to the Failure" for why a bare prohibition is not enough).
* A **red-flags self-check** — the observable signals that the agent is about to bypass the gate.
* A **`Principles enforced`** header — naming which of `PRINCIPLES.md`'s seven the gate serves.

**`workflow`** — structured but not blocking. Must carry:

* **Numbered phases** — the steps in order.
* An **artifact file-path template** — where the skill's output lands (e.g. `docs/brainstorms/<slug>.md`).
* A **self-review checklist before handoff** — what the skill verifies about its own output before returning control.

**`utility`** — **exempt** from the gate, rationalization-table, and phase requirements. A utility skill keeps its **Salesforce-Angle bullets** (the domain-specific reference content that is its reason to exist) and needs nothing heavier. Do not bolt a gate onto a utility skill to satisfy this policy — if it genuinely needs a gate, it is not a utility skill.

### Rollout status

This unit lands the `discipline-gate` tier and the Protocol A/B policy itself: the six discipline-gate skills above carry `tier: discipline-gate`, and this section is the policy of record. **Full retroactive tiering of the rest of the catalog is a deliberate follow-up** — the ~60 skills are not all tiered yet, and that is by design, not oversight. When you add or substantially edit a skill, set its `tier` and satisfy that tier's mandatory sections; do not batch-tier the whole catalog as a side effect of unrelated work.

***

