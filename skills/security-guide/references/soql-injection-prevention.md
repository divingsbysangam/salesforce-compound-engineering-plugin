# SOQL Injection Prevention

Read with `security-guide/SKILL.md`. Procedure lives here.

## SOQL Injection Prevention
### Vulnerable Code

```apex
// NEVER DO THIS
String searchTerm = userInput;
String query = 'SELECT Id, Name FROM Account WHERE Name LIKE \'%' + searchTerm + '%\'';
List<Account> accounts = Database.query(query);
```

### Secure Alternatives

```apex
// Option 1: Static SOQL with bind variable (PREFERRED)
String searchTerm = '%' + userInput + '%';
List<Account> accounts = [SELECT Id, Name FROM Account WHERE Name LIKE :searchTerm];

// Option 2: Escaped dynamic SOQL (when dynamic is necessary)
String searchTerm = '%' + String.escapeSingleQuotes(userInput) + '%';
String query = 'SELECT Id, Name FROM Account WHERE Name LIKE \'' + searchTerm + '\'';
List<Account> accounts = Database.query(query);

// Option 3: SOSL for search
String searchTerm = String.escapeSingleQuotes(userInput);
List<List<SObject>> results = [FIND :searchTerm IN ALL FIELDS RETURNING Account(Id, Name)];
```

