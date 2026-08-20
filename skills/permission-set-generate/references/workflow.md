# Workflow

Read with `permission-set-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Workflow</span>
1. **<span data-proof="authored" data-by="ai:claude">Gather scope.</span>** <span data-proof="authored" data-by="ai:claude">Audience, objects, fields, tabs, apps, system perms.</span>
2. **<span data-proof="authored" data-by="ai:claude">Apply least privilege.</span>** <span data-proof="authored" data-by="ai:claude">Strip every flag that wasn't explicitly requested.</span>
3. **<span data-proof="authored" data-by="ai:claude">Verify references.</span>** <span data-proof="authored" data-by="ai:claude">Every object, field, tab, app, class, page must exist in the project.</span>
4. **<span data-proof="authored" data-by="ai:claude">Author the XML.</span>** <span data-proof="authored" data-by="ai:claude">One section at a time, top-to-bottom (object → FLS → tab → app → user perms → class → page).</span>
5. **<span data-proof="authored" data-by="ai:claude">Validate.</span>**<span data-proof="authored" data-by="ai:claude"></span> <span data-proof="authored" data-by="ai:claude">`sf code-analyzer run --target <path> --json`.</span>
6. **<span data-proof="authored" data-by="ai:claude">Dispatch review.</span>**<span data-proof="authored" data-by="ai:claude"></span> <span data-proof="authored" data-by="ai:claude">`metadata-consistency-checker`</span> <span data-proof="authored" data-by="ai:claude">for cross-references;</span> <span data-proof="authored" data-by="ai:claude">`security-guide`</span> <span data-proof="authored" data-by="ai:claude">should be consulted for sharing implications (this is reading, not dispatch — the skill is reference-shaped).</span>
7. **<span data-proof="authored" data-by="ai:claude">Deploy.</span>**<span data-proof="authored" data-by="ai:claude"></span> <span data-proof="authored" data-by="ai:claude">`sf project deploy start --metadata PermissionSet:<Name>`.</span>
8. **<span data-proof="authored" data-by="ai:claude">Assign for testing.</span>**<span data-proof="authored" data-by="ai:claude"></span> <span data-proof="authored" data-by="ai:claude">`sf org assign permset --name <Name> --target-org <alias>`.</span>

***

