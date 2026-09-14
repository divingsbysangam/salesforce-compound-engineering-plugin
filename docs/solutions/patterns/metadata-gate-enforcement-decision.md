---
title: "Enforcing metadata discipline with hooks: what a fail-open gate can and cannot promise"
date: 2026-09-14
category: patterns
severity: high
tags: ["hooks", "gate", "enforcement", "fail-open", "telemetry", "claude-code"]
status: active
---

# Enforcing metadata discipline with hooks

The plugin's discipline gates were prose. A skill could say "route through
`/sf-work` before editing Apex", and the model could agree and then edit the
file anyway. This records why that became a `PreToolUse` gate, what the gate can
honestly promise, and the schema history that cost a previous attempt.

## The decision: enforcement, but advisory-by-default

Two options were live.

**Advisory only** — keep the primer, add nothing. Cheap, no new failure modes,
and no way to know whether drift is happening at all.

**Enforcement** — deny the edit. Expensive, and it introduces a class of failure
the plugin did not previously have: a gate that wrongly denies is worse than no
gate, because it teaches the user to disable it.

What was built is enforcement **shipped observe-only**. Every step runs —
predicate, grant read, decision recording — and the outcome is *allow*, with the
would-be decision recorded. Enforcement switches on only once the recorded
would-be-deny rate shows the deny prevents something real.

That ordering is the point. A first release that strands people does not get a
second chance to be useful, and nobody had a number for how often the drift
actually occurs.

## What the gate can honestly promise

**It raises the floor. It does not close the door.**

A `PreToolUse` hook fails open by design. The gate does not run — and does not
say so — when the script errors or times out, when it is missing or not
executable, when its interpreter is absent, when its output JSON is malformed,
when enterprise `allowManagedHooksOnly` or `disableAllHooks` suppresses plugin
hooks, when the opt-in has not taken effect because the session was not
restarted, or when the path predicate simply misses.

**The absence of a deny is never evidence of authorisation.** That
sentence is rendered in four places — the `userConfig` option description, the
README hook section, `docs/install-verification.md`, and here — because it is
the single most load-bearing claim in the design and the easiest to forget.

Three more limits, stated rather than discovered later:

* **The model can bypass the gate with Bash whenever it likes**, and it uses
  Bash constantly. The bypass observer measures that; it does not prevent it.
* **MCP writes and org deploys are ungated.** `@salesforce/mcp` exposes
  `deploy_metadata` and its siblings, which reach a live org without matching
  `Edit`, `Write`, `NotebookEdit` or `Bash`. The drift this gate exists to
  prevent is *more* available through MCP than through the tools it watches.
* **The gate's own inputs are ordinary files the agent can edit.** The scripts,
  the allowlist and the routing table are not Salesforce metadata, so changing
  any of them is never denied and produces no bypass record. The self-check
  records a digest so a change is visible; nothing prevents it.

## Why the detector matters more than the deny

A gate that quietly stopped working is indistinguishable from a gate with
nothing to deny. Both produce silence.

So the gate writes a decision row on **every matched call** — allow, deny,
would-deny, override, error — and a separate `PostToolUse` observer records that
a metadata edit **landed**, by path class only. The reporter pairs the two by a
correlation id taken from `tool_use_id`.

An edit that landed with no matching decision row means the gate is inert. That
join is the only way to learn it, and it is why the post-tool half exists.

One subtlety worth recording: pairing must be by correlation id, not by
comparing totals. Totals cancel — one denied edit contributes a decision with no
landing, one inert edit contributes a landing with no decision, the counts match,
and the warning stays silent while the failure sits in the log.

## Fail-open, fail-closed: opposite answers for the two halves

* **The gate fails open, loudly.** A full disk or an unreadable home directory
  must never brick metadata editing. Every unexpected failure allows the call,
  warns on stderr, and records an error decision. *Loudly* is half the contract:
  an early version suppressed the parser's stderr, which made "failed open" and
  "never ran" look identical from outside.
* **The log store fails closed.** A dropped row costs measurement; a
  weakly-keyed or unbounded store costs the privacy guarantee. When no salt can
  be established the row is dropped, with a warning, rather than written with an
  empty HMAC key.

## The 2026-04 schema history, and its superseded conclusion

An earlier attempt at this same hook pair was shipped and then deleted. Its
recorded conclusion was that the hook configuration needed a particular
wrapper-key shape, arrived at after four failed schema guesses.

**That conclusion is superseded and should not be trusted.** The working file on
disk contradicts it. The schema that actually loads is the ordinary Claude Code
shape — an event key, a list of matcher groups, each with a `hooks` array of
`{type, command, timeout}`.

The lesson is not about the schema. It is that four guesses were made against no
observation. Verifying the contract against a live `/hooks` listing first would
have cost one session and saved the attempt.

That is why this round began with a measurement spike (U1) whose only output was
recorded payloads, and why its most valuable finding was a negative one that
reversed a planned assumption.

## Prevention

* Verify a hook contract against a live listing before building on it. Guessing
  a schema is how the 2026-04 attempt died.
* Never ship an enforcement gate that has not been observed denying something.
  "The script ran" and "the script denies" are different claims, and only the
  second matters.
* When a detector compares two counts, check whether the counts can cancel.
* A capability that fails open needs a detector for its own absence, or the
  failure is unobservable by construction.

## Related files

* `scripts/sfce-metadata-gate`, `scripts/sfce-skill-observer`,
  `scripts/sfce-bash-observer`, `scripts/sfce-gate-selfcheck`,
  `scripts/skill-usage`
* `docs/solutions/patterns/claude-code-skill-entry-events.md` — the U1
  measurements this design rests on
* `docs/hook-portability-matrix.md` — what reaches the other eleven targets
* `docs/install-verification.md` — the first-run round and the disclosure
* `docs/plans/2026-09-12-2142-feat-metadata-gate-and-skill-telemetry-plan.md`

## The threat-model block, verbatim

- These hooks are executable scripts that run on your machine, with your full user permissions and no sandbox, on every matching file edit and every Bash call. They are delivered as repository content at the ref you installed; a git tag is mutable and is not a content address, so pin a commit SHA.
- The absence of a deny is never evidence of authorisation. A `PreToolUse` hook fails open. The gate does not run, and does not say so, when: the script errors or times out; the script is missing, not executable, or its interpreter is absent; its output JSON is malformed; enterprise `allowManagedHooksOnly` or `disableAllHooks` suppresses plugin hooks — including the session-start self-check, which the same setting suppresses; the opt-in has not taken effect because the session was not restarted; or the path predicate misses.
- The gate's own enforcement inputs are ordinary files the agent can edit. The hook scripts, the authoring allowlist, and the path-class routing table are not Salesforce metadata, so a change to any of them is never denied and produces no bypass record. One such edit disarms the gate for every future session in that repository. The session-start self-check records a digest of these inputs so a change is visible in the audit record, but nothing prevents it.
- The model can bypass this gate at any time, using Bash, which it uses constantly. The Bash observer measures that bypass. It does not prevent it. Files referenced with `@` in a prompt bypass `PreToolUse` entirely.
- MCP writes and org deploys are ungated. `.mcp.json` configures `@salesforce/mcp`; `deploy_metadata` and its siblings write metadata and reach a live org without matching `Edit`, `Write`, `NotebookEdit`, or `Bash`. The drift this gate exists to prevent is more available through MCP than through the tools it watches.
- Symlinked paths defeat a shape-only predicate. An edit to a benign filename that symlinks to an Apex class is not matched.
- Enforcement exists on Claude Code only. The other eleven conversion targets receive the intent as text.
- The log is local-only, pseudonymous rather than anonymous, retained until deleted, and shareable by the user. It is not an audit trail, and the override is not tamper-evident: the actor who sets the override can delete the record of it.
- Stop and re-plan if U1 finds that no hook event carries skill identity for a description-matched entry. This breaks both halves, not only the reporter. The reporter's claim narrows to explicit invocations and the cold-skill feature is cut. For the gate it is worse: description-based routing is this plugin's primary designed entry path, so a developer who reaches an allowlisted authoring skill that way mints no grant and is denied on their first metadata edit. R4 and KTD1 both assume entry is observable, so U5 stops with U7 rather than proceeding on a narrowed claim.
- Stop and re-plan if a full `sf-lfg` run cannot complete with the gate enabled after U2.
- Stop and re-plan if U1's Cursor probe finds that Cursor does not silently ignore a `PreToolUse` entry it cannot honor and U9's file split cannot produce a `hooks/hooks.json` that Cursor accepts. The split is the prescribed remedy, so the probe's negative result redirects U8's config rather than halting the plan; only a failed split is the stop. Cursor receives `hooks/hooks.json` by manifest reference, bypassing the converter layer, so it is the one exception to this plan's inert-elsewhere premise.
- Tail ownership: This plan ends at a reviewed, tested branch. Shipping is `/sf-commit-push-pr`.
- 
