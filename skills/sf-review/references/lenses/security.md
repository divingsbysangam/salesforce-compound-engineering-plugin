---
name: security
description: "Runs on changed Apex, LWC, Aura, Visualforce, and Experience Cloud/sharing metadata (CRUD/FLS, sharing, injection, XSS, secrets, exposure)."
---

# Security lens

Follow `contract.md` for procedure and finding format.

**Runs on:** `**/*.cls`, `**/*.trigger`, `**/lwc/**`, `**/aura/**`, `**/*.page`, `**/*.component`, `**/*.{sharingRules,profile,permissionset,site}-meta.xml`

## Tools first
- `sf code-analyzer run --rule-selector pmd:Security eslint retire-js --target <files>` (`ApexCRUDViolation`, `ApexSOQLInjection`, `ApexSharingViolations`, `ApexXSSFromURLParam`, `ApexSuggestUsingNamedCred`)
- Dynamic query: `grep -nE 'Database\.(query|countQuery|getQueryLocator)\(|Search\.query\('`
- Unsafe DOM: `grep -nE 'innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function\(|lwc:dom="manual"|escape="false"'`
- Secrets: `grep -niE '(password|secret|api_?key|token|bearer).{0,6}[=:]'`

## Checklist
- **SEC-1** Dynamic SOQL/SOSL concatenating caller input without bind variables (`Database.queryWithBinds`) or `String.escapeSingleQuotes` — default severity CRITICAL.
- **SEC-2** User-controlled data into `innerHTML`/`eval`/`document.write` (LWC/Aura), `escape="false"` or unencoded merge fields in VF (no `HTMLENCODE`/`JSENCODE`) — default severity CRITICAL.
- **SEC-3** Hardcoded credentials/tokens instead of Named Credentials — default severity CRITICAL.
- **SEC-4** Guest-user/Experience Cloud reachable Apex (`@AuraEnabled`, `@RemoteAction`, `@RestResource`) running `without sharing` or returning records beyond the guest's intent; guest profile/permset granting edit/view-all — default severity CRITICAL.
- **SEC-5** `without sharing` on a class with `@AuraEnabled`/`@RemoteAction`/`@RestResource`/`webservice` entry points without a stated justification — default severity HIGH.
- **SEC-6** SOQL on a user-facing path without `WITH USER_MODE` (or legacy `WITH SECURITY_ENFORCED`) or `Security.stripInaccessible(AccessType.READABLE, …)` — default severity HIGH.
- **SEC-7** DML on a user-facing path without `AccessLevel.USER_MODE`/`as user`, `stripInaccessible` (CREATABLE/UPDATABLE), or `isCreateable/isUpdateable/isDeletable` check — default severity HIGH.
- **SEC-8** `global` Apex classes/methods not required by a managed package, MCP exposure, or `webservice` — default severity HIGH.
- **SEC-9** Entry-point method accepts an Id/SObject from the client and queries or updates it without verifying the caller can access that record — default severity HIGH.
- **SEC-10** Apex class with no sharing keyword (implicitly inherits or runs system mode) where it holds entry points; utilities should declare `inherited sharing` — default severity MEDIUM.
- **SEC-11** `WITH SECURITY_ENFORCED` in new code; prefer `WITH USER_MODE` — default severity MEDIUM.
- **SEC-12** Apex managed sharing: `__Share` rows without a custom `RowCause`, or access level broader than needed — default severity MEDIUM.
- **SEC-13** Open redirect: `PageReference`/`window.location`/`NavigationMixin` URL built from request params unvalidated — default severity MEDIUM.
- **SEC-14** Sensitive data (PII, tokens, session Id) in `System.debug`, `console.log`, or `CustomEvent` detail with `bubbles/composed: true` — default severity MEDIUM.
- **SEC-15** Third-party script loaded outside `platformResourceLoader` static resources, or from a CDN/outdated library — default severity MEDIUM.
