---
title: "How to measure whether compounding actually works (method, and what it cannot show)"
date: 2026-09-15
category: best-practices
severity: medium
tags: ["compounding", "measurement", "eval", "docs-solutions", "methodology", "apex"]
status: active
---

# Measuring whether compounding works

The plugin's headline claim is that **each iteration is smarter than the last**,
because `docs/solutions/` accumulates learnings that later runs read. Until now
that claim carried no measurement of any kind. This records the method built to
test it, the reasoning behind each choice, and — stated up front — the fact that
**no numbers have been collected yet.**

## Status

| | |
| --- | --- |
| Method | built and self-tested offline (`tests/compounding/selftest.sh`, 30 checks) |
| Scorer | built and self-tested (`score.py --selftest`) |
| Tasks | 6 committed, every seed verified to start with real violations |
| **Numbers** | **not collected.** Needs ~12 live `claude -p` turns, well over an hour |

The numbers section below is deliberately empty rather than absent. An empty
section is a visible debt; a missing one reads as an oversight, and in six
months nobody will remember which it was.

## The design

Run the same Salesforce task twice, changing exactly one thing:

* **COLD** — a disposable clone with every file under `docs/solutions/` deleted
  except `README.md`.
* **PRIMED** — the same clone with the captured learnings intact.

Score both with the same deterministic ruler. Report `delta = cold - primed`.
Violations are counted, so **higher is worse** and **a positive delta means
priming helped**.

`README.md` is kept in both conditions on purpose: if the directory itself
vanished, the difference between conditions would include "the directory does
not exist", which a model can notice and reason about differently.

## Why the scored signal is static violations, and not the two obvious others

Three candidate signals. Only one survived.

### Rejected: number of sf-review findings

`sf-review` is **inside the system under test**. Using its finding count as the
score lets the thing being measured grade itself. Worse, the failure is
directional: a primed run has more learnings available to cite, so it produces
*more* findings — which would read as either "better" or "worse" depending
entirely on which way you decided to interpret it beforehand. That is not a
measurement.

It is still **collected** (`review_findings` in `score.json`) because the count
is interesting. It never enters the score.

### Rejected as unavailable: tests pass on first deploy

This is the signal a Salesforce developer would actually care about, and it
needs a scratch org. It is reported as `available: false` with a reason rather
than scored `0`. **A zero that means "not measured" reads as a pass**, and that
one substitution would quietly corrupt every result the harness ever produces.

### The score: static violations in the produced Apex

Deterministic, needs no org, no network, and no model. Re-runs to the same
answer on any machine. That reproducibility is the entire point — *a delta
nobody else can recompute is an anecdote.*

Fifteen rules, each grounded in one of this repo's own domain skills
(`governor-limits`, `security-guide`, `apex-patterns`, `test-factory`), so the
scorer and the plugin's advice cannot drift into disagreeing about what "good"
means. Rules are **not weighted**: a weighted score buries an unfalsifiable
judgement inside a number that looks objective, and any weighting that can flip
the sign is a weighting someone chose. Per-rule counts are printed so a reader
can apply their own weights and watch what that does.

## What a rule hit is and is not

Each rule is a lexical pattern over comment-stripped, string-stripped source.
There is no Apex parser. Consequences, stated rather than discovered later:

* A hit is **evidence** of a violation, not proof. `SOQL_IN_LOOP` cannot tell an
  unavoidable query from a careless one.
* A miss is **not** proof of absence. Dynamic SOQL, reflection, and query
  strings assembled far from execution all evade these rules.
* The rules are a **consistent ruler, not a correctness oracle.** They are
  applied identically to both conditions, which is what makes the *delta*
  meaningful even where an absolute count would not be.

Comment and string stripping happens before every rule, and that is
load-bearing rather than tidy: without it, a class documenting an anti-pattern
scores worse than one committing it, and the scorer would reward deleting
documentation.

## The three confounds, one of which is not controlled at all

1. **Model nondeterminism.** Two runs of one prompt differ. At one sample per
   cell a per-task delta is mostly noise; only the sign of the cross-task total
   carries weak signal. `--repeats N` helps and is still small-N.

2. **Small N.** Six tasks. Enough to notice a large effect, nowhere near enough
   to establish a small one. No confidence interval is printed, because
   computing one from six single samples would dress noise as statistics.

3. **The primed condition has more context, not only better context.** This is
   the real gap. A longer prompt changes behaviour by itself, and this design
   cannot separate "the learnings were useful" from "there was more to read". A
   proper control needs a **third condition primed with irrelevant documents of
   equal length**. It is not built. Any positive result from this harness is
   therefore consistent with two different explanations, and the harness cannot
   tell them apart.

## Guarding against the ways this could lie

The offline selftest exists because the expensive path will be run rarely and
its output trusted — nobody re-derives a number that took ninety minutes. Three
of its checks matter more than the rest:

* **A crashed cell is excluded, never scored.** A cell where the model produced
  nothing has zero violations in the most literal and most misleading sense.
  Scoring it would make a crash the best available result, and a run with
  several crashes would report a large positive delta *for the condition that
  failed more often.* This is the single most dangerous bug the harness could
  have, and it is tested directly.

* **A condition that did not take is flagged.** Each cell records how many
  learning files were actually on disk. A "cold" cell that still has learnings
  is the same condition as its pair, and the delta would be meaningless. The
  count is trusted over the label.

* **A negative result exits 0 and is stated plainly.** A non-zero exit on a
  negative delta would make the harness a gate on the hypothesis being true, and
  the first response to that is to stop running it.

## Numbers

**None collected yet.** To collect them:

```bash
tests/compounding/run-ab.sh --dry-run     # see the plan and cost first
tests/compounding/run-ab.sh               # ~12 live turns, well over an hour
tests/compounding/run-ab.sh --repeats 3   # 36 turns; better, still small-N
```

When a run completes, record here: the run id, the git HEAD, `repeats`, the
per-task table, the total, and the verdict **as printed** — including a null or
negative one. Then anyone can recheck it offline with no API key:

```bash
tests/compounding/run-ab.sh --score-only tests/compounding/results/<run-id>
```

### Expected outcome, written down before measuring

**The delta may well come back at or near zero**, for a reason that is not a
defect in the harness: the six tasks are all *textbook* anti-patterns, and the
model's base training already covers bulkification and CRUD/FLS well. If
priming helps anywhere, it should help most on repo-specific conventions, which
these tasks deliberately do not test.

Recording that prediction now is the point. A prediction written after seeing
the result is not a prediction, and the temptation to re-run selectively until
the sign turns positive is exactly what this note exists to make
uncomfortable.

## Related files

* `tests/compounding/README.md` — how to run it
* `tests/compounding/score.py` — the rules and the reasoning per signal
* `tests/compounding/report.py` — delta computation and the attached caveats
* `tests/compounding/selftest.sh` — the 30 offline checks
* `tests/compounding/tasks/` — the six tasks and their seeds
