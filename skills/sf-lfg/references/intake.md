# Intake

Read this before Stage 0. It chooses the route. The stage files still define their gates. A child skill's return ends that skill, not this turn. The next stage follows in the same session. Do not announce a handoff and stop.

## Routes, first match

Classify from the request and a short read of what it names. Take the first route that matches.

1. **Named plan.** The request asks to carry out a plan or brainstorm path. A requirements-only file goes through `sf-plan` first. An implementation-ready plan (acceptance criteria, tasks, and a five-field Verification Strategy) is the work source for Stage 3. A request that only mentions a plan while asking for something else (`explain this plan`, `review this plan`) follows what it asks for.
2. **Defect.** A concrete failure the request asks to fix: a failing test, a governor exception, wrong org behavior, with an issue id or a stack. Invoke `sf-debug`. Only a fix that landed is a work source, and Stages 4 onward run from that diff with no second implementation. A request for the diagnosis alone ends with `sf-debug`. Do not open a pull request for a diagnosis.
3. **Costly choice still open.** The change depends on a decision the user did not settle: trigger versus before-save Flow, a synchronous callout versus a platform event, a new custom object versus a standard one, `with sharing` versus a reasoned `without sharing`. Invoke `sf-plan`. It compares that choice before it picks (see `sf-plan/references/trace-before-choice.md`). A judgment with nothing to build ends with the comparison.
4. **Product shape unsettled.** More than one user-visible behavior is plausible. When a person can answer in this session, invoke `sf-plan mode:brainstorm` and continue only with what came back. When nobody can answer, `sf-plan` records the assumption and the pipeline continues.
5. **Not a code change.** Invoke the skill that owns the result, and stop. Explain or "I didn't follow" → `sf-debug mode:explain`. Review a diff → `sf-review`. Deploy or retrieve → `sf-deploy`. Commit, pull request, or review comments → `sf-ship`. A how-to → `sf-know`. Capture a lesson → `sf-compound`. Do not open a branch. Answering in that skill's place is not the route.
6. **Plan.** Everything else that changes the org. Stage 1 runs `sf-plan`.

When two routes seem to match, take the one that asks more of the evidence: brainstorm when a person is here and the product shape is open; debug when the report is a concrete failure that asks for a fix.

Narrate the chosen route in one line before the child runs, naming the request shape that decided it.

A stop pushes nothing that was not already pushed.
