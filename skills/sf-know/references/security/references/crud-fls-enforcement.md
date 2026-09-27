# CRUD/FLS Enforcement

Read with `security-guide/SKILL.md`. Procedure lives here.

## CRUD/FLS Enforcement
### Object-Level Security

```apex
// Check before query
if (!Schema.sObjectType.Account.isAccessible()) {
    throw new AuraHandledException('You do not have access to view Accounts');
}

// Check before insert
if (!Schema.sObjectType.Account.isCreateable()) {
    throw new AuraHandledException('You do not have permission to create Accounts');
}

// Check before update
if (!Schema.sObjectType.Account.isUpdateable()) {
    throw new AuraHandledException('You do not have permission to update Accounts');
}

// Check before delete
if (!Schema.sObjectType.Account.isDeletable()) {
    throw new AuraHandledException('You do not have permission to delete Accounts');
}
```

### Field-Level Security

```apex
// Check field accessibility
if (!Schema.sObjectType.Account.fields.AnnualRevenue.isAccessible()) {
    // Don't include in query or mask value
}

// Check field updateability
if (!Schema.sObjectType.Account.fields.AnnualRevenue.isUpdateable()) {
    // Don't allow field update
}

// Using WITH SECURITY_ENFORCED (Spring '19+)
List<Account> accounts = [
    SELECT Id, Name, AnnualRevenue 
    FROM Account 
    WITH SECURITY_ENFORCED
];

// Using Security.stripInaccessible (Spring '19+)
List<Account> accounts = [SELECT Id, Name, AnnualRevenue FROM Account];
SObjectAccessDecision decision = Security.stripInaccessible(
    AccessType.READABLE,
    accounts
);
List<Account> sanitizedAccounts = decision.getRecords();
```

### Bulk CRUD Check Pattern

```apex
public class SecureDML {
    
    public static void secureInsert(List<SObject> records) {
        if (records.isEmpty()) return;
        
        Schema.SObjectType objType = records[0].getSObjectType();
        if (!objType.getDescribe().isCreateable()) {
            throw new SecurityException('Cannot create ' + objType);
        }
        
        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.CREATABLE,
            records
        );
        insert decision.getRecords();
    }
    
    public static void secureUpdate(List<SObject> records) {
        if (records.isEmpty()) return;
        
        Schema.SObjectType objType = records[0].getSObjectType();
        if (!objType.getDescribe().isUpdateable()) {
            throw new SecurityException('Cannot update ' + objType);
        }
        
        SObjectAccessDecision decision = Security.stripInaccessible(
            AccessType.UPDATABLE,
            records
        );
        update decision.getRecords();
    }
}
```

