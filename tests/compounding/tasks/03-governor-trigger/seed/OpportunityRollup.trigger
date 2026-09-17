trigger OpportunityRollup on Opportunity (after update) {
    for (Opportunity o : Trigger.new) {
        if (o.StageName == 'Closed Won') {
            Account a = [SELECT Id, Total_Won_Amount__c FROM Account WHERE Id = :o.AccountId];
            a.Total_Won_Amount__c = (a.Total_Won_Amount__c == null ? 0 : a.Total_Won_Amount__c) + o.Amount;
            update a;
        }
    }
}
