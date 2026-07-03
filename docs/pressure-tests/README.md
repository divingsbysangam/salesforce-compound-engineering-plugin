# Pressure-test records

This directory holds **pressure-test records** — documented scenarios run against a
discipline-gate skill to prove the gate holds when an agent is tempted to skip it.

A discipline-gate skill (see Protocol A tiering in `create-agent-skills`) tells an
agent to stop and do something before proceeding — write a failing test first, fill
in a Verification Strategy, clear the Non-Negotiable Gates. Such a gate is only as
strong as its weakest rationalization: if an agent under deadline can talk itself out
of the gate, the gate is decorative. A pressure-test record captures one scenario that
tempts the exact failure the gate exists to prevent, the excuse the baseline agent
used, the patch that closed it, and the intended after-behavior. The record is the
institutional memory of which rationalizations the gate already defends against, so a
later editor does not reopen a loophole that was already closed.

## Record format

Each record is a markdown file named `YYYY-MM-DD-<skill>-<slug>.md` with simple YAML
frontmatter followed by prose. This directory is **not** validated against the repo's
`schema.yaml` — that schema governs `docs/solutions/` only — so the frontmatter is
free-form YAML:

```yaml
---
skill: sf-work
date: 2026-07-03
scenario: One-line description of the tempting situation.
outcome_without_change: What the baseline agent does before the patch (the failure).
patch: The skill edit that closes the loophole.
outcome_after: The behavior the patched skill should produce.
---
```

After the frontmatter, write prose that expands each field: the full scenario, the
transcribed rationalization (the agent's own words, not a paraphrase), why the patch
targets that exact excuse, and how the after-behavior was confirmed (a live subagent
run, or — for a seed record — that it is authored from the plan's intent).

## When to add one — Protocol E

**Protocol E:** no discipline-gate-tier skill or persona ships or is edited without
**at least two** documented pressure scenarios recorded here first. Adding a gate, or
editing a gate's wording, means adding (or updating) the pressure-test records that
prove the gate still holds. See `CONTRIBUTING.md` for Protocol E and its companion
Protocol G (the eval-harness run required for gate-wording edits).

The RED / GREEN / REFACTOR recipe that produces these records lives in the
`create-agent-skills` skill under "Content quality — pressure-testing discipline-gate
skills."
