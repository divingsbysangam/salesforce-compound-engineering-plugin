# Variables (reactive parameters)

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Variables (reactive parameters)
```javascript
@api recordId;

get variables() {
    return { accountId: this.recordId };
}

@wire(graphql, {
    query: gql`
        query AccountDetail($accountId: ID!) {
            uiapi {
                query {
                    Account(where: { Id: { eq: $accountId } }) {
                        edges { node { Id Name { value } } }
                    }
                }
            }
        }
    `,
    variables: '$variables'
})
handleResult(result) { /* ... */ }
```

**Reactivity**: when `recordId` changes (e.g., navigating between record pages), the getter re-runs, the wire re-fires, and LDS cache is consulted before any network call.

---

