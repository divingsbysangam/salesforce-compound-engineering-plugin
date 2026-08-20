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

***

