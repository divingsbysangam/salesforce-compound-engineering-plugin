# REST API Patterns

Read with `integration-patterns/SKILL.md`. Procedure lives here.

## REST API Patterns
### Inbound REST (Apex REST)

```apex
@RestResource(urlMapping='/api/v1/accounts/*')
global with sharing class AccountRestService {
    
    @HttpGet
    global static ResponseWrapper getAccount() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        
        String accountId = req.requestURI.substringAfterLast('/');
        
        try {
            Account acc = [
                SELECT Id, Name, Industry, AnnualRevenue
                FROM Account 
                WHERE Id = :accountId
                WITH SECURITY_ENFORCED
            ];
            
            res.statusCode = 200;
            return new ResponseWrapper(true, acc, null);
            
        } catch (QueryException e) {
            res.statusCode = 404;
            return new ResponseWrapper(false, null, 'Account not found');
        }
    }
    
    @HttpPost
    global static ResponseWrapper createAccount() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        
        try {
            AccountRequest accReq = (AccountRequest) JSON.deserialize(
                req.requestBody.toString(),
                AccountRequest.class
            );
            
            Account acc = new Account(
                Name = accReq.name,
                Industry = accReq.industry
            );
            
            insert acc;
            
            res.statusCode = 201;
            return new ResponseWrapper(true, acc, null);
            
        } catch (Exception e) {
            res.statusCode = 400;
            return new ResponseWrapper(false, null, e.getMessage());
        }
    }
    
    global class AccountRequest {
        public String name;
        public String industry;
    }
    
    global class ResponseWrapper {
        public Boolean success;
        public Object data;
        public String error;
        
        public ResponseWrapper(Boolean success, Object data, String error) {
            this.success = success;
            this.data = data;
            this.error = error;
        }
    }
}
```

### Outbound REST (HTTP Callout)

```apex
public class ExternalServiceClient {
    
    private static final String NAMED_CRED = 'callout:External_API';
    
    public ExternalAccount getExternalAccount(String externalId) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(NAMED_CRED + '/accounts/' + externalId);
        req.setMethod('GET');
        req.setHeader('Accept', 'application/json');
        req.setTimeout(30000);
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            return (ExternalAccount) JSON.deserialize(
                res.getBody(), 
                ExternalAccount.class
            );
        } else {
            throw new CalloutException('API Error: ' + res.getStatusCode());
        }
    }
    
    public ExternalAccount createExternalAccount(ExternalAccount acc) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(NAMED_CRED + '/accounts');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(acc));
        req.setTimeout(30000);
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 201) {
            return (ExternalAccount) JSON.deserialize(
                res.getBody(),
                ExternalAccount.class
            );
        } else {
            throw new CalloutException('Create failed: ' + res.getBody());
        }
    }
    
    public class ExternalAccount {
        public String id;
        public String name;
        public String industry;
    }
}
```

