# Unit of Work Pattern

Read with `apex-patterns/SKILL.md`. Procedure lives here.

## Unit of Work Pattern
```apex
public class AccountUnitOfWork {
    
    private List<Account> newAccounts = new List<Account>();
    private List<Account> updatedAccounts = new List<Account>();
    private List<Contact> newContacts = new List<Contact>();
    private List<Opportunity> newOpportunities = new List<Opportunity>();
    
    public void registerNew(Account acc) {
        newAccounts.add(acc);
    }
    
    public void registerDirty(Account acc) {
        updatedAccounts.add(acc);
    }
    
    public void registerNewContact(Contact con) {
        newContacts.add(con);
    }
    
    public void registerNewOpportunity(Opportunity opp) {
        newOpportunities.add(opp);
    }
    
    public void commitWork() {
        Savepoint sp = Database.setSavepoint();
        
        try {
            if (!newAccounts.isEmpty()) {
                insert newAccounts;
            }
            
            if (!updatedAccounts.isEmpty()) {
                update updatedAccounts;
            }
            
            // Set relationships after account insert
            for (Contact con : newContacts) {
                // Assuming AccountId was set to index reference
            }
            
            if (!newContacts.isEmpty()) {
                insert newContacts;
            }
            
            if (!newOpportunities.isEmpty()) {
                insert newOpportunities;
            }
            
        } catch (Exception e) {
            Database.rollback(sp);
            throw e;
        }
    }
}
```
