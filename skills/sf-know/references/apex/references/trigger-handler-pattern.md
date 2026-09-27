# Trigger Handler Pattern

Read with `apex-patterns/SKILL.md`. Procedure lives here.

## Trigger Handler Pattern
### Base Handler Class
```apex
public virtual class TriggerHandler {
    
    private static Map<String, LoopCount> loopCountMap;
    private static Set<String> bypassedHandlers;
    
    static {
        loopCountMap = new Map<String, LoopCount>();
        bypassedHandlers = new Set<String>();
    }
    
    @TestVisible
    private TriggerOperation context;
    
    @TestVisible
    private Boolean isTriggerExecuting;
    
    public TriggerHandler() {
        this.setTriggerContext();
    }
    
    public void run() {
        if (!validateRun()) return;
        addToLoopCount();
        
        switch on context {
            when BEFORE_INSERT { this.beforeInsert(); }
            when BEFORE_UPDATE { this.beforeUpdate(); }
            when BEFORE_DELETE { this.beforeDelete(); }
            when AFTER_INSERT { this.afterInsert(); }
            when AFTER_UPDATE { this.afterUpdate(); }
            when AFTER_DELETE { this.afterDelete(); }
            when AFTER_UNDELETE { this.afterUndelete(); }
        }
    }
    
    // Context methods - override in concrete handlers
    protected virtual void beforeInsert() {}
    protected virtual void beforeUpdate() {}
    protected virtual void beforeDelete() {}
    protected virtual void afterInsert() {}
    protected virtual void afterUpdate() {}
    protected virtual void afterDelete() {}
    protected virtual void afterUndelete() {}
    
    // Bypass methods
    public static void bypass(String handlerName) {
        bypassedHandlers.add(handlerName);
    }
    
    public static void clearBypass(String handlerName) {
        bypassedHandlers.remove(handlerName);
    }
    
    public static Boolean isBypassed(String handlerName) {
        return bypassedHandlers.contains(handlerName);
    }
    
    public static void clearAllBypasses() {
        bypassedHandlers.clear();
    }
    
    // Loop count methods
    public void setMaxLoopCount(Integer max) {
        String handlerName = getHandlerName();
        if (!loopCountMap.containsKey(handlerName)) {
            loopCountMap.put(handlerName, new LoopCount(max));
        } else {
            loopCountMap.get(handlerName).setMax(max);
        }
    }
    
    // Private methods
    @TestVisible
    private void setTriggerContext() {
        this.isTriggerExecuting = Trigger.isExecuting;
        this.context = Trigger.operationType;
    }
    
    private Boolean validateRun() {
        if (!this.isTriggerExecuting || this.context == null) {
            throw new TriggerHandlerException('Trigger handler called outside of trigger context');
        }
        return !bypassedHandlers.contains(getHandlerName());
    }
    
    private String getHandlerName() {
        return String.valueOf(this).split(':')[0];
    }
    
    private void addToLoopCount() {
        String handlerName = getHandlerName();
        if (loopCountMap.containsKey(handlerName)) {
            Boolean exceeded = loopCountMap.get(handlerName).increment();
            if (exceeded) {
                throw new TriggerHandlerException('Maximum loop count exceeded for ' + handlerName);
            }
        }
    }
    
    // Inner classes
    @TestVisible
    private class LoopCount {
        private Integer max;
        private Integer count;
        
        public LoopCount(Integer max) {
            this.max = max;
            this.count = 0;
        }
        
        public Boolean increment() {
            this.count++;
            return this.count > this.max;
        }
        
        public void setMax(Integer max) {
            this.max = max;
        }
    }
    
    public class TriggerHandlerException extends Exception {}
}
```

### Concrete Handler Example
```apex
public class AccountTriggerHandler extends TriggerHandler {
    
    private List<Account> newAccounts;
    private List<Account> oldAccounts;
    private Map<Id, Account> newAccountMap;
    private Map<Id, Account> oldAccountMap;
    
    public AccountTriggerHandler() {
        this.newAccounts = (List<Account>) Trigger.new;
        this.oldAccounts = (List<Account>) Trigger.old;
        this.newAccountMap = (Map<Id, Account>) Trigger.newMap;
        this.oldAccountMap = (Map<Id, Account>) Trigger.oldMap;
    }
    
    protected override void beforeInsert() {
        setDefaults();
        validateAccounts();
    }
    
    protected override void afterInsert() {
        createRelatedRecords();
    }
    
    protected override void beforeUpdate() {
        validateAccounts();
    }
    
    protected override void afterUpdate() {
        syncToExternalSystem();
    }
    
    // Private methods
    private void setDefaults() {
        for (Account acc : newAccounts) {
            if (String.isBlank(acc.Industry)) {
                acc.Industry = 'Other';
            }
        }
    }
    
    private void validateAccounts() {
        for (Account acc : newAccounts) {
            if (acc.AnnualRevenue < 0) {
                acc.AnnualRevenue.addError('Revenue cannot be negative');
            }
        }
    }
    
    private void createRelatedRecords() {
        // Implementation
    }
    
    private void syncToExternalSystem() {
        // Implementation
    }
}
```

