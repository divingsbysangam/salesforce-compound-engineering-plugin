# Stage 6: POLISH (the back "bread" — conditional, UI surfaces only)

Read with `sf-lfg/SKILL.md`. Procedure lives here.

## Stage 6: POLISH (the back "bread" — conditional, UI surfaces only)
> **Principle 1 (preserve the quality ceiling) and Principle 5 (taste over typing):** correctness passed review; now make it *feel right*.

**Skip entirely** for pure Apex / Flow / metadata backend changes. **Run** only when the changed files include a front-end surface (LWC, Aura, Experience Cloud, or a React / headless client on UI-API / GraphQL).

Run `/sf-polish` — it resolves the changed UI scope, detects the front-end stack (LWC / Aura / Experience Cloud LWR / React-headless) via its stack-profile registry, and applies the matching design + accessibility (WCAG A/AA) + copy lens, dispatching the right agents (`sf-lwc-accessibility-guardian`, `sf-aura-migration-advisor`, …) and `/slds2-uplift`. It verifies with accessibility Jest tests and before/after screenshots where a preview exists.

**Gate (Principle 1):** No WCAG A/AA violations and no obvious UX or copy defects on the changed surface. Polished UI re-enters Stage 7 (TEST).

***

