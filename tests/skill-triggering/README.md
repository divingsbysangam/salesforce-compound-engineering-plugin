# Skill-triggering eval harness (single-turn)

A mechanical, shell-based regression backstop that asserts a seed prompt routes to
the correct plugin skill — and that the model does **not** take a premature raw
action (an `Edit`, `Write`, `Bash`, etc.) before entering the skill.

It mirrors [obra/Superpowers](https://github.com/obra/superpowers)'s `tests/explicit-skill-requests/run-test.sh` and is
the prerequisite for **Protocol G**: no gate-wording edit ships without an eval run.
The harness is intentionally usable standalone.

## Two modes

| Mode | How to run | Needs the CLI? | What it is for |
| --- | --- | --- | --- |
| **replay** (default) | `run-test.sh` | no | Deterministic offline check against recorded fixtures. Intended as the CI mode; the CI step is switched off until fixtures are committed (U13). |
| **live** | `run-test.sh --live` | yes | Re-records fixtures against the real CLI, then asserts against what it recorded. |

Replay reads a recorded tool-use stream from `fixtures/<case>.jsonl` and runs the
assertions against it. **A missing, empty, unreadable, or truncated fixture is a
failure, never a skip.** That is the whole point: the harness used to exit `77`
whenever the `claude` CLI was absent, and CI treated `77` as success — so the
eval could pass without ever running.

Live mode is opt-in so an ordinary run never silently re-records. Refreshing
fixtures is a deliberate act that produces a reviewable diff.

## What it asserts

For each case (`<expected-skill>` + `<prompt-file>`), the harness checks two
assertions against the stream — identical in both modes:

* **A — triggered:** the **first** `Skill` tool-use event in the stream carries the
 expected skill identity. First, not anywhere: a stream that routes somewhere else
 and reaches the expected skill afterwards is a routing failure, and an earlier
 whole-file match passed exactly that.

* **B — no premature action:** no non-`Skill`, non-todo `tool_use` event appears
 **before** the first `Skill` tool-use event. `TodoWrite`/todo bookkeeping is
 treated as benign and does not count as a premature action.

A case passes only when **both** assertions hold.

## How to run

```bash
# Replay the whole seed battery (no CLI needed)
tests/skill-triggering/run-test.sh

# Replay one case
tests/skill-triggering/run-test.sh sf-review prompts/review-this-pr.txt

# Re-record every fixture against the live CLI, then assert
tests/skill-triggering/run-test.sh --live

# Re-record one case
tests/skill-triggering/run-test.sh --live sf-review prompts/review-this-pr.txt
```

The prompt-file argument may be absolute or relative to the script's directory,
so both `prompts/review-this-pr.txt` and a full path work.

## Recording fixtures — read before using `--live`

Recording is not a dry run. Each case is a real headless `claude -p` turn with
`--dangerously-skip-permissions`, so **the model performs the task, it does not
merely route to it**. Observed side effects from a single recording pass include
creating live Tend feed state under `~/.sfce/tend/` and writing files to the
session's memory directory. Budget for that before re-recording.

Practical notes:

* **It runs in a disposable clone with its remote removed, not your checkout, and
 not a worktree.** A worktree would share the real repository's object store,
 refs, config and remotes — a session running with permission checks disabled
 could commit, move a branch, or push against your actual repo. The recorder
 clones instead and drops the remote, then redirects `HOME` and `XDG_STATE_HOME`
 into the same temp directory so feed state and caches are disposable too.
 Everything is removed on exit, interrupt, or termination.
* **An empty scratch directory is not a substitute.** An earlier version recorded
 from a bare temp dir; the router behaved differently because the prompts assume a
 real Salesforce repository, and the model went looking around with shell commands.
 Real repo content matters for fidelity.
* **It is slow.** Expect several minutes per case; the full battery is well over an
 hour.
* **Auth.** If `ANTHROPIC_API_KEY` is set it takes precedence over a `claude.ai`
 login. To record against your subscription instead, unset it for the command only:
 `env -u ANTHROPIC_API_KEY tests/skill-triggering/run-test.sh --live`.
 The harness reports a CLI error (quota, auth, rate limit) rather than writing an
 empty fixture.

## Fixture contents

A fixture holds only what the two assertions read: the ordered `tool_use` events
and, for `Skill` events, the skill identity. Prompt text, file contents, tool
results, absolute paths, org data, and credentials are stripped at record time and
never committed. The seed prompts already live in `prompts/`, so a fixture has no
reason to restate them.

A recorded line looks like:

```json
{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Skill","input":{"skill":"sf-review"}}]}}
```

That is minimal `stream-json`, which is why the assertion code is identical for a
live stream and a replayed fixture.

## Seed battery

| Prompt file | Expected skill | Why |
| --- | --- | --- |
| `quick-fix-trigger.txt` | `sf-work` | A "quick fix" must still route through a workflow skill, not raw Apex edits. (`sf-debug` is an acceptable alternative — see note below.) |
| `build-lead-autoassign.txt` | `sf-brainstorm` | A greenfield "let's build X" should hit brainstorm/plan before code. |
| `review-this-pr.txt` | `sf-review` | Direct review request must enter `sf-review`. |
| `i-know-what-sf-work-means.txt` | `sf-work` | Explicit-request bypass: the user names the skill and points at a plan; it should still enter `sf-work` (not start editing blind). |
| `tend-salesforce-feed.txt` | `sf-tend` | An ongoing Salesforce responsibility should create/bind a feed before collecting work. |
| `tend-platform-delivery.txt` | `sf-tend` | Platform-delivery responsibility should bind a feed, not start delivering. |
| `tend-agentforce-lifecycle.txt` | `sf-tend` | Agentforce lifecycle responsibility should bind a feed. |
| `tend-org-health.txt` | `sf-tend` | Org-health responsibility should bind a feed. |
| `tend-mcp-integrations.txt` | `sf-tend` | MCP-integration responsibility should bind a feed. |
| `tend-knowledge.txt` | `sf-tend` | Knowledge responsibility should bind a feed. |

Note: for the quick-fix case, both `sf-work` and `sf-debug` are defensible routes.
The battery pins one expected skill for a deterministic assertion; if you decide the
other is the intended route, change the expected skill in both `SEED_BATTERY`
(in `run-test.sh`) and the table above.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | pass |
| `1` | fail — an assertion failed, a fixture was missing/empty/unreadable/truncated, or a usage error |
| `77` | **skip — live mode only**, when the `claude` CLI is not on `PATH`. Automake's "skip" convention. **Replay never exits `77`.** |

## Dependencies

* **bash 3.2+.** The harness deliberately avoids `mapfile`, associative arrays, and
 case-modification expansions so it runs on macOS's system bash.
* **jq or python3** — required for both modes. Assertion A has to pair a tool name
 with its skill identity, and the `grep`/`sed` fallback can recover names but not
 that pairing. Rather than degrade to a check that cannot tell the right skill from
 the wrong one, the harness fails loudly when neither is present. `jq` is preferred;
 `python3` is the fallback and ships with macOS.

## Scope and what's deferred

* **Single-turn only.** Each case is one `claude -p` turn. The harness inspects the
 first turn's tool-use ordering; it does not carry a conversation across turns.

* **A fixture is a single sample, not a distribution.** Recording invokes the CLI
 once per case and commits whatever came back. Routing is stochastic — during
 development the same `review-this-pr` prompt produced twelve shell calls and no
 skill invocation on one run. So a fixture can freeze a bad run into a permanent
 false failure, or launder a lucky one into permanent false confidence. Nothing
 re-samples or votes.

* **Slash-command entry (`/sf-<name>`) is untested.** Assertion A observes a `Skill`
 tool-use event, and direct slash invocation is documented as not producing one.
 All ten seed prompts are natural language. Adding a case needs a different
 assertion, not another prompt.

* **The battery covers four skills, not the catalogue.** Ten prompts exercising
 `sf-work`, `sf-brainstorm`, `sf-review`, and `sf-tend` — out of roughly 69 skills.
 Treat a green battery as evidence about those four routes only.

* **Fixture staleness is not yet detected.** A fixture records routing as it was on
 the day it was captured. If routing legitimately changes, replay keeps asserting
 the old behaviour and stays green. Re-record deliberately after any change to skill
 `description` frontmatter or gate wording.

* **Multi-turn eval tiers are deferred.** Sequenced prompts (e.g. brainstorm →
 plan → work handoffs) and their gate-to-gate assertions are out of scope here.

* **Model-tier matrix (e.g. a cheaper "haiku" pass) is deferred.** The harness runs
 whatever model `claude -p` defaults to; a tiered/cost-optimized sweep is future work.
