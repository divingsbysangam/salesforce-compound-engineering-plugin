public class LeadTerritoryRouter {
    public void route(List<Lead> leads) {
        for (Lead l : leads) {
            List<User> reps = [SELECT Id, Territory__c FROM User WHERE Territory__c = :l.Territory__c];
            if (!reps.isEmpty()) {
                l.OwnerId = reps[0].Id;
                update l;
            }
        }
    }
}
