# Output report

Read with `permission-set-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Output report</span>

```
Generated:
- force-app/main/default/permissionsets/<Name>.permissionset-meta.xml

Audience:    {one sentence — who this is for}

Grants:
- Object permissions: {n} (CRUD breakdown: C=N, R=N, E=N, D=N)
- FLS:                {n} fields
- Tabs:               {n} tabs ({Visible|Available} count)
- Apps:               {n} apps
- User perms:         {list of system perms granted}
- Apex classes:       {n}
- Pages:              {n}

Broad-grant flags (audit these explicitly):
- modifyAllRecords:   {set on N objects} or "none"
- viewAllRecords:     {set on N objects} or "none"
- viewAllFields:      {set on N objects} or "none"
- ViewAllData:        {true|false}
- ModifyAllData:      {true|false}

Analyzer:    {sev0=0, sev1=0, sev2=0} or "unavailable: <reason>"
Compile:     {dry-run deploy JSON summary} or "unavailable: <reason>"
Review:      metadata-consistency-checker — {findings count}

Cross-references verified: every object, field, tab, app, class, page exists.
```

***