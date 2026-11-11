---
name: subagent-confidence-rubric
description: Shared confidence scale and merge/dedup rule that review and research personas reference when assigning confidence to a finding and when consolidating findings across subagents.
---

# Subagent Confidence Rubric

This is the shared rubric that review and research personas reference when assigning a confidence level to a finding. Every finding a persona reports carries one of the three tiers below, so the dispatching skill (`sf-review`, `sf-review mode:doc`, `sf-plan`, `sf-lfg`) can consolidate results from parallel subagents deterministically. Anchor confidence to evidence strength, not to how strongly you feel about the finding.

## Confidence tiers

* **High** — a single lens backed by reproducible evidence (a failing assertion, a governor-limit calculation that overflows, a `System.runAs` repro, a concrete SOQL/DML count against the limit, or an equivalent runnable proof), OR the same finding from a second pass on a different model whose return says the pass was independent. Lenses in one review share a model. Their agreement is recorded and does not by itself raise this tier. *Report it as a firm finding; lead with the evidence.*

* **Medium** — single-persona judgment with clear reasoning but no independent confirmation and no runnable proof. The logic holds up, but nothing has reproduced it yet. *Report it as a finding with the reasoning stated; flag that it is unconfirmed.*

* **Low / Speculative** — plausible but unverified: pattern-matched, inferred from convention, or dependent on assumptions you could not confirm. *Report it as a flag to investigate, not a defect; state the assumption it rests on.*

## Merge / dedup rule

When consolidating findings from multiple subagents:

* **Same** **`file:line`AND same root cause → merge into one finding.** Keep the clearest description; drop the duplicate.

* **Same location but different root cause → keep separate.** Two distinct problems at one line are two findings.

* **Conflicting severity on a merged finding → take the higher severity.**

* **Agreement raises confidence only with a verified different-model pass.** Same-model lenses record agreement and keep the higher severity. They do not promote the tier. A different-model pass promotes only when its return says the pass was independent of this review. Peer findings do not gain permission to edit the tree.