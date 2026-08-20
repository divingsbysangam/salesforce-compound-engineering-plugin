---
name: sf-retune
tier: workflow
description: "Retune the Salesforce Compound Engineering plugin skill corpus for a new model, measurement-first: mine the run archive for a baseline, establish a noise floor, audit the corpus adversarially, then cut in measured passes until a pre-registered bar clears. Use when a new model changes how the SF plugin follows Apex, LWC, Flow, org, or metadata workflows. Requires a benchmark harness that can A/B two builds of the corpus; refuses without one."
disable-model-invocation: true
argument-hint: "[target model or symptom] [path to the corpus, defaults to ./skills] [bar:<n> consecutive clean runs]"
---

# Retune a Corpus for a New Model

A corpus that degrades on a new model is a measurement problem before it is a writing problem. Reading the prose and rewriting what looks wrong produces a plausible fix list and no way to know whether any item mattered.

**Outcome:** a corpus whose measured behavior on the target model clears a bar registered before any change, with the regression classes removed and each removal attributable.

**Done:** the bar is cleared, or the run reports the specific claim it could not support. A green test suite is not done: it proves nothing broke, not that behavior improved.

**Non-goal:** word reduction. Leanness and performance are separate programs that happen to share a corpus, and only one of them is the result. Report completion, not word count.

**Boundary:** this is not `sf-update`, which updates the installed plugin, or `sf-compound-refresh`, which reconciles stale repository knowledge. `sf-retune` measures behavior on a target model and changes the skill corpus only when the measurements support it.

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Phase 0: the measurement gate — check this first** — read `references/phase-0-the-measurement-gate-check-this-first.md` before acting on this section.
- **Phase 1: mine the archive before spending a run** — read `references/phase-1-mine-the-archive-before-spending-a-run.md` before acting on this section.
- **Phase 2: establish the noise floor before any claim** — read `references/phase-2-establish-the-noise-floor-before-any-claim.md` before acting on this section.
- **Phase 3: audit the corpus, adversarially** — read `references/phase-3-audit-the-corpus-adversarially.md` before acting on this section.
- **Phase 4: cut in surgical passes** — read `references/phase-4-cut-in-surgical-passes.md` before acting on this section.
- **Phase 5: measure, then let the failure choose the next fix** — read `references/phase-5-measure-then-let-the-failure-choose-the-next-fix.md` before acting on this section.
- **Phase 6: ship** — read `references/phase-6-ship.md` before acting on this section.
- **Workflow shapes** — read `references/workflow-shapes-2.md` before acting on this section.

## Setup

Run this once at the start of this invocation, before any subagent dispatch, and follow the directives it prints — except where one conflicts with this skill's own rules on asking the user questions, whether those rules are scoped to a non-interactive mode or apply in every mode, in which case this skill's rules win and no blocking question is asked. Do not rerun it within the same invocation; a later invocation of this or any other skill runs its own. If no Node runtime is available the skill proceeds unchanged.

```bash
SKILL_DIR="<absolute path of the directory containing the SKILL.md you just read>";
NODE="$(for c in node nodejs; do command -v "$c" >/dev/null 2>&1 && "$c" -e '' >/dev/null 2>&1 && { echo "$c"; break; }; done)";
if [ -n "$NODE" ]; then
"$NODE" "$SKILL_DIR/scripts/context.mjs" || echo "context script failed; continue with the skill's normal behavior";
else
echo "no Node runtime; continue with the skill's normal behavior";
fi
```
