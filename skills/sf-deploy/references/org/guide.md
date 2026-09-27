# Orgs and test data

## Connect and choose

```bash
sf org login web --alias prod --set-default                                  # production / developer edition
sf org login web --alias uat --instance-url https://test.salesforce.com       # sandbox (or the My Domain URL)
sf org login device --alias ci                                               # no browser available
sf org list                                                                  # all connected orgs
sf org display --target-org uat --json                                       # username, instance URL, API version
sf config set target-org uat                                                 # project default (add --global for all projects)
sf org open --target-org uat
```

## Scratch orgs

```bash
sf org create scratch --definition-file config/project-scratch-def.json --alias feat --duration-days 7 --set-default --target-dev-hub devhub
sf org delete scratch --target-org feat --no-prompt
```

Needs a Dev Hub (`sf org login web --alias devhub --set-default-dev-hub`). Deploy source with `sf project deploy start`; scratch orgs track source, so `sf project deploy preview` shows pending changes. `sf project reset tracking` resets tracking after it drifts (ask first; it discards tracking state).

## Sandboxes

```bash
sf org create sandbox --name uat --license-type Developer --target-org prod --alias uat --wait 30
sf org refresh sandbox --name uat --target-org prod
```

Creating or refreshing a sandbox replaces its data and metadata. Confirm with the user before running either.

## Access

```bash
sf org assign permset --name My_Feature_Access --target-org <alias>
```

## Test data

| Need | Command |
|---|---|
| Small related data set (parents + children) | `sf data export tree --query "SELECT Name, (SELECT LastName FROM Contacts) FROM Account LIMIT 50" --plan --output-dir data` then `sf data import tree --plan data/Account-Contact-plan.json --target-org <alias>` |
| Large volumes from CSV | `sf data import bulk --sobject Account --file data/accounts.csv --wait 10 --target-org <alias>` |
| Idempotent loads | `sf data upsert bulk --sobject Account --file data/accounts.csv --external-id External_Id__c --wait 10 --target-org <alias>` |
| Logic-heavy seeding | `sf apex run --file scripts/apex/seed.apex --target-org <alias>` |
| Inspect | `sf data query --query "SELECT Id, Name FROM Account LIMIT 10" --target-org <alias> --json` |

Never load data into production from this skill without an explicit request naming the org. Prefer a data factory (`/sf-generate type:test-data`) for Apex tests; tests must not depend on org data.
