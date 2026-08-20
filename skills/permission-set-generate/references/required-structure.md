# Required structure

Read with `permission-set-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Required structure</span>
<span data-proof="authored" data-by="ai:claude">Every permission set needs at minimum:</span>

```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6Mzg3LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>YourPermissionSetName</fullName>
    <label>Human-Friendly Display Name</label>
    <description>One sentence stating purpose AND intended audience.</description>
    <hasActivationRequired>false</hasActivationRequired>
    <license>Salesforce</license>
</PermissionSet>
```

<span data-proof="authored" data-by="ai:claude">Naming conventions:</span>

* **<span data-proof="authored" data-by="ai:claude">API name</span>** <span data-proof="authored" data-by="ai:claude">(`<fullName>`): descriptive snake-case (e.g.,</span> <span data-proof="authored" data-by="ai:claude">`Sales_Manager_Access`,</span> <span data-proof="authored" data-by="ai:claude">`Order_Mgmt_App_User`).</span>

* **<span data-proof="authored" data-by="ai:claude">Label</span>**<span data-proof="authored" data-by="ai:claude">: human-readable display name.</span>

* **<span data-proof="authored" data-by="ai:claude">Description</span>**<span data-proof="authored" data-by="ai:claude">: mandatory. Must state the</span> **<span data-proof="authored" data-by="ai:claude">intended audience</span>** <span data-proof="authored" data-by="ai:claude">— "Grants Sales Managers full CRUD on Opportunity, Account, and Lead, plus View All on related custom objects." Generic descriptions are a Principle 5 fail.</span>

***

