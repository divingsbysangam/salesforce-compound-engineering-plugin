# Nested relationships (the killer feature)

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Nested relationships (the killer feature)
One query fetches an Account + its Contacts + its Opportunities.

```graphql
query AccountWithChildren($accountId: ID!) {
    uiapi {
        query {
            Account(where: { Id: { eq: $accountId } }) {
                edges {
                    node {
                        Id
                        Name { value }
                        Contacts(first: 50, orderBy: { LastName: { order: ASC } }) {
                            edges {
                                node {
                                    Id
                                    Name { value }
                                    Email { value }
                                }
                            }
                            totalCount
                        }
                        Opportunities(first: 50, orderBy: { CloseDate: { order: DESC } }) {
                            edges {
                                node {
                                    Id
                                    Name { value }
                                    StageName { value }
                                    Amount { value displayValue }
                                    CloseDate { value displayValue }
                                }
                            }
                            totalCount
                        }
                    }
                }
            }
        }
    }
}
```

**Relationship name = the child collection name** (`Contacts`, `Opportunities` for standard; `Custom_Children__r` for custom).

Pagination cap: 100 per connection. For larger sets use `pageInfo { endCursor hasNextPage }` and `after: "<cursor>"`.

---

