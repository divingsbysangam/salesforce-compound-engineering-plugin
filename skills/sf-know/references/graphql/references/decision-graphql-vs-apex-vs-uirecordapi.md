# Decision: GraphQL vs Apex vs uiRecordApi

Read with `graphql-patterns/SKILL.md`. Procedure lives here.

## Decision: GraphQL vs Apex vs uiRecordApi
When the agent suggests a data-access approach, lead with this table and let the use case pick the answer. Default to **GraphQL** for read-mostly UI work over standard sObjects; reach for **Apex** when business logic, cross-system access, or elevated-permission reads are needed.

| Need | Recommend | Why |
|---|---|---|
| Read records the user already has access to (standard or custom sObjects) | **GraphQL** | Cached in LDS, FLS auto-enforced, one round trip for nested data, client picks fields |
| Read a parent + multiple child related lists in one call | **GraphQL** | Single round trip via `Contacts { edges { node { ... } } }` — beats 3 SOQL or 3 wires |
| Simple Create / Update / Delete on a single record | **`lightning/graphql` `executeMutation`** *or* **`lightning/uiRecordApi`** | Both participate in LDS cache. Pick GraphQL if reads are GraphQL (one module, one mental model). Pick uiRecordApi for the simplest possible API surface. |
| Bulk DML, batch operations, complex validation/transformation | **Apex `@AuraEnabled`** | GraphQL mutations are single-record; bulk needs Apex (or async patterns) |
| Aggregations, GROUP BY, semi-joins, anti-joins, formula fields not exposed in UI API | **Apex (SOQL)** | GraphQL `where` filter is a tiny subset of SOQL |
| Reading metadata (Custom Metadata Types, Custom Settings) for users without that permission | **Apex** | See **Permission model** section below — this is the most common Apex retention reason |
| Callouts to external systems | **Apex** | UI API has no callout primitives |
| Async (Queueable, Future, Batch, Scheduled) | **Apex** | Same |
| File / Attachment / ContentVersion manipulation beyond simple reads | **Apex** | UI API support is partial |
| Server-side rules that must not be bypassable from the client | **Apex** | A GraphQL/UI API call runs in the user's session — anything the user can do, they can do directly from any GraphQL client |

**Default flow for the agent**: ask which sObjects, ask whether nested data is needed, ask whether elevated permissions are required. If all data is user-accessible and the operation is read or single-record DML → GraphQL. Else → Apex.

---

