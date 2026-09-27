# Usage Examples

Read with `test-factory/SKILL.md`. Procedure lives here.

## Usage Examples
### Basic Usage
```apex
@isTest
static void testAccountCreation() {
    // Simple account
    Account acc = TestDataFactory.createAccount();
    insert acc;
    
    // Account with overrides
    Account customAcc = TestDataFactory.createAccount(new Map<String, Object>{
        'Name' => 'Custom Account Name',
        'Industry' => 'Finance',
        'AnnualRevenue' => 1000000
    });
    insert customAcc;
}
```

### Bulk Testing
```apex
@isTest
static void testBulkOperation() {
    // Create 200+ records for bulk testing
    List<Account> accounts = TestDataFactory.createAccounts(200);
    insert accounts;
    
    Test.startTest();
    // Your bulk operation here
    Test.stopTest();
}
```

### TestSetup Method
```apex
@isTest
private class AccountServiceTest {
    
    @TestSetup
    static void setup() {
        // Shared test data
        List<Account> accounts = TestDataFactory.createAccounts(5);
        insert accounts;
        
        List<Contact> allContacts = new List<Contact>();
        for (Account acc : accounts) {
            allContacts.addAll(TestDataFactory.createContacts(acc.Id, 3));
        }
        insert allContacts;
    }
    
    @isTest
    static void testMethod1() {
        List<Account> accounts = [SELECT Id FROM Account];
        // Use the test data
    }
}
```

### User Context Testing
```apex
@isTest
static void testAsStandardUser() {
    User standardUser = TestDataFactory.createUser('Standard User');
    insert standardUser;
    
    System.runAs(standardUser) {
        // Test as standard user
        Account acc = TestDataFactory.createAccount();
        insert acc;
        
        // Assertions
    }
}
```
