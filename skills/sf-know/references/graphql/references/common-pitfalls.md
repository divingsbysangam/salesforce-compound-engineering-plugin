# Common pitfalls

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Common pitfalls
1. **Pagination cap silently truncates at `first: 100`** — for larger sets, use cursor pagination, not a higher `first:` value.
2. **`displayValue` is undefined for plain text fields** — only currency / date / percent / picklist labels populate it. Use `value` for text.
3. **GraphQL FLS is silent**: if the user lacks FLS on a selected field, it's dropped from the response (no error). Audit FLS for every running profile.
4. **GraphQL is NOT in `@AuraEnabled(cacheable=true)`** — it has its own cache scoped to LDS. Don't reason about it via Apex cache semantics.
5. **Mutations are single-record** — for bulk DML keep Apex. Don't loop `executeMutation` to fake bulk; you'll hit governor / network limits.
6. **The `!` operator is banned in LWC template expressions** (LWC1060). Use a JS getter (`get isNotReady()`).
7. **Custom relationship names use `__r`** — `Custom_Children__r`, with the trailing `__r` preserved in the GraphQL field name.
