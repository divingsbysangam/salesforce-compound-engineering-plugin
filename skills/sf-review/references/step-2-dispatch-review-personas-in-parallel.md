# Step 2: Dispatch Review Lenses in Parallel

Read with `sf-review/SKILL.md`. Procedure lives here.

Review lenses are checklists at `references/lenses/<name>.md`, not registered agents. Dispatch **one subagent per applicable lens**, all in the same response, per `../../sf-work/references/dispatch/guide.md`. On a harness without subagents, apply the lenses inline one after another.

Each subagent gets: the lens file path, `references/lenses/contract.md`, and the **list of changed file paths** (not their contents). It returns finding lines per the contract.

Pass paths only. Do not also paste the diff or file bodies into the same prompt. Inline content is authoritative when a path cannot be given; a path is not content until the lens reads the file. Sending both makes the reviewer score the same change twice and disagree with itself.

## Which lenses run

Pick lenses from the file classes found in Step 1. A lens runs once, over all of its files.

| Lens | Runs when the diff contains |
|---|---|
| `apex` | `*.cls`, `*.trigger` |
| `security` | Apex, LWC, Aura, Visualforce, sharing/profile/permission-set/site metadata |
| `flow` | `*.flow-meta.xml`, validation rules, workflow/process metadata |
| `lwc` | `lwc/**`, `aura/**` |
| `integration` | Callouts, `@RestResource`, Named/External Credentials, Platform Events, CDC, MCP config |
| `metadata` | Any other `*-meta.xml`, `sfdx-project.json`, destructive manifests |
| `tests` | Every review with code changes (tests, correctness, prior review comments) |
| `architecture` | `comprehensive` depth only |

Typical dispatch: Apex-only diff → `apex`, `security`, `tests` (3 subagents). LWC + Apex → add `lwc`.

## How to dispatch

Dispatch the applicable lenses as one foreground concurrent batch, sized to the host's active-agent cap. Ask for background execution off. Collect each return when that launch reaches a terminal outcome. Do not synthesize a partial roster, and do not poll a detached job, when a launch has no reliable blocking collection path: stop that work and apply the unfinished lens inline, and say so in one line.

A missing or unauthenticated Salesforce DX MCP server, or no default target org, does not skip this pass. A lens that wanted a live org records the tool as unavailable and continues on the diff.

## Repo-owned standards

Before dispatch, build the criteria mapping in `standards-criteria.md`. When any changed file has a governing criteria file, include `architecture` even below comprehensive depth, and append the mapping as a `<standards-paths>` block. Pass paths, not the criteria text. `architecture` at comprehensive depth still receives the same block.

## Depth

- `fast`: only the lenses for the file classes present; skip `tests` when no logic changed.
- `thorough` (default): the table above.
- `comprehensive`: add `architecture`, Step 3 research, and the deployment verification writer at `references/personas/sf-deployment-verification-agent.md`.
