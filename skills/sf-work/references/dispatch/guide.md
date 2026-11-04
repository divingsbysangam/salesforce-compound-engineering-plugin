# Dispatching Parallel Personas

The shared mechanics every workflow skill uses when it says "dispatch these personas." Skills reference this file instead of restating it; each keeps its own pointer to where its personas live.

## What personas are

A persona is a **prompt asset** under a skill's `references/personas/<name>.md` — **not** a registered agent. V3.1 is agentless: no standalone agents are registered on any platform. To dispatch a persona, load the persona file's contents and feed them to a general-purpose subagent as its instructions.

## How to dispatch

Run each persona as an **isolated subagent** via the platform's subagent primitive — the Task tool on Claude Code. On Claude Code these run in parallel, each with isolated context; that isolation is the point of splitting them. On harnesses without a subagent primitive, apply each persona's prompt **inline, one after another**, against the matching files.

## Same-response parallelism rule

To actually run in parallel, issue **all** dispatches in the **same response** — one message containing multiple Task calls. One dispatch per response is sequential, not parallel. This is the most common mistake: personas that were meant to run concurrently end up serialized because each Task call went out in its own turn.

## Same-file-conflict check

Before dispatching personas that may **write** files, check whether two of them would edit the same file (e.g. the same trigger handler or LWC component). If so, **serialize** them, or have one build on the other's committed result — parallel isolated workers editing one file still produce diverging copies that need a real merge. Read-only review and research personas never conflict, so dispatch them all at once.

## Prompt quality

Give each persona a **bounded packet**: the persona file's contents + the specific target files or diff + exactly what to return. Do not tell a persona to "read the whole repo" — scope it to what it needs.

## Worker scope (one unit per handle)

When implementation is split across subagents or workers, bind each handle to **one** implementation unit only: spawn fresh for that unit, integrate its result, then retire the handle. Never retask or reuse an idle worker for a later unit. Cleanup of orphaned workers is the caller's job only when the harness assigns that responsibility to the caller.

Parallel dispatch of each independent dependency layer is the default. Serialize only a real dependency: a unit that reads a file another unit writes, a shared runtime resource, or a merge you cannot attribute. Resolve uncertainty by reading the files, not by defaulting to serial. A unit too small to pay its own context ramp (a one-line label, a single constant) is batched with its neighbors instead of getting its own worker.

Before an isolated worktree dispatch, verify snapshot fidelity: the worktree HEAD is the commit you intended, and `git status --porcelain` shows only the files you expect (often none). A drifted checkout — wrong HEAD, a surprise `package.xml` — is not isolated. Fix the snapshot or do not dispatch.

## Shared-workspace wave

A parallel wave in one working directory is allowed only while all of these hold. A unit that cannot meet one runs serially or in its own worktree.

- Start from a committed tree, so each worker's output is attributable and an aborted wave can restore to that baseline.
- Exclusive ownership includes hidden write surfaces: `package.xml`, `sfdx-project.json`, Jest config, lockfiles, generated metadata, and `.sfdx` cache. Two units that both regenerate `package.xml` are not independent.
- Workers do not run `git add`, commit, or otherwise write the index. The orchestrator stages and commits after the batch.
- Workers do not run mutating verification: a full `sf apex run test`, `sf project deploy`, or an install that rewrites a lockfile. One focused test class is allowed only when it writes no shared state. The orchestrator runs the authoritative tests after the wave.
- A write outside every worker's exclusive set aborts the wave and disables further shared-workspace waves for the run. Restore only changes attributable to a worker.

Dispatch a cleared wave in one response: list the ready units privately, then issue every worker dispatch that does not depend on another's result. After the wave, the orchestrator reviews each unit's diff against its declared files, runs tests, commits, and retires that handle before the next layer.

## After dispatch

Collect the results, **deduplicate** across personas (for review, apply `sf-review`'s confidence rubric), and spot-check before trusting. Isolated workers can each surface the same finding or reach a wrong conclusion in isolation — reconcile, don't concatenate.

## Rejected dispatch

A dispatch the harness rejects before the agent launches, because the call itself was malformed (unsupported option, schema validation error, incompatible argument), is a correctable invocation error. Change only the arguments the harness named, keep the prompt and scope, and retry once. A capacity or active-agent-limit rejection is not malformed: leave that dispatch queued and retry when a slot frees. A failure after the agent launched is not retried this way. Spend an inline fallback only when correction does not fix the failure, or the host has no subagent tool at all, and say so in one line.