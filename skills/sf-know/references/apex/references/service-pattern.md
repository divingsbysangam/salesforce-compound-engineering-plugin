# Service Pattern

Read with `apex-patterns/SKILL.md`. Procedure lives here.

## Service Pattern
```apex
public with sharing class AccountService {
    
    private AccountSelector selector;
    
    public AccountService() {
        this.selector = new AccountSelector();
    }
    
    public void activateAccounts(Set<Id> accountIds) {
        List<Account> accounts = selector.selectById(accountIds);
        
        for (Account acc : accounts) {
            acc.Status__c = 'Active';
            acc.Activated_Date__c = Date.today();
        }
        
        SecureDML.secureUpdate(accounts);
    }
    
    public Map<Id, Decimal> calculateAccountScores(Set<Id> accountIds) {
        List<Account> accounts = selector.selectWithContacts(accountIds);
        Map<Id, Decimal> scores = new Map<Id, Decimal>();
        
        for (Account acc : accounts) {
            Decimal score = calculateScore(acc);
            scores.put(acc.Id, score);
        }
        
        return scores;
    }
    
    public void mergeAccounts(Id masterAccountId, Set<Id> duplicateIds) {
        // Business logic for merging accounts
        Account master = selector.selectById(new Set<Id>{masterAccountId})[0];
        List<Account> duplicates = selector.selectById(duplicateIds);
        
        // Merge logic
        for (Account dup : duplicates) {
            // Transfer relationships, merge data
        }
        
        delete duplicates;
    }
    
    private Decimal calculateScore(Account acc) {
        Decimal score = 0;
        
        if (acc.AnnualRevenue != null) {
            score += acc.AnnualRevenue / 10000;
        }
        
        if (acc.Contacts != null) {
            score += acc.Contacts.size() * 5;
        }
        
        return score;
    }
}
```

