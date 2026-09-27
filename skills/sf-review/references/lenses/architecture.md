---
name: architecture
description: "Triggered at comprehensive depth by Apex classes, triggers, LWC, Flow, or metadata changes that add or restructure code."
---

# Architecture lens

Follow `contract.md` for procedure and finding format.

**Runs on:** comprehensive depth only

## Tools first
- `git log --oneline -20 -- <file>` and `git log --follow -p -- <file>` (churn, prior fixes, reverts)
- `git log -S "<symbol>" --oneline` (when a pattern was introduced or removed)
- `grep -rnE "\[\s*SELECT|insert |update |delete |Database\." <trigger and handler files>` (logic below the handler layer)
- `grep -rn "<method or label name>" force-app/` (confirm a symbol is still referenced)

## Checklist
- **ARC-1** Change can fail in production under concurrent saves, Flow/trigger fan-out, or entry near SOQL/heap limits — default severity HIGH. Name the concrete scenario.
- **ARC-2** Code assumes a user holds a permset/FLS or a data shape not guaranteed (profile-only user, refreshed sandbox) — default severity HIGH.
- **ARC-3** Trigger body contains logic, SOQL, or DML instead of delegating to a handler — default severity HIGH.
- **ARC-4** Layer violation: handler with business logic, service with inline SOQL, selector with side effects — default severity MEDIUM.
- **ARC-5** Handler mixes unrelated objects or concerns (Contact rollups and Case escalation in `AccountTriggerHandler`) — default severity MEDIUM.
- **ARC-6** Wrong async shape: Queueable where sync suffices, chained Queueables where Batchable fits — default severity MEDIUM.
- **ARC-7** Service method exposed as `@AuraEnabled` rather than via a thin controller — default severity MEDIUM.
- **ARC-8** Diverges from an established project pattern (handler framework, selector, factory) instead of reusing it — default severity MEDIUM. Cite the existing file.
- **ARC-9** Logic duplicated from an existing class or method — default severity MEDIUM. Cite the original.
- **ARC-10** Cross-module coupling: one service reaching into another object's internals, or handlers calling each other directly — default severity MEDIUM.
- **ARC-11** File is a git hot-spot (repeated fixes/reverts) and the change adds to it without addressing the cause — default severity MEDIUM.
- **ARC-12** Over-engineering: interface or abstract class with one implementation, generic framework for one use, unused extension points — default severity MEDIUM.
- **ARC-13** Custom Apex/LWC replacing a native feature (formula, Flow, standard component, sharing rule) — default severity MEDIUM.
- **ARC-14** Hardcoded IDs, magic numbers, or strings that belong in Custom Metadata or Labels — default severity MEDIUM.
- **ARC-15** Dead code: unreferenced methods, fields, or labels; commented-out blocks; unused parameters — default severity LOW.
- **ARC-16** Vague naming (`Helper`/`Util`/`Manager` suffixes, `process()`/`doIt()`, flag fields that do not say what they mark) — default severity LOW.
- **ARC-17** Stale comment: old TODO, or doc describing behavior the code no longer has — default severity LOW.
