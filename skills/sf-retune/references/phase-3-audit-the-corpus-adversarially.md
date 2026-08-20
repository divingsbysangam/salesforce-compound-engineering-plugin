# Phase 3: audit the corpus, adversarially

Read with `sf-retune/SKILL.md`. Procedure lives here.

## Phase 3: audit the corpus, adversarially
One agent per skill, each reading that skill's full directory, proposing cuts with a target and a reason. Then a second agent per skill whose job is the opposite: **defend the existing prose** using the project's own documented learnings, its tests, and git history.

Read `references/corpus-audit.md` for the dispatch shape, the finding schema, and the classes worth hunting.

**These two passes require independent contexts.** The defense is only worth running when it can genuinely disagree with the proposal, which one context arguing both sides cannot do. If the host exposes no way to run them as separate agents, report that as a blocker and stop the audit — do not run proposal and defense inline and present the result as an audit.

Two rules make the difference between an audit and a demolition:

- **A cut with no provenance found after a real search is a confident cut. A cut the defender saves with a citation is off the list.** Do not relitigate a defended keep.
- **Absence of evidence is weaker than the project's own standard for a change.** Where the guidance requires a reproduced failure or an exact failing path, a search that found nothing is a verification task, not a change. Say which of your cuts rest on that weaker basis.

Expect the audit to contradict the premise you started with. That is its value.

