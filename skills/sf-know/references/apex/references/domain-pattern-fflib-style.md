# Domain Pattern (fflib style)

Read with `apex-patterns/SKILL.md`. Procedure lives here.

## Domain Pattern (fflib style)
```apex
public class Accounts extends fflib_SObjectDomain {
    
    public Accounts(List<Account> records) {
        super(records);
    }
    
    public override void onBeforeInsert() {
        setDefaults();
        validate();
    }
    
    public override void onBeforeUpdate(Map<Id, SObject> existingRecords) {
        validate();
        detectChanges((Map<Id, Account>) existingRecords);
    }
    
    public override void onAfterInsert() {
        createWelcomeTasks();
    }
    
    private void setDefaults() {
        for (Account acc : (List<Account>) Records) {
            if (acc.Rating == null) {
                acc.Rating = 'Cold';
            }
        }
    }
    
    private void validate() {
        for (Account acc : (List<Account>) Records) {
            if (acc.Name != null && acc.Name.length() > 100) {
                acc.Name.addError('Name cannot exceed 100 characters');
            }
        }
    }
    
    private void detectChanges(Map<Id, Account> oldAccounts) {
        for (Account acc : (List<Account>) Records) {
            Account oldAcc = oldAccounts.get(acc.Id);
            if (acc.OwnerId != oldAcc.OwnerId) {
                // Owner changed - do something
            }
        }
    }
    
    private void createWelcomeTasks() {
        List<Task> tasks = new List<Task>();
        for (Account acc : (List<Account>) Records) {
            tasks.add(new Task(
                WhatId = acc.Id,
                OwnerId = acc.OwnerId,
                Subject = 'Welcome call for ' + acc.Name,
                ActivityDate = Date.today().addDays(7)
            ));
        }
        insert tasks;
    }
    
    public class Constructor implements fflib_SObjectDomain.IConstructable {
        public fflib_SObjectDomain construct(List<SObject> records) {
            return new Accounts(records);
        }
    }
}
```

