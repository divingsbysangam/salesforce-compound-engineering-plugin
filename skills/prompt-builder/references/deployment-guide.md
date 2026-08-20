# Deployment Guide

Read with `prompt-builder/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Deployment Guide</span>
### <span data-proof="authored" data-by="ai:claude">Retrieve from Org</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NzUsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
sf project retrieve start -m GenAiPromptTemplate -m GenAiPromptTemplateActv
```

### <span data-proof="authored" data-by="ai:claude">Deploy to Org</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NzMsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
sf project deploy start -m GenAiPromptTemplate -m GenAiPromptTemplateActv
```

### <span data-proof="authored" data-by="ai:claude">Deployment Order (When Dependencies Exist)</span>

<span data-proof="authored" data-by="ai:claude">If a template references a Flow that contains Apex:</span>

```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MzA2LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
# Step 1: Deploy Apex classes first
sf project deploy start -m ApexClass:CaseContextProvider -m ApexClass:CaseSummarizationParser

# Step 2: Deploy Flows
sf project deploy start -m Flow:AnalyzeCaseContext

# Step 3: Deploy templates
sf project deploy start -m GenAiPromptTemplate -m GenAiPromptTemplateActv
```

### <span data-proof="authored" data-by="ai:claude">Version Identifiers</span>

* <span data-proof="authored" data-by="ai:claude">`activeVersion`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`versionIdentifier`</span> <span data-proof="authored" data-by="ai:claude">use</span> **<span data-proof="authored" data-by="ai:claude">hash-based IDs</span>** <span data-proof="authored" data-by="ai:claude">(Salesforce-generated)</span>

* <span data-proof="authored" data-by="ai:claude">When creating new templates from scratch, use a placeholder like</span> <span data-proof="authored" data-by="ai:claude">`1`</span> <span data-proof="authored" data-by="ai:claude">— Salesforce will assign the hash on deploy</span>

* <span data-proof="authored" data-by="ai:claude">When modifying retrieved templates, preserve the existing hash values</span>

***

