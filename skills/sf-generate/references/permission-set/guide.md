# <span data-proof="authored" data-by="ai:claude">/permission-set-generate</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling — overly-broad perms are a security regression), 5 (taste — perm set names matter), 7 (institutional memory). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## <span data-proof="authored" data-by="ai:claude">Required reads</span>

<span data-proof="authored" data-by="ai:claude">Procedure lives in sibling files, not only in this orchestrator:</span>

* **<span data-proof="authored" data-by="ai:claude">When to use</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/when-to-use.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Step 0: Research (Principle 7)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/step-0-research-principle-7.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Required structure</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/required-structure.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Section 1: Object permissions (CRUD)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/section-1-object-permissions-crud.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Section 2: Field-level security (FLS)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/section-2-field-level-security-fls.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Section 3: Tab settings</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/section-3-tab-settings.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Section 4: App visibility</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/section-4-app-visibility.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Section 5: User permissions (system permissions)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/section-5-user-permissions-system-permissions.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Section 6: Apex class access</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/section-6-apex-class-access.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Section 7: Page access (Visualforce)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/section-7-page-access-visualforce.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Hard constraints (Principle 1)</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/hard-constraints-principle-1.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Workflow</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/workflow.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Output report</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/output-report.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

* **<span data-proof="authored" data-by="ai:claude">Inspiration</span>** <span data-proof="authored" data-by="ai:claude">— read</span> <span data-proof="authored" data-by="ai:claude">`references/inspiration.md`</span> <span data-proof="authored" data-by="ai:claude">before acting on this section.</span>

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Generate a Salesforce Permission Set (PermissionSet XML) with the minimum permissions
needed to do the job. Default to least privilege: allowDelete=false, modifyAllRecords=false,
viewAllRecords=false unless the user explicitly asked for a wider grant. Always set
description with the intended audience. Fail-closed: sf code-analyzer, then a PermissionSet
dry-run. Dispatch `metadata lens`. Consult `sf-know topic:security` for sharing.
Place at force-app/main/default/permissionsets/<Name>.permissionset-meta.xml. Paste actual
tool output on Analyzer / Compile lines, or `<check>=unavailable: <reason>` after the fallback.
```

## Cross-skill integration

| Need | Delegate to | Reason |
| --- | --- | --- |
| Missing objects / fields / tabs / apps | `sf-generate type:metadata` | Perm set cannot reference absent metadata |
| Sharing / OWD / CRUD-FLS policy | `sf-know topic:security` | Reference |
| Lightning app that needs this perm set | `sf-generate type:lightning-page` | App orchestration |
| Deploy / assign perm set | `sf-deploy mode:cli` | Fail-closed deploy and `sf org assign permset` |
| Capture a least-privilege judgment | `sf-compound` | Institutional memory |