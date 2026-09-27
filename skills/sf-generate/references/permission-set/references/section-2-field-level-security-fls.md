# Section 2: Field-level security (FLS)

Read with `permission-set-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Section 2: Field-level security (FLS)</span>
```xml proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTM0LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
<fieldPermissions>
    <readable>true</readable>
    <editable>true</editable>
    <field>Account.Industry</field>
</fieldPermissions>
```

<span data-proof="authored" data-by="ai:claude">For sensitive fields (e.g., SSN, salary, PII), set</span> <span data-proof="authored" data-by="ai:claude">`<readable>false</readable>`</span> <span data-proof="authored" data-by="ai:claude">for users who don't need them.</span>

<span data-proof="authored" data-by="ai:claude">For formula and Roll-up Summary fields, only</span> <span data-proof="authored" data-by="ai:claude">`<readable>`</span> <span data-proof="authored" data-by="ai:claude">matters (`<editable>`</span> <span data-proof="authored" data-by="ai:claude">is implicit-false because they're calculated).</span>

***

