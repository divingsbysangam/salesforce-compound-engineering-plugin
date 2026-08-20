# Stage 7: TEST

Read with `sf-lfg/SKILL.md`. Procedure lives here.

## Stage 7: TEST
Run comprehensive tests:

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTA5LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
# Run all local tests with coverage
sf apex run test --test-level RunLocalTests --code-coverage --synchronous
```

1. Verify all tests pass.
2. Verify code coverage ≥ 75% org-wide, ≥ 90% per class.
3. Check for any test failures or coverage gaps.

**Gate:** All tests pass with required coverage. If tests fail, return to Stage 5.

***

