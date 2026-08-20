# Limit Budgeting Strategy

Read with `governor-limits/SKILL.md`. Procedure lives here.

## Limit Budgeting Strategy
When designing features, budget your limits:

| Component | SOQL | DML | CPU (ms) |
|-----------|------|-----|----------|
| Trigger validation | 5 | 0 | 500 |
| Field updates | 2 | 1 | 200 |
| Related record creation | 5 | 2 | 1000 |
| External callout | 1 | 1 | 2000 |
| Notification flow | 3 | 1 | 500 |
| **Total** | **16** | **5** | **4200** |
| **Budget (80%)** | **80** | **120** | **8000** |
| **Remaining** | **64** | **115** | **3800** |

This ensures headroom for:
- Unexpected trigger recursion
- Platform automation (flows, validation rules)
- Future feature additions
