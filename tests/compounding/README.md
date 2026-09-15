# Compounding A/B harness (cold vs primed)

The smallest reproducible test of the plugin's headline claim: **does capturing
learnings in `docs/solutions/` improve later output?**

It runs the same Salesforce task twice — once with every captured learning
deleted (**cold**) and once with them intact (**primed**) — scores both with the
same deterministic ruler, and prints the signed delta.

> **No numbers have been collected yet.** The method and the scorer are built
> and self-tested; the live runs are ~12 headless `claude -p` turns and have not
> been spent. See
> [`docs/solutions/best-practices/measuring-whether-compounding-works.md`](../../docs/solutions/best-practices/measuring-whether-compounding-works.md)
> for the full method, the reasoning behind each signal, and the prediction
> written down *before* measuring.

## Read this before reading any number it prints

**The delta may come back at or near zero. That is a finding, not a failure.** A
harness that could only produce a positive result would not be measuring
anything — so this one reports a null and a negative result in exactly the same
voice as a positive one, and exits `0` either way.

The six tasks are textbook anti-patterns (bulkification, CRUD/FLS, governor
trigger), and the model's base training covers those well. If priming helps
anywhere it should help most on *repo-specific* conventions, which these tasks
deliberately do not test.

## Direction

Violations are **counted**, so higher is worse:

```
delta = cold - primed        positive  => priming produced better code
                             zero      => no measured effect
                             negative  => priming produced worse code
```

## Usage

```bash
# See the plan and the cost. Runs nothing, spends nothing.
tests/compounding/run-ab.sh --dry-run

# Verify the scoring and reporting path offline (~1s, no CLI, no org)
tests/compounding/selftest.sh
python3 tests/compounding/score.py --selftest

# One full pass: 6 tasks x 2 conditions x 1 sample = 12 live turns
tests/compounding/run-ab.sh

# Three samples per cell. Better against nondeterminism, 36 turns.
tests/compounding/run-ab.sh --repeats 3

# One task only — how to investigate a single result
tests/compounding/run-ab.sh --task 01-bulkification

# Recompute a completed run's verdict offline, with no API key
tests/compounding/run-ab.sh --score-only tests/compounding/results/<run-id>

# Score an arbitrary directory of Apex with the same ruler
python3 tests/compounding/score.py path/to/apex --json
```

`--score-only` is what makes a published delta checkable by a stranger. Each run
directory also keeps `score.py.snapshot` — the exact scorer used — so a run
stays re-scorable even after the rules change.

## What is scored, and what is not

| Signal | Scored? | Why |
| --- | --- | --- |
| Static Apex violations | **yes** | deterministic, offline, reproducible on any machine |
| `sf-review` finding count | collected, never scored | `sf-review` is inside the system under test; it cannot grade itself |
| Tests pass on first deploy | reported `unavailable` | needs a scratch org. Reported unavailable rather than scored `0` — a `0` meaning "not measured" reads as a pass |

Fifteen rules, grounded in this repo's own `governor-limits`, `security-guide`,
`apex-patterns`, and `test-factory` skills, so the scorer and the plugin's
advice cannot drift apart. Rules are **not weighted**; per-rule counts are
printed so a reader can apply their own weights and see what that does.

A rule hit is **evidence**, not proof, and a miss is not proof of absence —
dynamic SOQL and reflection evade all of it. The rules are a **consistent
ruler, not a correctness oracle**, applied identically to both conditions, which
is what makes the *delta* meaningful where an absolute count would not be.

## The tasks

| Task | Kind | Seeded violations | What it exercises |
| --- | --- | --- | --- |
| `01-bulkification` | refactor | 5 | SOQL + DML per record in one loop |
| `02-crud-fls-gap` | refactor | 3 | reads/writes with no access enforcement, no sharing model |
| `03-governor-trigger` | refactor | 5 | inline trigger logic, query per record |
| `04-swallowed-exceptions` | refactor | 2 | one empty catch, one debug-only catch |
| `05-test-bulk-coverage` | author | 3 | `SeeAllData=true`, single record, no assertion |
| `06-hardcoded-and-unbounded` | refactor | 5 | hardcoded owner id, query with no WHERE and no LIMIT |

Each task directory holds `task.md` (the prompt), `meta.json` (the rules it
claims to exercise), and `seed/` (the starting Apex). The selftest asserts every
seed scores **greater than zero** and fires **every rule its `meta.json`
claims** — a task whose seed already scored 0 could not show an effect in either
direction and would silently drag the total toward "no effect".

## Isolation

Each cell runs in a **disposable clone with its remote removed** — not the live
checkout and not a worktree. A worktree shares the origin's object store, refs,
config and remotes, so a session running with `--dangerously-skip-permissions`
could commit, move a branch, or push against the real repository. `HOME` and
`XDG_STATE_HOME` are redirected into the same temp tree so feed state and caches
are disposable too. Everything is removed after each cell.

This mirrors `tests/skill-triggering/run-test.sh`, for the same reasons.

## Cost and practical notes

* **Each cell is a real turn that performs the task**, not a routing check.
  Budget well over an hour for one pass.
* **`timeout(1)` is absent on macOS by default**, so `SFCE_AB_TIMEOUT_SECS` is a
  no-op and a wedged cell runs unbounded. The runner warns. `brew install
  coreutils` provides `gtimeout`.
* **Auth.** With `ANTHROPIC_API_KEY` set the CLI bills the API key. To run
  against a subscription: `env -u ANTHROPIC_API_KEY tests/compounding/run-ab.sh`.

## Honest limits

* **n is tiny.** Six tasks, one sample per cell by default. No confidence
  interval is printed, because computing one from six single samples would dress
  noise as statistics.
* **The primed condition has more context, not only better context.** A longer
  prompt changes behaviour by itself. Separating the two needs a third condition
  primed with *irrelevant* documents of equal length. **This is not built, and
  it is the largest gap in the design** — a positive result here is consistent
  with two different explanations and the harness cannot distinguish them.
* **Only Apex is scored.** LWC, Flow, and metadata produce no score.
* **Task selection is a choice, and it biases the result.** Textbook
  anti-patterns favour the null hypothesis. Repo-specific convention tasks would
  be a fairer test of compounding and are not written.
