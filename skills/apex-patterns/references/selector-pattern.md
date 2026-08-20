# Selector Pattern

Read with `apex-patterns/SKILL.md`. Procedure lives here.

## Selector Pattern
```apex
public inherited sharing class AccountSelector {
    
    private static final Set<String> DEFAULT_FIELDS = new Set<String>{
        'Id', 'Name', 'Industry', 'AnnualRevenue', 'OwnerId', 'CreatedDate'
    };
    
    public List<Account> selectById(Set<Id> ids) {
        return selectById(ids, DEFAULT_FIELDS);
    }
    
    public List<Account> selectById(Set<Id> ids, Set<String> fields) {
        String query = buildQuery(fields) + ' WHERE Id IN :ids';
        return Database.query(query);
    }
    
    public List<Account> selectByIndustry(String industry) {
        return [
            SELECT Id, Name, Industry, AnnualRevenue
            FROM Account
            WHERE Industry = :industry
            WITH SECURITY_ENFORCED
            ORDER BY Name
        ];
    }
    
    public List<Account> selectWithContacts(Set<Id> ids) {
        return [
            SELECT Id, Name, Industry,
                   (SELECT Id, Name, Email FROM Contacts ORDER BY Name)
            FROM Account
            WHERE Id IN :ids
            WITH SECURITY_ENFORCED
        ];
    }
    
    public List<Account> selectRecentlyModified(Integer days) {
        DateTime threshold = DateTime.now().addDays(-days);
        return [
            SELECT Id, Name, Industry, LastModifiedDate
            FROM Account
            WHERE LastModifiedDate >= :threshold
            WITH SECURITY_ENFORCED
            ORDER BY LastModifiedDate DESC
        ];
    }
    
    private String buildQuery(Set<String> fields) {
        return 'SELECT ' + String.join(new List<String>(fields), ', ') + ' FROM Account';
    }
}
```

