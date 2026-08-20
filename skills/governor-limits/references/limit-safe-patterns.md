# Limit-Safe Patterns

Read with `governor-limits/SKILL.md`. Procedure lives here.

## Limit-Safe Patterns
### Pattern 1: Governor Limit Monitor

```apex
public class LimitMonitor {
    
    private Integer queryThreshold = 80;   // 80% of limit
    private Integer dmlThreshold = 120;     // 80% of limit
    private Integer cpuThreshold = 8000;    // 80% of limit
    
    public Boolean isApproachingLimits() {
        return Limits.getQueries() >= queryThreshold ||
               Limits.getDmlStatements() >= dmlThreshold ||
               Limits.getCpuTime() >= cpuThreshold;
    }
    
    public void checkAndQueue(List<SObject> remaining, Type jobType) {
        if (isApproachingLimits() && !remaining.isEmpty()) {
            System.enqueueJob((Queueable)jobType.newInstance());
        }
    }
    
    public static String getLimitSummary() {
        return String.format(
            'SOQL: {0}/{1}, DML: {2}/{3}, CPU: {4}/{5}ms, Heap: {6}/{7}',
            new List<Object>{
                Limits.getQueries(), Limits.getLimitQueries(),
                Limits.getDmlStatements(), Limits.getLimitDmlStatements(),
                Limits.getCpuTime(), Limits.getLimitCpuTime(),
                Limits.getHeapSize(), Limits.getLimitHeapSize()
            }
        );
    }
}
```

### Pattern 2: Lazy Loading

```apex
public class AccountService {
    
    // Cache to prevent redundant queries
    private static Map<Id, Account> accountCache = new Map<Id, Account>();
    
    public static Account getAccount(Id accountId) {
        if (!accountCache.containsKey(accountId)) {
            accountCache.put(accountId, 
                [SELECT Id, Name, Industry FROM Account WHERE Id = :accountId]);
        }
        return accountCache.get(accountId);
    }
    
    // Bulk load for multiple IDs
    public static Map<Id, Account> getAccounts(Set<Id> accountIds) {
        Set<Id> uncached = new Set<Id>();
        for (Id accId : accountIds) {
            if (!accountCache.containsKey(accId)) {
                uncached.add(accId);
            }
        }
        
        if (!uncached.isEmpty()) {
            for (Account acc : [SELECT Id, Name, Industry 
                                FROM Account WHERE Id IN :uncached]) {
                accountCache.put(acc.Id, acc);
            }
        }
        
        Map<Id, Account> result = new Map<Id, Account>();
        for (Id accId : accountIds) {
            result.put(accId, accountCache.get(accId));
        }
        return result;
    }
    
    @TestVisible
    private static void clearCache() {
        accountCache.clear();
    }
}
```

### Pattern 3: Query Selector Pattern

```apex
public class AccountSelector {
    
    // Centralized query methods with consistent field sets
    public static final Set<String> DEFAULT_FIELDS = new Set<String>{
        'Id', 'Name', 'Industry', 'AnnualRevenue', 'OwnerId'
    };
    
    public List<Account> selectById(Set<Id> ids) {
        return selectById(ids, DEFAULT_FIELDS);
    }
    
    public List<Account> selectById(Set<Id> ids, Set<String> fields) {
        String query = 'SELECT ' + String.join(new List<String>(fields), ', ') +
                      ' FROM Account WHERE Id IN :ids';
        return Database.query(query);
    }
    
    public List<Account> selectByIdWithContacts(Set<Id> ids) {
        return [
            SELECT Id, Name, Industry,
                   (SELECT Id, Name, Email FROM Contacts)
            FROM Account
            WHERE Id IN :ids
        ];
    }
    
    // Selective query for large tables
    public List<Account> selectActiveByIndustry(String industry) {
        return [
            SELECT Id, Name 
            FROM Account 
            WHERE Industry = :industry 
              AND IsActive__c = true
            LIMIT 10000
        ];
    }
}
```

