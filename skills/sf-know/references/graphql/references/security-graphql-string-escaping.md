# Security: GraphQL string escaping

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Security: GraphQL string escaping
The official LWC Recipes use raw template interpolation (`"${name}"`) — this **breaks or GraphQL-injects** on any input containing a quote or backslash. Always escape:

```javascript
gqlString(raw) {
    return JSON.stringify(raw ?? ''); // produces a fully-quoted, fully-escaped GraphQL string literal
}
```

Used as: `Name: ${gqlString(userInput)}` → expands to `Name: "O'Brien \"Co\""`.

Alternatively, use GraphQL **variables** (`$name: String!` declared in the operation, passed via the `variables` property of `executeMutation`). Variables are the production-clean path, but the input type names (`AccountCreateInput`, etc.) aren't always documented — introspect the schema first via the org's GraphiQL endpoint when in doubt.

---

