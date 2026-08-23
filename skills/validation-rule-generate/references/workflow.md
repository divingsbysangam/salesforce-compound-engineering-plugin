# Workflow

Read with `validation-rule-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Workflow</span>

1. **<span data-proof="authored" data-by="ai:claude">Gather inputs.</span>** <span data-proof="authored" data-by="ai:claude">Object, intent, blocking condition, error message text. Ask clarifying questions only if the condition is genuinely ambiguous.</span>
2. **<span data-proof="authored" data-by="ai:claude">Verify field availability.</span>** <span data-proof="authored" data-by="ai:claude">Confirm every field referenced exists on the object. Hint: read the object metadata file.</span>
3. **<span data-proof="authored" data-by="ai:claude">Author the formula.</span>** <span data-proof="authored" data-by="ai:claude">Apply the function-correctness rules above.</span>
4. **<span data-proof="authored" data-by="ai:claude">Choose CDATA wrap if needed.</span>**
5. **<span data-proof="authored" data-by="ai:claude">Write the file.</span>** <span data-proof="authored" data-by="ai:claude">Path + extension as above.</span>
6. **<span data-proof="authored" data-by="ai:claude">Validate</span>** <span data-proof="authored" data-by="ai:claude">with</span> <span data-proof="authored" data-by="ai:claude">`sf code-analyzer run --target <path>`</span> <span data-proof="authored" data-by="ai:claude">and remediate findings.</span>
7. **<span data-proof="authored" data-by="ai:claude">Dispatch review</span>** <span data-proof="authored" data-by="ai:claude">—</span> <span data-proof="authored" data-by="ai:claude">`validation-rule-reviewer`</span> <span data-proof="authored" data-by="ai:claude">agent for formula quality, message UX, edge cases.</span>
8. **<span data-proof="authored" data-by="ai:claude">Report.</span>**

### Fail-closed contract

Each named check requires a tool invocation. Do not report the check as passing because the tool was skipped, timed out, returned empty/uncertain output, or is not installed. Attempt preferred, then fallback, then record `<check>=unavailable: <reason>`. An empty success payload is not a pass.

| Check    | Preferred                                                                                | Fallback                                                | Report line                                            |
| -------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Analyzer | `sf code-analyzer run --target <path> --json`                                            | MCP `run_code_analyzer` if registered                   | `Analyzer: ...` or `analyzer=unavailable: <reason>`    |
| Compile  | `sf project deploy start --dry-run --metadata ValidationRule:<Object>.<fullName> --json` | `sf project deploy validate --json` with the same scope | `Compile: <output>` or `compile=unavailable: <reason>` |

***