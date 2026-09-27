---
name: doc
description: "Checklist for reviewing Salesforce planning documents for verifiability, feasibility, scope, security, flow coverage, coherence, and product value before code is written."
---

# Doc lens

Follow `contract.md` for procedure and finding format.

**Runs on:** `docs/plans/**`, `docs/brainstorms/**`, requirements docs, `STRATEGY.md`

## Checklist
- **DOC-1** Requirement or unit with no acceptance criteria or verification strategy — default severity HIGH.
- **DOC-2** Test plan missing a bulk (200-record) case, governor-boundary case, sharing/`System.runAs` scenario, or callout mock for an integration — default severity HIGH.
- **DOC-3** Unbounded record volume ("process all Accounts") with no batching, chunking, or large-data-volume strategy — default severity HIGH.
- **DOC-4** Infeasible platform assumption: callouts or heavy DML in a sync trigger/UI path, mixed DML, limit math that overflows, a feature, edition, or license the org lacks — default severity HIGH.
- **DOC-5** Deploy/package ordering or dependency assumed but not stated (package A present, post-install step, namespace collision) — default severity MEDIUM.
- **DOC-6** Required permissions, profiles, or permission sets not listed — default severity MEDIUM.
- **DOC-7** CRUD/FLS or sharing assumed without naming the enforcement layer (`WITH USER_MODE`, `with sharing`, `stripInaccessible`) — default severity HIGH.
- **DOC-8** Credentials outside Named/External Credentials, unspecified OAuth flow, or new guest/Experience site with no guest permission shape — default severity CRITICAL.
- **DOC-9** OWD or sharing-model change with no re-share or data-migration plan for existing records — default severity HIGH.
- **DOC-10** Unhandled trigger context (update, delete, undelete) or run-as context (admin, standard, community, integration user) — default severity HIGH.
- **DOC-11** Missing error, empty, null/blank-data, or new-org flows; one-time data fix with no owner or tooling — default severity MEDIUM.
- **DOC-12** UI named vaguely: no placement (record page, app page, utility, modal), no loading/empty/error/no-access states, no SLDS or accessibility plan — default severity MEDIUM.
- **DOC-13** Hidden org-shape assumption (Person Accounts, multi-currency, multi-language, record types) — default severity MEDIUM.
- **DOC-14** Non-obvious choice stated as obvious with no tradeoff (Flow vs Apex, Queueable vs Batch, Platform Event vs CDC) — default severity MEDIUM.
- **DOC-15** Internal contradiction: sections disagree on approach, signatures, success criteria vs scope, or terminology drifts (`Account` vs `Account__c`) — default severity MEDIUM.
- **DOC-16** Scope creep: "while we're at it" refactors, premature fflib, custom permission framework, generic engine for one case — default severity MEDIUM.
- **DOC-17** Product value unclear: premise unsupported by data, user (admin/end-user/partner) unnamed, goal and work misaligned — default severity MEDIUM.
- **DOC-18** Rebuilds a standard Salesforce feature or AppExchange product with no build-vs-buy rationale — default severity LOW.
