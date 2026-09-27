# Composition pattern (multiple components sharing LDS)

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Composition pattern (multiple components sharing LDS)
Two LWCs each with their own GraphQL `@wire` on the same data share the LDS cache automatically — no parent→child plumbing required.

```html
<!-- parent.html -->
<c-account-list></c-account-list>
<c-account-editor></c-account-editor>
```

When `c-account-editor` mutates (via either `executeMutation` or `uiRecordApi`), LDS invalidates the cache and `c-account-list`'s wire re-fires on its own. Cross-component reactivity is free.

---

