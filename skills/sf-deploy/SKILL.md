---
name: sf-deploy
description: "Validate, deploy, retrieve, and delete Salesforce metadata; manage orgs, manifests, test runs, and test data; set up the environment. Use for 'deploy', 'validate', 'retrieve', 'package.xml', 'scratch org', 'setup'."
argument-hint: "mode:<validate|deploy|quick|retrieve|destructive|manifest|test|data|org|setup|cli> [target org or paths]"
---

# /sf-deploy

> **Principles enforced:** 1 (quality ceiling), 2 (verifiability). See `PRINCIPLES.md`.

## Modes

First argument `mode:<name>` selects a mode; infer it from the request if absent. Load only the guide you need.

| Mode | Use for | Guide |
|---|---|---|
| `validate` | Check-only deploy with tests; returns a job ID for quick deploy | `references/deploy/guide.md` |
| `deploy` | Deploy source to an org | `references/deploy/guide.md` |
| `quick` | Deploy a validated job without re-running tests | `references/deploy/guide.md` |
| `retrieve` | Pull metadata from an org | `references/deploy/guide.md` |
| `destructive` | Delete metadata with a destructive manifest | `references/deploy/guide.md` |
| `manifest` | Build `package.xml` from source, a diff, or the org | `references/deploy/guide.md` |
| `test` | Run Apex tests and read coverage | `references/deploy/guide.md` |
| `data` | Seed or export test data | `references/org/guide.md` |
| `org` | Create, list, open, switch orgs (scratch, sandbox) | `references/org/guide.md` |
| `setup` | Check CLI, project, MCP servers, and plugin install | `references/setup/guide.md` |
| `cli` | Look up `sf` command syntax | `references/cli/guide.md` |

## Safety rules (always)

1. **Know the target.** Before any deploy, retrieve, or delete, run `sf org display --target-org <alias> --json` and state the org's username and whether it is production (`IsSandbox=false`). If unsure, stop and ask.
2. **Production:** validate first (`sf project deploy validate`), then `sf project deploy quick --job-id <id>`. Never deploy straight to production and never with `--test-level NoTestRun`.
3. **Destructive changes** need an explicit user confirmation that names each component being deleted.
4. **Read failures completely.** On failure, report each component error with file and line, fix, and re-validate. Hand persistent failures to `/sf-debug`.
5. The plugin's `sfce-deploy-gate` hook enforces 1–3 on Claude Code; follow them yourself on every other harness.
