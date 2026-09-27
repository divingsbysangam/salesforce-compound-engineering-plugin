---
name: metadata
description: "Runs when the diff touches object, field, permission set, profile, layout, FlexiPage, sharing, destructive-change, or sfdx-project.json metadata."
---

# Metadata lens

Follow `contract.md` for procedure and finding format.

**Runs on:** `**/objects/**/*-meta.xml`, `**/*.permissionset-meta.xml`, `**/*.profile-meta.xml`, `**/*.layout-meta.xml`, `**/*.flexipage-meta.xml`, `**/*.sharingRules-meta.xml`, `**/destructiveChanges*.xml`, `sfdx-project.json`

## Tools first
- `sf project deploy validate --dry-run --source-dir <paths>` resolves missing-component and bad-reference errors.
- API version drift: `grep -rho '<apiVersion>[0-9.]*</apiVersion>' force-app | sort | uniq -c` vs `sourceApiVersion` in `sfdx-project.json`.
- New field without access: for each new `fields/<F>.field-meta.xml`, grep `<field><Obj>\.<F></field>` in `*.permissionset-meta.xml`.

## Checklist
- **MDT-1** Field, object, or picklist value deleted/renamed (or in `destructiveChanges*.xml`) while still referenced by Apex, flows, layouts, reports, or integrations — default severity CRITICAL. Grep the API name across the repo.
- **MDT-2** Lookup changed to Master-Detail, or new Master-Detail whose cascade delete removes children other systems reference — default severity CRITICAL.
- **MDT-3** New `<required>true</required>` field with no default or backfill plan — default severity HIGH. Existing records fail on next save.
- **MDT-4** Picklist value removed or restricted while existing data holds it — default severity HIGH. Needs a data migration step.
- **MDT-5** Permission removed from a permission set/profile that a running integration or scheduled-job user relies on — default severity HIGH.
- **MDT-6** OWD tightened or loosened (`sharingModel`), or sharing rule opening a Private object broadly — default severity HIGH.
- **MDT-7** Layout, FlexiPage, compact layout, or permission set references a field/component not in source or org — default severity HIGH.
- **MDT-8** `viewAllRecords`/`modifyAllRecords` or `ModifyAllData`/`ViewAllData` granted in a new permission set — default severity HIGH.
- **MDT-9** New custom field or object with no FLS/object access in any permission set — default severity MEDIUM.
- **MDT-10** New field, layout, or record-type access granted only via profile instead of permission set — default severity MEDIUM.
- **MDT-11** Integration key field without `<externalId>true</externalId>` (and `unique` where applicable) — default severity MEDIUM.
- **MDT-12** Field holding PII/sensitive data with no `securityClassification`/`complianceGroup` — default severity MEDIUM.
- **MDT-13** Many-to-many modeled with multi-value text or duplicate lookups instead of a junction object — default severity MEDIUM.
- **MDT-14** Record type added without layout/FlexiPage assignment or picklist value mapping — default severity MEDIUM.
- **MDT-15** Files outside the `packageDirectories` declared in `sfdx-project.json`, or code crossing package boundaries — default severity MEDIUM.
- **MDT-16** `<apiVersion>` differs from `sourceApiVersion` or the project majority — default severity LOW.
- **MDT-17** Naming violates repo convention (field/test/class suffix) or CLAUDE.md/AGENTS.md rules — default severity LOW.
- **MDT-18** Custom field or object missing `<description>` or `<inlineHelpText>` for user-facing fields — default severity LOW.
