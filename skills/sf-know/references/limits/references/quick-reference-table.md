# Quick Reference Table

Read with `governor-limits/SKILL.md`. Procedure lives here.

## Quick Reference Table
### Synchronous Limits

| Limit | Value | Per |
|-------|-------|-----|
| Total SOQL queries | 100 | Transaction |
| Total SOQL rows retrieved | 50,000 | Transaction |
| Total SOSL queries | 20 | Transaction |
| Total DML statements | 150 | Transaction |
| Total DML rows | 10,000 | Transaction |
| Total CPU time | 10,000 ms | Transaction |
| Total heap size | 6 MB | Transaction |
| Total callouts | 100 | Transaction |
| Total callout time | 120 seconds | Transaction |
| Total email invocations | 10 | Transaction |
| Total push notifications | 10 | Transaction |
| Total sendEmail methods | 10 | Transaction |
| Total future calls | 50 | Transaction |
| Total queueable jobs | 50 | Transaction |
| Total event publishes | 150 | Transaction |
| Maximum query rows in batch | 50,000,000 | Batch |

### Asynchronous Limits (Future, Queueable, Batch)

| Limit | Value | Per |
|-------|-------|-----|
| Total SOQL queries | 200 | Transaction |
| Total CPU time | 60,000 ms | Transaction |
| Total heap size | 12 MB | Transaction |
| Queueable jobs from queueable | 1 | Execution |
| Batch executions per 24 hours | 250,000 | Org |

### Static Limits (Cannot Be Changed)

| Limit | Value |
|-------|-------|
| Characters in class | 1,000,000 |
| Characters in trigger | 1,000,000 |
| SOQL query length | 100,000 |
| SOSL query length | 20,000 |
| SOQL offset | 2,000 |
| Subqueries in SOQL | 20 |
| Fields in SOQL | 200 |
| Child relationships in SOQL | 200 |
| Records in Database.insert/update/delete | 10,000 |

