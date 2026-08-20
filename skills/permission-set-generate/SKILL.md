---
name: permission-set-generate
description: "Generate Salesforce Permission Set metadata (PermissionSet XML) with object permissions, field-level security (FLS), tab visibility, app visibility, and user permissions. Use when creating a new permission set, granting CRUD on objects, configuring FLS for sensitive fields, or assigning system permissions. Trigger phrases: 'create a permission set', 'grant access to', 'add CRUD permissions for', 'configure FLS for', 'permission set for the app', 'allow users to access', 'grant the View All permission'. Pairs with `metadata-consistency-checker` and `security-guide`."
argument-hint: "[permission set name + scope, e.g. 'Sales_Manager_Access for Account, Opportunity, Lead with View All']"
---

# <span data-proof="authored" data-by="ai:claude">/permission-set-generate</span>

> **<span data-proof="authored" data-by="ai:claude">Principles enforced:</span>** <span data-proof="authored" data-by="ai:claude">1 (preserve the quality ceiling — overly-broad perms are a security regression), 5 (taste — perm set names matter), 7 (institutional memory). See</span> <span data-proof="authored" data-by="ai:claude">`PRINCIPLES.md`.</span>

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **When to use** — read `references/when-to-use.md` before acting on this section.
- **Step 0: Research (Principle 7)** — read `references/step-0-research-principle-7.md` before acting on this section.
- **Required structure** — read `references/required-structure.md` before acting on this section.
- **Section 1: Object permissions (CRUD)** — read `references/section-1-object-permissions-crud.md` before acting on this section.
- **Section 2: Field-level security (FLS)** — read `references/section-2-field-level-security-fls.md` before acting on this section.
- **Section 3: Tab settings** — read `references/section-3-tab-settings.md` before acting on this section.
- **Section 4: App visibility** — read `references/section-4-app-visibility.md` before acting on this section.
- **Section 5: User permissions (system permissions)** — read `references/section-5-user-permissions-system-permissions.md` before acting on this section.
- **Section 6: Apex class access** — read `references/section-6-apex-class-access.md` before acting on this section.
- **Section 7: Page access (Visualforce)** — read `references/section-7-page-access-visualforce.md` before acting on this section.
- **Hard constraints (Principle 1)** — read `references/hard-constraints-principle-1.md` before acting on this section.
- **Workflow** — read `references/workflow.md` before acting on this section.
- **Output report** — read `references/output-report.md` before acting on this section.
- **Inspiration** — read `references/inspiration.md` before acting on this section.

## <span data-proof="authored" data-by="ai:claude">Copy-paste-to-agent</span>

```
Generate a Salesforce Permission Set (PermissionSet XML) with the minimum permissions
needed to do the job. Default to least privilege: allowDelete=false, modifyAllRecords=false,
viewAllRecords=false unless the user explicitly asked for a wider grant. Always set
description with the intended audience. Always validate with metadata-consistency-checker
that referenced objects, fields, tabs, and apps actually exist. Place the file at
force-app/main/default/permissionsets/<Name>.permissionset-meta.xml.
```
