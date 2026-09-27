# Sensitive Data Handling

Read with `security-guide/SKILL.md`. Procedure lives here.

## Sensitive Data Handling
### Never Hardcode Credentials

```apex
// WRONG
// Never assign credential values as Apex string literals.

// RIGHT - Use Named Credentials
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:My_Named_Credential/endpoint');

// RIGHT - Use Protected Custom Settings
API_Settings__c settings = API_Settings__c.getOrgDefaults();
String apiKey = settings.API_Key__c;

// RIGHT - Use Custom Metadata
API_Config__mdt config = [SELECT API_Key__c FROM API_Config__mdt WHERE DeveloperName = 'Production'];
```

### Secure Logging

```apex
// Never log sensitive data
System.debug('Processing user: ' + userId);  // OK
System.debug('Password: ' + password);        // NEVER!
System.debug('SSN: ' + ssn);                  // NEVER!
System.debug('Credit Card: ' + cardNumber);   // NEVER!

// Mask sensitive data
public static String maskSSN(String ssn) {
    if (String.isBlank(ssn) || ssn.length() < 4) return '***';
    return '***-**-' + ssn.right(4);
}
```

