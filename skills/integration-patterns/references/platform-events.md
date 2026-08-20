# Platform Events

Read with `integration-patterns/SKILL.md`. Procedure lives here.

## Platform Events
### Event Definition
```xml
<!-- Order_Event__e.object-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <deploymentStatus>Deployed</deploymentStatus>
    <eventType>HighVolume</eventType>
    <label>Order Event</label>
    <pluralLabel>Order Events</pluralLabel>
    <publishBehavior>PublishAfterCommit</publishBehavior>
    <fields>
        <fullName>Order_Id__c</fullName>
        <label>Order Id</label>
        <type>Text</type>
        <length>18</length>
    </fields>
    <fields>
        <fullName>Action__c</fullName>
        <label>Action</label>
        <type>Text</type>
        <length>50</length>
    </fields>
</CustomObject>
```

### Publishing Events

```apex
public class OrderEventPublisher {
    
    public static void publishOrderCreated(List<Order__c> orders) {
        List<Order_Event__e> events = new List<Order_Event__e>();
        
        for (Order__c order : orders) {
            events.add(new Order_Event__e(
                Order_Id__c = order.Id,
                Action__c = 'CREATED'
            ));
        }
        
        List<Database.SaveResult> results = EventBus.publish(events);
        
        for (Database.SaveResult result : results) {
            if (!result.isSuccess()) {
                for (Database.Error error : result.getErrors()) {
                    System.debug('Publish error: ' + error.getMessage());
                }
            }
        }
    }
}
```

### Subscribing to Events

```apex
trigger OrderEventTrigger on Order_Event__e (after insert) {
    for (Order_Event__e event : Trigger.new) {
        switch on event.Action__c {
            when 'CREATED' {
                handleOrderCreated(event);
            }
            when 'UPDATED' {
                handleOrderUpdated(event);
            }
        }
    }
}
```

