# Content quality — pressure-testing discipline-gate skills

Read with `create-agent-skills/SKILL.md`. Procedure lives here.

## Content quality — pressure-testing discipline-gate skills
The sections above make a skill *structurally* correct. They do not make it *hold under pressure*. A `discipline-gate`-tier skill (a skill that tells an agent to stop and do something before proceeding — see Protocol A tiering) is only as good as its weakest rationalization: if an agent under deadline can talk itself out of the gate, the gate is decorative. Treat these skills as prose that must be stress-tested before merge, not templates to stamp out.

### Bulletproofing recipe — RED / GREEN / REFACTOR for prose

For any **new or edited** `discipline-gate`-tier skill, before merge:

1. **RED — write a failing test.** Run 2–3 pressure scenarios against a subagent that does **not** have the skill loaded. Frame each scenario to tempt the exact failure the gate exists to prevent — e.g. *"Under a sprint deadline, with a governor-limit-risky trigger change, does the agent skip filling in the Verification Strategy field?"* or *"does it write the Apex before the test?"* A scenario that the baseline agent passes tells you nothing; pick ones it plausibly fails.
2. **Transcribe the rationalization.** Capture the *actual* excuse the agent used — its own words ("the change is trivial, so a test would be ceremony"), not a paraphrase. The wording is the target.
3. **REFACTOR — patch the loophole, not the prose.** Edit the skill to close *exactly* that rationalization (see "Match the Form to the Failure" for choosing the form). Resist a generic rewrite; a broad "be more careful" edit closes nothing and dilutes the gate.
4. **GREEN — re-test with the patched skill.** Run the same scenarios with the skill loaded until the loophole is closed. If the agent finds a new excuse, that is a new RED — repeat.

Record the scenarios and outcomes. This log feeds Protocol E and lands in `docs/pressure-tests/` — see that directory's README for the record format, and `CONTRIBUTING.md` for **Protocol E** (at least two documented pressure scenarios before a discipline-gate change merges) and **Protocol G** (an eval-harness run for any gate-wording edit). The log lets the next editor see which rationalizations the gate already defends against and avoid reopening them.

### Match the Form to the Failure

A patch only works if its *form* matches the failure it targets. Classify the baseline failure, then reach for the matching form of guidance:

| Failure mode | Right form of guidance |
| --- | --- |
| Agent skips the step under pressure | An Iron Law + a rationalization table naming the excuse |
| Agent complies but produces the wrong shape | A worked example / template of the correct output |
| Agent omits a required element | An explicit checklist of required elements |
| Behavior should be conditional | A decision rule ("when X, do Y; otherwise skip") |

**A bare prohibition can backfire.** A naked "don't do X" can *increase* X — it plants the action without giving the agent anywhere else to go. This is why the workflow gates pair every prohibition with a **reason** and an **alternative** ("don't write the Apex first — you can't tell a passing test from a vacuous one, so write the failing test, watch it fail, then implement"), never a lone "no."

### SDO — Skill Discovery Optimization

A skill's `description` frontmatter states only the **trigger condition** — *when* to use the skill ("Use when reviewing a trigger change that touches DML in a loop…") — and **never** the skill's internal step count or workflow shape. Do not write "5-step check," "quick checklist," "runs N phases," or anything that leaks how much work the gate is.

Why: an agent reads the `description` to decide whether to load the skill, and it anchors on what it reads there. If the description says "5-step check," the agent may compress the whole gate to "checking tests" and skip most of it *before it ever opens the body* — the shape leaked into discovery becomes the shape the agent performs. Keep the description about the trigger; let the body carry the process.

The CLI lint (unit U16, `cli/src/lint/description-sdo.ts`) enforces this mechanically — it flags step-count and workflow-shape phrasing in `description` fields, so a leak fails the check rather than merging.

***

