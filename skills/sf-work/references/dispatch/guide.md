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

When implementation is split across subagents or workers, bind each handle to **one** implementation unit only: spawn fresh for that unit, integrate its result, then retire the handle. Never retask or reuse an idle worker for a later unit. In a parallel batch, commit (or otherwise integrate) and retire each unit before starting the next wave. Cleanup of orphaned workers is the caller's job only when the harness assigns that responsibility to the caller.

## After dispatch

Collect the results, **deduplicate** across personas (for review, apply `sf-review`'s confidence rubric), and spot-check before trusting. Isolated workers can each surface the same finding or reach a wrong conclusion in isolation — reconcile, don't concatenate.

## Rejected dispatch

A dispatch the harness rejects before the agent launches, because the call itself was malformed (unsupported option, schema validation error, incompatible argument), is a correctable invocation error. Change only the arguments the harness named, keep the prompt and scope, and retry once. A capacity or active-agent-limit rejection is not malformed: leave that dispatch queued and retry when a slot frees. A failure after the agent launched is not retried this way. Spend an inline fallback only when correction does not fix the failure, or the host has no subagent tool at all, and say so in one line.