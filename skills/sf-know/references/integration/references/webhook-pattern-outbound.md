# Webhook Pattern (Outbound)

Read with `integration-patterns/SKILL.md`. Procedure lives here.

## Webhook Pattern (Outbound)
```apex
public class WebhookService {
    
    @future(callout=true)
    public static void sendWebhook(String payload, String webhookUrl) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(webhookUrl);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(payload);
        req.setTimeout(10000);
        
        try {
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {
                System.debug('Webhook sent successfully');
            } else {
                System.debug('Webhook failed: ' + res.getStatusCode());
            }
        } catch (Exception e) {
            System.debug('Webhook error: ' + e.getMessage());
        }
    }
}
```

---

