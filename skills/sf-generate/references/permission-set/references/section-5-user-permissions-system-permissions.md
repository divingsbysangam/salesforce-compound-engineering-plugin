# Section 5: User permissions (system permissions)

Read with `permission-set-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Section 5: User permissions (system permissions)</span>
```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6OTEsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
<userPermissions>
    <enabled>true</enabled>
    <name>ViewSetup</name>
</userPermissions>
```

<span data-proof="authored" data-by="ai:claude">Common ones:</span>

| <span data-proof="authored" data-by="ai:claude">`<name>`</span>                | <span data-proof="authored" data-by="ai:claude">What it grants</span>                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`ViewAllData`</span>           | <span data-proof="authored" data-by="ai:claude">View all records on all objects (BROAD; use sparingly)</span> |
| <span data-proof="authored" data-by="ai:claude">`ModifyAllData`</span>         | <span data-proof="authored" data-by="ai:claude">Modify all records on all objects (DANGEROUS)</span>          |
| <span data-proof="authored" data-by="ai:claude">`ViewSetup`</span>             | <span data-proof="authored" data-by="ai:claude">Read-only access to Setup</span>                              |
| <span data-proof="authored" data-by="ai:claude">`ManageUsers`</span>           | <span data-proof="authored" data-by="ai:claude">Create / edit users</span>                                    |
| <span data-proof="authored" data-by="ai:claude">`ApiEnabled`</span>            | <span data-proof="authored" data-by="ai:claude">Use the API (most users need this)</span>                     |
| <span data-proof="authored" data-by="ai:claude">`ViewMyTeamsDashboards`</span> | <span data-proof="authored" data-by="ai:claude">Sales managers' dashboards</span>                             |

**<span data-proof="authored" data-by="ai:claude">Default to NOT granting</span>** **<span data-proof="authored" data-by="ai:claude">`ViewAllData`</span>** **<span data-proof="authored" data-by="ai:claude">or</span>** **<span data-proof="authored" data-by="ai:claude">`ModifyAllData`.</span>** <span data-proof="authored" data-by="ai:claude">These bypass the sharing model — a Principle 1 ceiling violation when granted casually.</span>

***

