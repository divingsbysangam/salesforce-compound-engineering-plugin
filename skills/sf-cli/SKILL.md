---
name: sf-cli
description: "Reference for common Salesforce CLI (sf) commands: deploy, retrieve, test, org auth, and metadata operations. Use when looking up sf CLI syntax during Salesforce development workflows."
argument-hint: "[optional command topic: deploy|retrieve|test|org]"
---

# Salesforce CLI Skill

Reference for common `sf` CLI commands used in Salesforce development workflows.

## Deploy

```bash
# Deploy source to org
sf project deploy start --source-dir force-app

# Deploy specific metadata
sf project deploy start --metadata ApexClass:MyClass

# Validate without deploying (dry run)
sf project deploy start --dry-run --source-dir force-app

# Deploy with test execution
sf project deploy start --source-dir force-app --test-level RunLocalTests

# Check deploy status
sf project deploy report
```

## Retrieve

```bash
# Retrieve all source
sf project retrieve start --source-dir force-app

# Retrieve specific metadata
sf project retrieve start --metadata ApexClass:MyClass

# Retrieve from manifest
sf project retrieve start --manifest manifest/package.xml
```

## Test

```bash
# Run all local tests
sf apex run test --test-level RunLocalTests --synchronous

# Run specific test class
sf apex run test --class-names MyClassTest --synchronous

# Run specific test method
sf apex run test --tests MyClassTest.testMethod --synchronous

# Run with code coverage
sf apex run test --test-level RunLocalTests --code-coverage --synchronous

# Check test results
sf apex get test
```

## Org Management

```bash
# Display org info
sf org display

# Open org in browser
sf org open

# List connected orgs
sf org list

# Set default org
sf config set target-org myOrg

# Create scratch org
sf org create scratch --definition-file config/project-scratch-def.json --alias myScratch
```

## Data

```bash
# Run SOQL query
sf data query --query "SELECT Id, Name FROM Account LIMIT 10"

# Run SOQL query (tooling API)
sf data query --query "SELECT Id, Name FROM ApexClass" --use-tooling-api

# Export data
sf data export tree --query "SELECT Id, Name FROM Account" --output-dir data

# Import data
sf data import tree --files data/Account.json
```

## Metadata

```bash
# List metadata types
sf org list metadata-types

# List metadata of a type
sf org list metadata --metadata-type ApexClass

# Generate manifest from org
sf project generate manifest --from-org myOrg --output-dir manifest
```

## Debugging

```bash
# View debug logs
sf apex log list

# Get specific log
sf apex log get --log-id 07L...

# Execute anonymous Apex
sf apex run --file scripts/anonymous.apex

# Tail logs in real-time
sf apex tail log --color
```

## Common Patterns

### Full Deploy + Test Cycle
```bash
sf project deploy start --source-dir force-app --test-level RunLocalTests --wait 30
```

### Quick Validation
```bash
sf project deploy start --dry-run --source-dir force-app --test-level RunLocalTests
```

### Retrieve After Manual Changes
```bash
sf project retrieve start --source-dir force-app
git diff  # Review what changed in org
```
