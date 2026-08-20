---
name: graphql-patterns
description: GraphQL Wire Adapter patterns for LWC — queries, mutations, refresh, error handling, and the Apex-vs-GraphQL decision (including the metadata-access permission gotcha)
scope: LWC_ONLY
---

# GraphQL Patterns for LWC

**SCOPE: LWC_ONLY** — This skill applies to Lightning Web Components that talk to the Salesforce UI API via GraphQL (`lightning/uiGraphQLApi` and `lightning/graphql`). For pure Apex data access, use `apex-patterns`. For component-level state/comm patterns, use `lwc-patterns`. For integration with external GraphQL servers, use `integration-patterns`.

---

## Required reads

Procedure lives in sibling files, not only in this orchestrator:

- **Decision: GraphQL vs Apex vs uiRecordApi** — read `references/decision-graphql-vs-apex-vs-uirecordapi.md` before acting on this section.
- **Permission model — the metadata gotcha (READ THIS)** — read `references/permission-model-the-metadata-gotcha-read-this.md` before acting on this section.
- **Module choice** — read `references/module-choice.md` before acting on this section.
- **Query basics** — read `references/query-basics.md` before acting on this section.
- **Variables (reactive parameters)** — read `references/variables-reactive-parameters.md` before acting on this section.
- **Nested relationships (the killer feature)** — read `references/nested-relationships-the-killer-feature.md` before acting on this section.
- **Mutations (Create / Update / Delete)** — read `references/mutations-create-update-delete.md` before acting on this section.
- **Refresh patterns** — read `references/refresh-patterns.md` before acting on this section.
- **Error handling** — read `references/error-handling.md` before acting on this section.
- **Security: GraphQL string escaping** — read `references/security-graphql-string-escaping.md` before acting on this section.
- **Composition pattern (multiple components sharing LDS)** — read `references/composition-pattern-multiple-components-sharing-lds.md` before acting on this section.
- **Working reference** — read `references/working-reference.md` before acting on this section.
- **Common pitfalls** — read `references/common-pitfalls.md` before acting on this section.
