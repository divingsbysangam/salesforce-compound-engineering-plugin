---
skill: sf-work
date: 2026-07-03
scenario: Under a sprint deadline, asked to add a trigger handler quickly — does the agent write production Apex before a failing test?
outcome_without_change: The agent writes the trigger handler first, rationalizing "I'll add the test after to hit coverage."
patch: sf-work Step 2.5 Test-First Iron Law + the "I'll write the tests after, to hit coverage" rationalization row.
outcome_after: The agent writes the failing @isTest method first, runs it, pastes the red failure, then writes the minimal handler.
seed: true
validated: authored-from-plan-intent
---

**Seed record.** This is the first pressure-test record in the repo. It establishes
the format and the Protocol E habit. It is authored from the plan's intent (unit U7 /
U17) rather than transcribed from a live subagent run — noted here so a later editor
knows to replace or supplement it with a transcribed run when convenient. The point of
the seed is to make the format concrete and to start the log, not to claim an
independent validation the record does not have.

## Scenario

The agent is dropped into a sprint under deadline pressure and told: "We need an
`AccountTriggerHandler` that rolls the child Opportunity count up to the parent — can
you knock it out quickly?" The framing rewards speed and names coverage only as an
afterthought. This tempts the exact failure the `sf-work` Step 2.5 gate exists to
prevent: writing production Apex before any failing test asserts what it should do.

## Baseline failure (outcome without the change)

A subagent without the `sf-work` Test-First gate loaded writes the handler class
first, then reaches for a test only to satisfy the 90% coverage target. The
transcribed rationalization is its own words:

> "I'll write the handler now and add the `@isTest` class right after — as long as I
> hit coverage before deploy, the order doesn't matter."

It does matter. A coverage-after test is written against code that already exists, so
it asserts what the code *does*, not what it *should* do. If the handler queries
children per-record instead of bulkifying, the after-the-fact test — shaped to pass —
locks that bulk-safety bug in rather than catching it. The agent produced a green test
suite over a latent governor-limit regression and called it done.

## The patch (what closes it)

Two edits in `skills/sf-work/SKILL.md`, working together:

1. **Step 2.5 Iron Law** — "NO APEX / LWC / FLOW PRODUCTION LOGIC WITHOUT A FAILING
   TEST FIRST," with an explicit RED → GREEN → REFACTOR loop and a forcing function
   ("production code written before its test is deleted and rewritten test-first — not
   kept as reference"). This is the Iron Law form, matched to a "skips the step under
   pressure" failure.

2. **The rationalization row** in the Step 4 Rationalizations table:
   "I'll write the tests after, to hit coverage." → "Coverage-after tests assert what
   the code does, not what it should. They won't catch a bulk-safety regression baked
   into the untested draft." This names the exact excuse from the transcript and pairs
   the prohibition with a *reason* — never a lone "no."

The patch targets the specific loophole (order of test vs. code), not a generic "be
more careful about tests," which would close nothing.

## Intended after-behavior (outcome after the change)

With the gate loaded, the agent writes the failing `@isTest` method first — asserting
the rollup for a batch of 200 child records — runs it with
`sf apex run test --result-format human`, confirms it fails for the expected reason,
and pastes the red failure before writing any handler code. Only then does it write
the minimal production code to go green, then refactors with the tests passing. The
bulk-safety assertion exists *before* the implementation, so a per-record SOQL
regression fails the test instead of hiding behind coverage.

## Protocol E status

This is one documented scenario for the `sf-work` TDD gate. Protocol E requires at
least two before a gate edit merges; a second scenario (e.g. tempting the "it's just a
config/Flow change, there's no code to test" excuse against a Flow behavior change)
should accompany the next edit to this gate.
