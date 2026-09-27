---
name: lwc
description: "Runs when the diff touches Lightning Web Component bundles (lwc/**) or Aura bundles (aura/**) being migrated to LWC."
---

# LWC lens

Follow `contract.md` for procedure and finding format.

**Runs on:** `**/lwc/**/*.{js,html,css,js-meta.xml}`, `**/aura/**`

## Tools first
- `sf code-analyzer run --rule-selector eslint --target <changed lwc dirs>`
- `npx @salesforce-ux/slds-linter lint <changed lwc dirs>`
- grep leaks: `addEventListener|setInterval|subscribe\(` then confirm a matching removal in `disconnectedCallback`
- grep a11y: `<(div|span)[^>]*onclick=` and `<lightning-(input|combobox|textarea)(?![^>]*label=)`

## Checklist
- **LWC-1** Apex/imperative call or state write in `renderedCallback` without a run-once guard — default severity HIGH.
- **LWC-2** Window/document listeners, `setInterval`/`setTimeout`, LMS or `empApi` subscriptions not released in `disconnectedCallback` — default severity HIGH.
- **LWC-3** `@wire` to an Apex method lacking `@AuraEnabled(cacheable=true)`, or a cacheable method doing DML — default severity HIGH.
- **LWC-4** Child mutates an `@api` property or a parent-owned object, or reaches into the parent DOM — default severity HIGH.
- **LWC-5** Click handler on `div`/`span` with no `role`, `tabindex="0"`, and key handler — default severity HIGH. WCAG 2.1.1.
- **LWC-6** Inputs without a label (or `variant="label-hidden"` with no `label`); meaningful icons/images without `alternative-text`/`alt` — default severity HIGH. WCAG 1.1.1, 4.1.2.
- **LWC-7** Stale UI after imperative DML: no `refreshApex`/`notifyRecordUpdateAvailable`; or `refreshApex` fired on every keystroke/save — default severity MEDIUM.
- **LWC-8** Custom Apex where LDS/UI API (`getRecord`, `updateRecord`, `lightning-record-*-form`) covers the need — default severity MEDIUM.
- **LWC-9** `@wire` handler with no `error` branch, or imperative promise with no `catch`/error UI — default severity MEDIUM.
- **LWC-10** `for:each` without a unique stable `key` (index or missing) — default severity MEDIUM.
- **LWC-11** Heavy work or state mutation in getters/template-bound methods; derive values once when data arrives — default severity MEDIUM.
- **LWC-12** Unbounded record lists rendered with no pagination, infinite loading, or lazy render — default severity MEDIUM.
- **LWC-13** Dynamic status/errors not in an `aria-live` region; modal/panel opens without moving focus or restoring it on close — default severity MEDIUM. WCAG 4.1.3, 2.4.3.
- **LWC-14** Hardcoded colors/spacing, `!important`, or overrides of internal `slds-*` classes instead of SLDS styling hooks (`--slds-g-*`); state shown by color only — default severity MEDIUM. WCAG 1.4.1, 1.4.3.
- **LWC-15** CustomEvent name not lowercase-only, starts with `on`, or uses `bubbles`+`composed` with no cross-shadow need — default severity MEDIUM.
- **LWC-16** Aura migration: application events ported to a hand-rolled pubsub instead of Lightning Message Service; `$A`/`force:*` events not replaced by `lightning/navigation`, `lightning/platformShowToastEvent` — default severity MEDIUM.
- **LWC-17** Aura migration parity gaps: `aura:attribute` not mapped to `@api`, change handlers not turned into setters, `.js-meta.xml` targets/`recordId` exposure dropped — default severity MEDIUM.
- **LWC-18** Legacy `if:true`/`if:false` in new code (use `lwc:if`), or `@track` on primitives/reassigned fields — default severity LOW.
