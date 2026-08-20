# Stage 8: DEPLOY (conditional)

Read with `sf-lfg/SKILL.md`. Procedure lives here.

## Stage 8: DEPLOY (conditional)
Based on `$ARGUMENTS.deploy`:

### deploy=none (default)

Skip deployment. Report readiness.

### deploy=scratch

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTYxLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf org create scratch --definition-file config/project-scratch-def.json --alias lfg-test
sf project deploy start --target-org lfg-test --test-level RunLocalTests
```

### deploy=sandbox

1. Dispatch deployment verification:

   * Task sf-deployment-verification-agent(changed_files)
2. Validate deployment:

   ```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NjAsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
   sf project deploy start --dry-run --test-level RunLocalTests
   ```
3. If validation passes and Go decision:

   ```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTAsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
   sf project deploy start --test-level RunLocalTests
   ```

**Gate:** Deployment succeeds with all tests passing.

***

