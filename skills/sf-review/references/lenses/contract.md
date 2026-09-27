# Lens contract

Every lens is a checklist run by one subagent over the files it is given. The dispatching skill passes **file paths, not file contents**; the subagent reads what it needs.

## Procedure

1. **Tools first.** Run the lens's "Tools first" commands when they are available (Code Analyzer, `sf project deploy validate --dry-run`, grep), and the org-context tools in `../../../sf-know/references/org-context/guide.md` (e.g. `validate_soql`, `apex.diagnostics`) when loaded. A tool result is evidence; do not re-derive by reading what a tool already proved.
2. **Check.** Walk the lens checklist against the changed lines and the code they call. Skip items that do not apply to the files given.
3. **Report only real findings.** No praise, no summaries, no restating the checklist. If nothing is wrong, return `NO FINDINGS`.

## Finding format (one line each)

```
SEVERITY | CONFIDENCE | path:line | RULE-ID | problem — fix
```

- `SEVERITY`: `CRITICAL` (security hole, data loss, limit breach in production paths), `HIGH` (will fail under bulk or real data), `MEDIUM` (maintainability or risk), `LOW` (nit).
- `CONFIDENCE`: `HIGH`, `MEDIUM`, or `LOW`, per `../subagent-confidence-rubric.md`.
- `RULE-ID`: the checklist ID from the lens (for example `APX-3`).
- Keep each line under about 200 characters. Add at most one indented line of evidence (a count, a query, a failing assertion) when confidence is `HIGH`.
