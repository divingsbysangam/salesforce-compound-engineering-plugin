# Step 8: Publish, activate, verify

Read with `agentforce-develop/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 8: Publish, activate, verify</span>
```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzYxLCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
# Publish — validates metadata, creates a permanent version
sf agent publish authoring-bundle --json --api-name <Developer_Name>

# Activate — makes the new version available to users
sf agent activate --json --api-name <Developer_Name>

# Verify with --api-name (NOT --authoring-bundle) post-activation
sf agent preview start --json --api-name <Developer_Name>
```

<span data-proof="authored" data-by="ai:claude">Every publish creates a permanent, immutable version number. Treat publish as production-grade.</span>

***

