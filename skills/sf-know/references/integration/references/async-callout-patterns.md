# Async Callout Patterns

Read with `integration-patterns/SKILL.md`. Procedure lives here.

## Async Callout Patterns
### Queueable with Callout

```apex
public class AsyncCalloutJob implements Queueable, Database.AllowsCallouts {
    
    private List<Id> accountIds;
    
    public AsyncCalloutJob(List<Id> accountIds) {
        this.accountIds = accountIds;
    }
    
    public void execute(QueueableContext context) {
        List<Account> accounts = [
            SELECT Id, External_Id__c 
            FROM Account 
            WHERE Id IN :accountIds
        ];
        
        ExternalServiceClient client = new ExternalServiceClient();
        List<Account> toUpdate = new List<Account>();
        
        for (Account acc : accounts) {
            try {
                ExternalServiceClient.ExternalAccount extAcc = 
                    client.getExternalAccount(acc.External_Id__c);
                
                acc.External_Status__c = 'Synced';
                acc.Last_Sync_Date__c = DateTime.now();
                toUpdate.add(acc);
                
            } catch (Exception e) {
                acc.External_Status__c = 'Error';
                acc.Sync_Error__c = e.getMessage();
                toUpdate.add(acc);
            }
        }
        
        update toUpdate;
    }
}

// Usage
System.enqueueJob(new AsyncCalloutJob(accountIds));
```

### Future Method Callout

```apex
public class AccountSyncService {
    
    @future(callout=true)
    public static void syncToExternal(Set<Id> accountIds) {
        List<Account> accounts = [
            SELECT Id, Name, Industry, External_Id__c
            FROM Account
            WHERE Id IN :accountIds
        ];
        
        ExternalServiceClient client = new ExternalServiceClient();
        
        for (Account acc : accounts) {
            try {
                if (String.isBlank(acc.External_Id__c)) {
                    // Create in external system
                    ExternalServiceClient.ExternalAccount extAcc = 
                        new ExternalServiceClient.ExternalAccount();
                    extAcc.name = acc.Name;
                    extAcc.industry = acc.Industry;
                    
                    ExternalServiceClient.ExternalAccount created = 
                        client.createExternalAccount(extAcc);
                    
                    acc.External_Id__c = created.id;
                }
            } catch (Exception e) {
                System.debug('Sync failed: ' + e.getMessage());
            }
        }
        
        update accounts;
    }
}
```

