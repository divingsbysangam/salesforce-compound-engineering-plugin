# Deploy, validate, retrieve, delete, manifest, test

Always pass `--target-org <alias>` (or confirm the project default) and `--json` when you need to parse results. Run the target check from `SKILL.md` first.

## Before any deploy

1. `sf code-analyzer run --target <changed paths>` when Code Analyzer is installed. Fix severity 1–2 findings.
2. Dry run: `sf project deploy start --dry-run --source-dir <paths> --target-org <alias>`.

## validate → quick (production path)

```bash
sf project deploy validate --source-dir force-app --target-org prod --test-level RunLocalTests --wait 60 --json
# result.id is the job ID
sf project deploy quick --job-id <id> --target-org prod --wait 30
```

A validated job can be quick-deployed for 10 days, provided the Apex in the target org has not changed since validation.

## deploy

```bash
sf project deploy start --source-dir <paths> --target-org <alias> --wait 30 --json
sf project deploy start --manifest manifest/package.xml --target-org <alias>
sf project deploy start --metadata ApexClass:MyService --target-org <alias>
```

Test levels (`--test-level`):
- `NoTestRun`: non-production only.
- `RunSpecifiedTests --tests MyServiceTest`: each class and trigger in the deploy needs 75% coverage from the named tests.
- `RunLocalTests`: default for production when the deploy contains Apex.
- `RunAllTestsInOrg`: everything, including managed-package tests.

Long jobs: `sf project deploy report --job-id <id>`, `sf project deploy resume --job-id <id>`. Source-tracked orgs: `sf project deploy preview` shows what would go.

## retrieve

```bash
sf project retrieve start --metadata "ApexClass:MyService" --target-org <alias>
sf project retrieve start --manifest manifest/package.xml --target-org <alias>
sf project retrieve start --package-name "My Package" --target-org <alias>
```

`sf project retrieve preview` shows remote changes in source-tracked orgs.

## manifest

```bash
sf project generate manifest --source-dir force-app --name package --output-dir manifest
sf project generate manifest --from-org <alias> --output-dir manifest   # everything in the org
sf project generate manifest --metadata ApexClass:Old --type destroy     # destructiveChanges.xml
```

For "only what changed since main", the community plugin sfdx-git-delta (`sf sgd source delta --from origin/main --to HEAD --output-dir .`) builds `package.xml` and `destructiveChanges.xml` from git. It is third-party; confirm it is installed before using it.

## destructive

```bash
sf project delete source --metadata ApexClass:Old --target-org <alias>
sf project deploy start --manifest package.xml --post-destructive-changes destructiveChangesPost.xml --target-org <alias>
```

Name every component being deleted and get the user's confirmation first. Deletions cannot be rolled back by redeploying; retrieve the components first if they may be needed.

## test

```bash
sf apex run test --tests MyServiceTest --code-coverage --result-format human --wait 20 --target-org <alias>
sf apex run test --test-level RunLocalTests --code-coverage --result-format json --output-dir .sf/test-results --target-org <alias>
sf apex get test --test-run-id <id> --target-org <alias>
```

## Reading a failed deploy (`--json`)

- `result.details.componentFailures[]`: `componentType`, `fullName`, `fileName`, `lineNumber`, `problem`.
- `result.details.runTestResult.failures[]`: `name`, `methodName`, `message`, `stackTrace`.
- `result.details.runTestResult.codeCoverageWarnings[]`: classes under 75%.

Report each failure with file and line, fix it, and re-validate. Hand repeated failures to `/sf-debug`.
