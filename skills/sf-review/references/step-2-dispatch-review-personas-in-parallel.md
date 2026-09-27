# Step 2: Dispatch Review Lenses in Parallel

Read with `sf-review/SKILL.md`. Procedure lives here.

Review lenses are checklists at `references/lenses/<name>.md`, not registered agents. Dispatch **one subagent per applicable lens**, all in the same response, per `../../sf-work/references/dispatch/guide.md`. On a harness without subagents, apply the lenses inline one after another.

Each subagent gets: the lens file path, `references/lenses/contract.md`, and the **list of changed file paths** (not their contents). It returns finding lines per the contract.

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

## Depth

- `fast`: only the lenses for the file classes present; skip `tests` when no logic changed.
- `thorough` (default): the table above.
- `comprehensive`: add `architecture`, Step 3 research, and the deployment verification writer at `references/personas/sf-deployment-verification-agent.md`.
