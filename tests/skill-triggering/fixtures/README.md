# Recorded routing fixtures

This directory holds one `<case>.jsonl` per seed prompt in `../prompts/`. Each is
a scrubbed, minimal `stream-json` recording of a real `claude -p` turn — the
ordered `tool_use` events and, for `Skill` events, the skill identity. Nothing
else: prompt text, file contents, tool results, absolute paths, org data, and
credentials are stripped at record time.

**It is currently empty except for this file.** That is a known, declared state,
not an oversight — see "Why it is empty" below.

## How the CI gate behaves while this directory is empty

`../ci.sh` derives its own policy from what is on disk:

| Fixtures present | CI result | What is actually being checked |
| --- | --- | --- |
| 0 of 10 | **pass**, with a loud UNARMED notice | the assertion engine only (`../selftest.sh`) |
| 1–9 of 10 | **fail** | nothing — a partial battery is refused, not run on its subset |
| 10 of 10 | battery verdict | routing for all ten seed prompts |

There is no flag to flip. The gate arms itself when the last fixture lands, and
the partial-recording rule makes it impossible to record the three easy cases,
go green, and leave the rest.

While it is unarmed, CI is asserting exactly one thing: that the assertion
engine rejects all sixteen documented failure modes, including a wrong skill, a
near-match name (`sf-work-log` for `sf-work`), another plugin's same-named
skill, the expected skill reached *second*, a premature `Bash`/`Edit`, and a
truncated fixture. That claim is real and it can go red. It is **not** a claim
about routing.

## Why it is empty

Two reasons, one of which is a deliberate hold:

1. **Recording costs roughly 70 minutes of live CLI time.** Each case is a real
   headless turn with `--dangerously-skip-permissions`, so the model *performs*
   the task rather than merely routing to it. That is a resource decision, not a
   technical blocker.

2. **One seed case shows a routing anomaly worth understanding first.** During
   development the `review-this-pr` prompt produced twelve shell calls and no
   `Skill` invocation on one run, and routed correctly on another. Freezing
   either outcome into a committed fixture would be wrong in opposite
   directions: the bad run becomes a permanent false failure, the good run
   permanent false confidence. A fixture is a single sample, and nothing here
   re-samples or votes.

Point 2 is the one to resolve before recording. Point 1 is only time.

## Recording

Read `../README.md`'s "Recording fixtures" section first — it is not a dry run.

```bash
# The whole battery. Expect well over an hour.
env -u ANTHROPIC_API_KEY tests/skill-triggering/run-test.sh --live

# One case, which is how the review-this-pr anomaly should be investigated.
env -u ANTHROPIC_API_KEY tests/skill-triggering/run-test.sh --live \
  sf-review prompts/review-this-pr.txt
```

`env -u ANTHROPIC_API_KEY` records against a `claude.ai` subscription; with the
variable set, the CLI bills the API key instead.

### Before recording, know these two things

* **`timeout(1)` is absent on macOS by default.** `RECORD_TIMEOUT_SECS` is a
  no-op without `timeout` or `gtimeout`, so a wedged case runs unbounded. The
  harness says so at record time. `brew install coreutils` provides `gtimeout`.

* **Re-record deliberately after any change to skill `description` frontmatter
  or gate wording.** Staleness is not detected: a fixture records routing as it
  was on the day it was captured, and replay will keep asserting the old
  behaviour and stay green. This is the harness's most significant remaining
  gap.

## Reviewing a fixture diff

A recorded line looks like:

```json
{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Skill","input":{"skill":"sf-compound-engineering:sf-review"}}]}}
```

Identity is always plugin-qualified — measured on Claude Code 2.1.270, see
`docs/solutions/patterns/claude-code-skill-entry-events.md`. A bare `sf-review`
in a recording means the scrubber or the CLI changed shape; investigate rather
than committing it.

Read a fixture diff as a routing claim. Events before the first `Skill` line are
assertion B's subject, and a new `Bash` or `Read` appearing there is a
regression in the plugin's discipline, not noise in the recording.
