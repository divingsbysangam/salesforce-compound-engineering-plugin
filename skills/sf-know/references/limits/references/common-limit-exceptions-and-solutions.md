# Common Limit Exceptions and Solutions

Read with `governor-limits/SKILL.md`. Procedure lives here.

## Common Limit Exceptions and Solutions
### 1. Too Many SOQL Queries (101)

**Exception**: `System.LimitException: Too many SOQL queries: 101`

**Common Causes**:
- SOQL inside a loop
- Queries in constructor/getter called multiple times
- Recursive triggers without proper guards

**Solutions**:

```apex
// BAD: Query in loop
for (Account acc : accounts) {
    List<Contact> contacts = [SELECT Id FROM Contact WHERE AccountId = :acc.Id];
}

// GOOD: Bulkified query
Map<Id, List<Contact>> contactsByAccount = new Map<Id, List<Contact>>();
for (Contact c : [SELECT Id, AccountId FROM Contact WHERE AccountId IN :accountIds]) {
    if (!contactsByAccount.containsKey(c.AccountId)) {
        contactsByAccount.put(c.AccountId, new List<Contact>());
    }
    contactsByAccount.get(c.AccountId).add(c);
}
```

### 2. Too Many DML Statements (151)

**Exception**: `System.LimitException: Too many DML statements: 151`

**Common Causes**:
- DML inside a loop
- Multiple update calls for same records
- Inefficient trigger recursion

**Solutions**:

```apex
// BAD: DML in loop
for (Account acc : accounts) {
    acc.Status__c = 'Active';
    update acc;
}

// GOOD: Collect and single DML
List<Account> toUpdate = new List<Account>();
for (Account acc : accounts) {
    acc.Status__c = 'Active';
    toUpdate.add(acc);
}
update toUpdate;
```

### 3. Too Many Query Rows (50,001)

**Exception**: `System.LimitException: Too many query rows: 50001`

**Common Causes**:
- Querying large tables without filters
- Aggregate queries on large data sets
- Non-selective queries

**Solutions**:

```apex
// BAD: Unbounded query
List<Contact> allContacts = [SELECT Id FROM Contact];

// GOOD: Paginated query with LIMIT and OFFSET
Integer batchSize = 10000;
Integer offset = 0;
List<Contact> batch = [SELECT Id FROM Contact LIMIT :batchSize OFFSET :offset];

// BETTER: Use Batch Apex for large data sets
global class ProcessContactsBatch implements Database.Batchable<SObject> {
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator('SELECT Id FROM Contact');
    }
    // ...
}
```

### 4. CPU Time Limit Exceeded

**Exception**: `System.LimitException: Apex CPU time limit exceeded`

**Common Causes**:
- Complex string operations
- Nested loops
- Regex in loops
- Expensive calculations repeated

**Solutions**:

```apex
// BAD: String concatenation in loop
String result = '';
for (Account acc : accounts) {
    result += acc.Name + ', ';
}

// GOOD: Use StringBuilder pattern
List<String> names = new List<String>();
for (Account acc : accounts) {
    names.add(acc.Name);
}
String result = String.join(names, ', ');

// Move heavy processing to async
if (Limits.getCpuTime() > 8000) {  // 80% threshold
    // Queue remaining work
    System.enqueueJob(new ProcessRemainingJob(remainingRecords));
    return;
}
```

### 5. Heap Size Limit Exceeded

**Exception**: `System.LimitException: Apex heap size too large`

**Common Causes**:
- Large collections in memory
- Storing query results that aren't needed
- Large string operations
- Not releasing references

**Solutions**:

```apex
// BAD: Loading all records into memory
List<Contact> allContacts = [SELECT Id, Name, Email, ... 50 fields 
                              FROM Contact];

// GOOD: Query only needed fields
List<Contact> contacts = [SELECT Id, Name FROM Contact];

// BETTER: Process in chunks
for (List<Contact> batch : [SELECT Id, Name FROM Contact]) {
    processBatch(batch);
    // Batch is eligible for GC after this
}

// Clear large collections when done
hugeList.clear();
hugeList = null;
```

### 6. Too Many Future Calls (51)

**Exception**: `System.LimitException: Too many future calls: 51`

**Solutions**:

```apex
// BAD: Future call in loop
for (Account acc : accounts) {
    MyClass.processFuture(acc.Id);
}

// GOOD: Pass collection to single future
@future
public static void processAccounts(Set<Id> accountIds) {
    // Process all accounts
}

// BETTER: Use Queueable with chaining
public class ProcessAccountsJob implements Queueable {
    private List<Id> accountIds;
    private Integer startIndex;
    
    public void execute(QueueableContext ctx) {
        // Process batch
        // Chain next job if more records
        if (startIndex + batchSize < accountIds.size()) {
            System.enqueueJob(new ProcessAccountsJob(accountIds, startIndex + batchSize));
        }
    }
}
```

