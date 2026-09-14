---
title: "Which Claude Code hook events carry skill identity, per entry path"
date: 2026-09-13
category: patterns
severity: high
tags: ["hooks", "skills", "telemetry", "claude-code", "plugin", "userconfig"]
status: active
---

# Which hook events carry skill identity, per entry path

Measured on **Claude Code 2.1.270**, macOS 26.6, against this plugin loaded via
`--plugin-dir`. This is the U1 spike of
`docs/plans/2026-09-12-2142-feat-metadata-gate-and-skill-telemetry-plan.md`.
Everything below was observed, not inferred. Scrubbed captures are in
`cli/tests/hooks/fixtures/`.

## Symptoms

Two planned features — a `PreToolUse` gate on raw metadata edits, and
skill-firing telemetry — both need one thing the plan could not assume: a
deterministic, observable signal that a skill was entered. Nothing in the repo
recorded which hook events actually fire on which entry path, so both features
were blocked on a guess.

## The answer

**No single event covers every entry path. Two together cover all three.**

| Entry path | Event that carries identity | Field | Value observed |
| --- | --- | --- | --- |
| Typed slash (`/sf-plan …`) | `UserPromptExpansion` | `command_name` | `sf-compound-engineering:sf-plan` |
| Model-initiated (user names the skill) | `PreToolUse` / `PostToolUse` | `tool_input.skill` | `sf-compound-engineering:sf-plan` |
| Bare description-matched phrase | `PreToolUse` / `PostToolUse` | `tool_input.skill` | `sf-compound-engineering:sf-plan` |

A collector must therefore read **both** `UserPromptExpansion.command_name`
**and** `PreToolUse` where `tool_name == "Skill"`. Either alone silently loses
an entire entry path.

### Q1 — description-matched entry IS observable (reverses the planned default)

The plan assumed a bare phrase matching only a skill's `description`
frontmatter would produce **no** hook event, and treated that as a **stop
condition** for the gate: authorisation mintable only by slash commands and
explicit tool calls would deny the plugin's primary entry path.

Measured, that assumption is wrong. The prompt

> "Plan this Apex feature: a bulk-safe Account trigger that assigns territories."

never names `sf-plan`, and produced:

```
SessionStart -> UserPromptSubmit -> PreToolUse(Skill) -> PostToolUse(Skill) -> PreToolUse(Bash) ...
```

with `tool_input.skill = "sf-compound-engineering:sf-plan"`. The `Skill` event
is the **first** tool event in the stream — no premature raw action preceded it.

**The Q1 stop condition is lifted.** The gate half of the plan is viable.

### Skill identity is plugin-qualified on BOTH paths

Every identity field observed is qualified (`sf-compound-engineering:sf-plan`),
never bare (`sf-plan`). This holds for `UserPromptExpansion.command_name` and
for `tool_input.skill`.

This settles an open finding on PR #25: `tests/skill-triggering/run-test.sh`
compares assertion A against **bare** names in `SEED_BATTERY`
(`sf-work`, `sf-review`, `sf-tend`) using exact equality. Against a real
recording every case would fail. It is a false-FAIL, not a vacuous pass, but it
must be fixed before fixtures are recorded — by normalising the qualifier or by
qualifying the battery.

### `Skill` tool_input carries an `args` field

When arguments are passed, `tool_input` is
`{"skill": "<qualified name>", "args": "<the argument text>"}`. `args` is user
text and is dropped at scrub time; the fixtures record only that the field
existed.

### Subagents share the parent session id

`SubagentStart` fires with `agent_id`, `agent_type`, and the **parent's**
`session_id`. Across an `sf-plan` run, five `SubagentStart` events shared one
`session_id` and differed only by `agent_id`. So `session_id` cannot key a
per-agent record; `agent_id` is the discriminator, exactly as the plan's KTD
assumed.

Personas are dispatched through the **`Agent`** tool, not the `Skill` tool, so a
persona does not appear in skill telemetry as a skill.

### Q2 — `/sf-lfg` writes files without ever emitting a Skill event

This is the load-bearing constraint for the gate.

`/sf-lfg <feature>` ran for four minutes and used `Bash` ×13, `Read` ×15,
**`Write` ×1 and `Edit` ×1** — with **zero** `Skill` tool events. The same holds
for `/sf-plan`: 284 captured payloads, no `Skill` event anywhere.

A slash-invoked skill is **expanded into the prompt**, not called as a tool.

**Consequence:** a gate that mints authorisation only from an observed `Skill`
event would block the plugin's own flagship pipeline from editing. Authorisation
must also be mintable from `UserPromptExpansion.command_name`.

Bounded observation: the run was stopped at four minutes and had not reached
Stage 3, so whether Stage 3 dispatches implementation into a subagent is **not**
settled here. The plan's default — allowlist `sf-lfg`, verify one full run
before shipping — still stands.

### Q5 — a fork carries no parent session id

`claude -p --resume <id> --fork-session` produces `SessionStart` with
`source: "fork"` and a **new** `session_id`. The payload carries **no**
parent-linking field of any kind:

```
['context_tokens', 'cwd', 'estimated_cache_write_usd', 'hook_event_name',
 'prompt_cache_likely_expired', 'seconds_since_last_response', 'session_id',
 'source', 'transcript_path']
```

The planned default holds: **a fork starts unauthorised.** A session-scoped
marker cannot be inherited across a fork, because nothing in the payload
identifies what was forked.

Note the fork payload has four keys the `startup` payload does not. Payload
shape varies by `source`; a consumer must not assume a fixed key set.

### Q4 — a headless session is distinguishable, by environment not by payload

No stdin field marks a `-p` session. The union of every payload field seen was:

```
cwd, duration_ms, effort, hook_event_name, permission_mode, prompt, prompt_id,
session_id, source, tool_input, tool_name, tool_response, tool_use_id,
transcript_path
```

`permission_mode` reads `default` in both interactive and headless runs, so it
does not discriminate.

The hook process **environment** does. Controlled comparison, same machine:

| Variable | Interactive session | `-p` session |
| --- | --- | --- |
| `CLAUDE_CODE_ENTRYPOINT` | `cli` | `sdk-cli` |
| `CLAUDE_CODE_SESSION_ATTENDED` | `1` | `0` |
| `CLAUDE_CODE_CHILD_SESSION` | `1` | `1` (inherited — proves nothing) |

The first two are **overwritten** by the nested session, not inherited, which is
what makes them usable. `CLAUDE_CODE_SESSION_ATTENDED=0` is the cleanest signal
for "no human is here to answer a prompt".

This improves on the planned default (ship a documented environment override):
a built-in signal exists. Keep the override as a manual escape hatch.

### Q3 — a declared `userConfig` default never reaches the hook process

`CLAUDE_PLUGIN_OPTION_*` was **absent from every hook process**, in every run,
including with the option declared and `default: true`.

Per the CLI's own strings, values are persisted by `/plugin configure` — the
manifest `default` is a schema default, not a delivered value. Under
`--plugin-dir` with no configured value, the option reads as absent.

**Consequence for the opt-in design:** the hook cannot distinguish "off" from
"never configured". Absent must mean off, and the opt-in copy must say the flag
has to be set via `/plugin configure`, not merely declared.

Whether a *set* value propagates mid-session is **untested** — setting one
requires writing the user's real plugin configuration, which this spike
deliberately did not do. The planned default (assume a restart is needed) stands.

## Root cause of a trap found along the way

### A `userConfig` option without `title` silently breaks the entire plugin

Controlled A/B/C on the same clone, same session shape:

| `userConfig` declaration | Plugin loads? | `/sf-lfg` |
| --- | --- | --- |
| absent | yes | runs, `UserPromptExpansion` fires |
| `{"type":"boolean","default":true,"description":…}` — **no `title`** | **no** | `Unknown command: /sf-lfg` |
| `{"type":"boolean","title":…,"description":…,"default":true}` | yes | runs |
| `{"type":"string","title":…,"description":…,"default":"on"}` | yes | runs |

Omitting `title` does not produce a validation error, a warning, or a degraded
load. **Every command and skill in the plugin silently disappears**, and the only
symptom is `Unknown command`. The failure looks like a missing skill, not a
malformed manifest, which is what makes it expensive.

This cost real time during this spike: an `sf-lfg` measurement was recorded as
"no events" when in fact the plugin had not loaded at all.

## Prevention

* When adding `userConfig` to `.claude-plugin/plugin.json`, always include
  `title`. Treat `Unknown command: /<known-skill>` as a manifest error first.
* Verify plugin load explicitly before recording any measurement against it —
  a single known slash command that must expand. A capture showing "no events"
  is indistinguishable from a plugin that never loaded.
* Do not key any per-agent record on `session_id`; subagents share the parent's.
* Do not assume a fixed payload key set. It varies by `SessionStart.source`.
* Scrub captures with an **allowlist**, not a denylist. Payload shape is not
  stable across versions or sources, so a denylist leaks whatever is added next.

## Method and honest limits

* Captures were taken in a disposable clone with its remote removed;
  `XDG_STATE_HOME` was redirected. `HOME` was **not** redirected: credentials
  resolve through `~/.claude.json` plus the macOS Keychain, and a redirected
  `HOME` reports "Not logged in". Copying the OAuth account record into a scratch
  directory was rejected as a worse trade than leaving `HOME` intact.
* The nested CLI ran with **permission checks on**. Hooks fire before permission
  resolution, so the measurement never needed elevated rights.
* Every entry-path run was stopped once its measurement was complete, so tool
  counts are lower bounds, not totals. `timeout(1)` and `gtimeout(1)` are absent
  on this machine — relevant to `tests/skill-triggering/run-test.sh`, whose
  recording timeout is therefore a no-op here.
* **Not covered:** Cursor's runtime handling of an unhonorable hook entry (see
  below), whether a *set* `userConfig` value propagates mid-session, and whether
  `sf-lfg` Stage 3 dispatches into a subagent.

### Cursor never receives a non-SessionStart hook entry

The plan asked what Cursor does with a `PreToolUse` entry it cannot honor. That
question is settled in this repo's converter rather than at Cursor's runtime:

* `cli/src/converters/cursor.ts` contains **no** reference to hooks at all.
* Only `kiro.ts` translates a hook, and it hardcodes the SessionStart primer.
* `base.ts` and `openclaw.ts` consume `hooks.primerText` — the prose, not the
  mechanism.
* `parseHooks()` in `cli/src/parser/plugin.ts` reads `hooks/hooks.json` into a
  raw `config` field that no converter consumes, and otherwise looks only for
  `scripts/session-start`.

So a `PreToolUse` entry added to `hooks/hooks.json` is parsed, ignored, and
never emitted to Cursor. Cursor cannot mishandle an entry it never receives.
A GUI confirmation was not run.

## Related files

* `cli/tests/hooks/fixtures/entry-slash-command.json`
* `cli/tests/hooks/fixtures/entry-model-initiated.json`
* `cli/tests/hooks/fixtures/entry-description-matched.json`
* `cli/tests/hooks/fixtures/entry-lfg-pipeline.json`
* `cli/tests/hooks/fixtures/session-fork.json`
* `docs/plans/2026-09-12-2142-feat-metadata-gate-and-skill-telemetry-plan.md`
* `tests/skill-triggering/run-test.sh` — assertion A vs qualified names
