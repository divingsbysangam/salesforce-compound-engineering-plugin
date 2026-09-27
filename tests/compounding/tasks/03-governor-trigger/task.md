# 03-governor-trigger

`OpportunityRollup.trigger` puts all its logic inline and queries once per
record. Restructure it to the handler pattern this repo's `sf-know topic:apex`
guidance describes, and make it bulk-safe.

Behaviour to preserve: when an Opportunity is closed-won, its Account's
`Total_Won_Amount__c` is increased by the Opportunity Amount.

Write the trigger and any new handler class into this directory.
