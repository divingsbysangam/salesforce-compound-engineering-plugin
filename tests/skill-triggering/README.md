# Skill-triggering eval harness (single-turn)

A mechanical, shell-based regression backstop that asserts a seed prompt routes to
the correct plugin skill — and that the model does **not** take a premature raw
action (an `Edit`, `Write`, `Bash`, etc.) before entering the skill.

It mirrors [obra/Superpowers](https://github.com/obra/superpowers)'s `tests/explicit-skill-requests/run-test.sh` and is
the prerequisite for **Protocol G**: no gate-wording edit ships without an eval run.
The harness is intentionally usable standalone.

## What it asserts

For each case (`<expected-skill>` + `<prompt-file>`), the harness runs the prompt
through a headless `claude -p` turn with this plugin loaded, captures the
`stream-json` event stream, and checks two assertions:

* **A — triggered:** a `Skill` tool-use event for the expected skill appears in the
 stream (the skill actually got invoked).

* **B — no premature action:** no non-`Skill`, non-todo `tool_use` event appears
 **before** the first `Skill` tool-use event. `TodoWrite`/todo bookkeeping is
 treated as benign and does not count as a premature action.

A case passes only when **both** assertions hold.

## How to run

Run one case:

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NzEsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
tests/skill-triggering/run-test.sh sf-review prompts/review-this-pr.txt
```

Run the whole seed battery (loops over every prompt with its expected skill and
prints a summary):

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzQsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
tests/skill-triggering/run-test.sh
```

The prompt-file argument may be absolute or relative to the script's directory,
so both `prompts/review-this-pr.txt` and a full path work.

## Seed battery

| Prompt file | Expected skill | Why |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quick-fix-trigger.txt` | `sf-work` | A "quick fix" must still route through a workflow skill, not raw Apex edits. (`sf-debug` is an acceptable alternative — see note below.) |
| `build-lead-autoassign.txt` | `sf-brainstorm` | A greenfield "let's build X" should hit brainstorm/plan before code. |
| `review-this-pr.txt` | `sf-review` | Direct review request must enter `sf-review`. |
| `i-know-what-sf-work-means.txt` | `sf-work` | Explicit-request bypass: the user names the skill and points at a plan; it should still enter `sf-work` (not start editing blind). |

Note: for the quick-fix case, both `sf-work` and `sf-debug` are defensible routes.
The battery pins one expected skill for a deterministic assertion; if you decide the
other is the intended route, change the expected skill in both `SEED_BATTERY`
(in `run-test.sh`) and the table above.

## Exit codes

| Code | Meaning |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0` | pass |
| `1` | fail (assertion A or B failed, or a usage error) |
| `77` | **skip** — the `claude` CLI is not on `PATH`. Automake's "skip" convention. This is deliberately distinct from both pass and fail so CI never reads a missing CLI as a false pass. |

## Offline-safe behavior

If the `claude` CLI is not found on `PATH`, the harness prints a clear `SKIP:`
message and exits `77`. It never reports a false pass and never hard-fails purely
because the CLI is absent. This lets the script live in the repo and be wired into
Protocol G without breaking environments (CI or otherwise) where `claude` is not
installed.

## Dependencies

* **bash** (uses `mapfile`, so bash 4+; macOS ships bash 3 by default — install a
 newer bash via Homebrew, or run under one).

* **jq** preferred for parsing the JSON event stream. If `jq` is absent the harness
 falls back to a `grep`/`sed` extractor (best-effort), consistent with the repo's
 policy of avoiding hard `jq` dependencies.

## Scope and what's deferred

* **Single-turn only.** Each case is one `claude -p` turn. The harness inspects the
 first turn's tool-use ordering; it does not carry a conversation across turns.

* **Multi-turn eval tiers are deferred.** Sequenced prompts (e.g. brainstorm →
 plan → work handoffs) and their gate-to-gate assertions are out of scope here.

* **Model-tier matrix (e.g. a cheaper "haiku" pass) is deferred.** The harness runs
 whatever model `claude -p` defaults to; a tiered/cost-optimized sweep is future work.