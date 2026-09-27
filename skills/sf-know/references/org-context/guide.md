# Org context: ask the org, not memory

Before writing or reviewing anything that names an object, field, metadata type, or query, get the fact from the org or the project. Use the **first available** source in each row; tools are matched by name regardless of server prefix (e.g. `mcp__…__validate_soql`). Every row has a CLI fallback, so this works on every harness.

| Need | 1. Salesforce plugin tools (if loaded) | 2. `@salesforce/mcp` | 3. `sf` CLI fallback |
|---|---|---|---|
| Object fields, types, picklists | — | `run_soql_query` on `FieldDefinition` | `sf sobject describe --sobject Account --target-org <a> --json` |
| Metadata type shape (what XML elements are valid) | `search_metadata_types`, `get_metadata_type_fields`, `get_metadata_type_context` | — | Retrieve one real example: `sf project retrieve start --metadata <Type>:<Name>` and follow it |
| Is this SOQL valid / selective? | `validate_soql`, `check_soql_selectivity` | `run_soql_query` with `LIMIT 1` | `sf data query --query "<soql> LIMIT 1" --target-org <a> --json`; query plan: `sf api request rest "/services/data/v66.0/query?explain=<url-encoded soql>" --target-org <a>` (beta command) |
| Apex compile errors before deploy | `apex.diagnostics` | — | `sf project deploy start --dry-run --source-dir <paths>` |
| Flow generation grounded in org metadata | `execute_metadata_action` (metadata-experts) | — | `/sf-generate type:flow` guide |
| Run tests | — | `run_apex_test` | `sf apex run test --tests <Class> --code-coverage --json` |
| What exists in the org | — | — | `sf org list metadata --metadata-type ApexClass --target-org <a> --json` |

The "Salesforce plugin tools" are the `salesforce-api-context`, `salesforce-metadata-experts`, and `salesforce-lsp` MCP servers shipped by Salesforce's `salesforce-development` Claude Code plugin (`/plugin install salesforce-development@claude-plugins-official`). They are optional: `salesforce-api-context` is a beta endpoint and needs `sfdx-project.json` plus an authorized org; `salesforce-lsp` runs locally. This plugin does not bundle them.

## Rules

- **Never invent an API name.** If no source above can confirm a field or type, say so and ask.
- **Prefer read-only calls.** Describe, query with `LIMIT`, dry-run. Anything that writes goes through `/sf-deploy` and its safety rules.
- **Name the org** you asked (alias and type) when a fact came from it; sandbox and production can differ.
- **Compound what you learn.** An org fact that surprised you (a required field, a validation rule, a managed-package dependency) belongs in `docs/solutions/` via `/sf-compound`, so the next plan starts with it.
