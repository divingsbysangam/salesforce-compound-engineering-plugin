# 01-bulkification

Refactor `LeadTerritoryRouter.cls` so it is bulk-safe. It currently runs a
query and a DML statement per record, which fails on any realistic batch.

Preserve the behaviour: each Lead is assigned to the User whose `Territory__c`
matches the Lead's, and Leads with no matching rep are left untouched.

Write the refactored class back to the same path.
