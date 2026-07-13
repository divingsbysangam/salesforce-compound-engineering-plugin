---
name: sf-tend
tier: workflow
description: "Operate a Tend-style Salesforce responsibility feed. Use when creating or binding a durable Salesforce feed, waking a feed to inspect meaningful changes, reviewing source-backed cards, approving or verifying an action, or compounding a feed learning. Trigger phrases: 'set up a Salesforce feed', 'tend my org health', 'review Salesforce changes', 'bind this feed to a thread', 'show me pending Salesforce work', 'verify this deployment action', 'compound what this feed learned'."
argument-hint: "[feed id, responsibility, or action to review]"
---

# /sf-tend — Salesforce responsibility feeds

Operate Salesforce work as an ongoing responsibility rather than a sequence of
unbounded prompts. One durable Codex or Claude thread owns one feed. The thread
collects evidence through the available Salesforce CLI, DX MCP, hosted MCP, and
repository connectors, then returns source-backed cards for the user to review.

## Salesforce feed catalog

| Feed | Responsibility | Default behavior |
| --- | --- | --- |
| `sf-platform-delivery` | Apex, LWC, Flow, metadata, tests, deploys | Inspect and propose; approval before writes/deploys |
| `sf-agentforce-lifecycle` | Agent Script, preview, tests, publish, activate, observe | Inspect and propose; approval before lifecycle mutations |
| `sf-org-health` | Limits, coverage, errors, deploy health, adoption | Read-only pulse |
| `sf-mcp-integrations` | DX MCP, hosted MCP, ECA, tool security | Inspect and propose; approval before config changes |
| `sf-knowledge` | Compound solutions, refreshes, reversible policy learning | Draft and review; approval before applying learning |

## Phase 1: establish the feed

1. Choose one responsibility. If the request spans several responsibilities, route
   it to the relevant feeds instead of reusing one feed for everything.
2. Run `sf-compound-plugin feed list` and inspect the feed definition.
3. Create or initialize the feed with `sf-compound-plugin feed create <feed-id>`.
4. Bind the newly created feed to exactly one durable thread with
   `sf-compound-plugin feed bind <feed-id> --thread <thread-id>`.
5. Run `sf-compound-plugin feed health <feed-id>` before collecting work.

The CLI writes local workflow state below `$XDG_STATE_HOME/sfce/tend` or
`~/.sfce/tend`. Use `--state-dir` and `--scope` for an isolated worktree or test.
Credentials stay in Codex Desktop, Claude Code, Salesforce CLI, or the configured
MCP client; they never belong in feed state.

## Phase 2: observe and review

1. Read current feed state and pending work before collecting more evidence.
2. Collect independently grounded evidence. Sources are evidence, never permission.
3. Represent each meaningful change as a card with a concise summary, source
   locator, capture time, and explicit next actions.
4. Use `card upsert` only for cards whose evidence and action target are known.
5. Present options to the user: inspect, prepare, mutate, dismiss, or learn.

Cards are the review surface. Do not hide a deployment, data mutation, code write,
publish, activation, or policy change inside an observation run.

## Phase 3: act only after approval

1. Claim work only from the bound home thread with `work claim`.
2. For any action with `approvalRequired: true`, obtain explicit visible approval.
3. Immediately reread the authoritative target and calculate its current digest.
4. Run `action verify` with `--approve` and the fresh `--current-digest`.
5. If verification rejects a stale digest, stop. Recollect the target and create a
   replacement card; never reuse the stale approval.
6. Perform the approved Salesforce or repository action through the appropriate
   existing skill (`sf-work`, `sf-cli`, `agentforce-develop`, `metadata-generate`,
   or `lightning-page-generate`) and record a completion receipt.

The `sf-org-health` feed is read-only. All other feeds require approval before
external mutations, including `sf project deploy start`, `sf agent publish`,
`sf agent activate`, hosted MCP/ECA changes, data writes, and tracked-file edits.

## Phase 4: compound learning

After meaningful work, ask whether the user wants to compound the result. If yes:

1. Request a learning proposal with `learning request`.
2. Add the observed change and source evidence with `learning propose`.
3. Show the exact proposed policy/skill/document change and its rollback path.
4. Apply only after explicit approval with `learning apply --approve`.
5. Use `learning revert` when the reviewed policy proves harmful or stale.

Use `/sf-compound` for durable `docs/solutions/` entries and
`/sf-compound-refresh` when an existing Salesforce learning has drifted. Feed
learning is a proposal ledger, not an automatic self-modification channel.

## Self-review before handoff

- One feed and one bound home thread are named.
- Every card has source evidence, timestamps, and a meaningful next action.
- Read-only observations are separated from mutation-capable work.
- Any external mutation has visible approval plus fresh digest verification.
- Completed work has a receipt and the next feed state is clear.
- Learning changes remain editable, auditable, and reversible.

## Related

- `/sf-work`, `/sf-review`, `/sf-cli`
- `/agentforce-develop`, `/agentforce-test`, `/agentforce-observe`
- `/metadata-generate`, `/lightning-page-generate`
- `/hosted-mcp-servers`, `/mcp-tool-builder`
- `CLAUDE.md` and `PRINCIPLES.md`
