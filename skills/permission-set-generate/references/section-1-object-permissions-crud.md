# Section 1: Object permissions (CRUD)

Read with `permission-set-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Section 1: Object permissions (CRUD)</span>
```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzM3LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
<objectPermissions>
    <allowCreate>true</allowCreate>
    <allowRead>true</allowRead>
    <allowEdit>true</allowEdit>
    <allowDelete>false</allowDelete>
    <modifyAllRecords>false</modifyAllRecords>
    <viewAllRecords>false</viewAllRecords>
    <viewAllFields>false</viewAllFields>
    <object>Account</object>
</objectPermissions>
```

**<span data-proof="authored" data-by="ai:claude">Default to least privilege.</span>** <span data-proof="authored" data-by="ai:claude">Start with read-only; add Create/Edit/Delete only when the user explicitly asked for them.</span>

<span data-proof="authored" data-by="ai:claude">`modifyAllRecords`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`viewAllRecords`</span> <span data-proof="authored" data-by="ai:claude">are</span> **<span data-proof="authored" data-by="ai:claude">dangerous broad grants</span>** <span data-proof="authored" data-by="ai:claude">— they bypass sharing rules. Default to</span> <span data-proof="authored" data-by="ai:claude">`false`</span> <span data-proof="authored" data-by="ai:claude">and require explicit user request to set</span> <span data-proof="authored" data-by="ai:claude">`true`.</span>

<span data-proof="authored" data-by="ai:claude">`viewAllFields`</span> <span data-proof="authored" data-by="ai:claude">similarly bypasses FLS. Default to</span> <span data-proof="authored" data-by="ai:claude">`false`.</span>

***

