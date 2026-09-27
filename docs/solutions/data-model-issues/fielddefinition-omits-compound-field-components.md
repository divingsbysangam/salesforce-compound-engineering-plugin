---
title: "FieldDefinition omits compound-field components (FirstName, LastName, BillingCity)"
date: 2026-09-27
category: data-model-issues
severity: medium
tags: ["fielddefinition", "soql", "compound-fields", "org-context", "schema"]
symptoms: "Querying FieldDefinition for Lead fields FirstName, LastName, Email, Company, Title, Website, Industry, LeadSource returned only 6 rows; FirstName and LastName were missing although the code using them compiles and SELECT FirstName, LastName FROM Lead works."
root_cause: "FieldDefinition returns the compound field (Lead.Name, Account.BillingAddress) but not its component fields. Component fields are real, queryable, and writable, but have no FieldDefinition row."
resolution: "Treat a missing FieldDefinition row as unconfirmed, not absent. Confirm with SELECT Id, <Field> FROM <Object> LIMIT 1 (INVALID_FIELD on a bad name) or sf sobject describe, which lists components. skills/sf-know/references/org-context/guide.md now states this caveat."
prevention: "Any skill that checks field existence before generating code must not conclude 'field does not exist' from FieldDefinition alone."
---

# FieldDefinition omits compound-field components

## Observed

Against a Developer Edition org (API v67.0), via a connected Salesforce MCP server:

- `SELECT QualifiedApiName FROM FieldDefinition WHERE EntityDefinition.QualifiedApiName = 'Lead' AND QualifiedApiName IN ('FirstName','LastName','Email',…)` → 6 of 8 rows; no `FirstName`, `LastName`.
- `SELECT Id, FirstName, LastName, Name FROM Lead LIMIT 1` → succeeds.
- `… EntityDefinition.QualifiedApiName = 'Account' AND QualifiedApiName IN ('BillingAddress','BillingCity','BillingStreet')` → only `BillingAddress`.
- `SELECT Id, Name, NotAField__c FROM Account LIMIT 1` → `INVALID_FIELD`, "No such column 'NotAField__c' on entity 'Account'", with row/column.

## Resolution

Use `FieldDefinition` for type and `IsIndexed` (useful for selectivity), and a `LIMIT 1` query or `sf sobject describe` to confirm existence. Recorded in `/sf-know topic:org-context`.
