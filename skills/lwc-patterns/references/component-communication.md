# Component Communication

Read with `lwc-patterns/SKILL.md`. Procedure lives here.

## Component Communication
### Parent to Child (Props)

```javascript
// Parent component
// parent.html
<template>
    <c-child-component 
        account-id={accountId}
        is-editable={isEditable}
        onupdate={handleChildUpdate}>
    </c-child-component>
</template>

// parent.js
import { LightningElement } from 'lwc';

export default class Parent extends LightningElement {
    accountId = '001xx000003DGXXX';
    isEditable = true;
    
    handleChildUpdate(event) {
        console.log('Child updated:', event.detail);
    }
}
```

```javascript
// Child component
// child.js
import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api accountId;
    @api isEditable;
    
    handleClick() {
        this.dispatchEvent(new CustomEvent('update', {
            detail: { accountId: this.accountId }
        }));
    }
}
```

### Child to Parent (Events)

```javascript
// child.js
handleSave() {
    const saveEvent = new CustomEvent('save', {
        detail: { 
            data: this.formData,
            timestamp: Date.now()
        },
        bubbles: false,
        composed: false
    });
    this.dispatchEvent(saveEvent);
}
```

### Sibling Communication (Pub/Sub)

```javascript
// pubsub.js - Shared module
const events = new Map();

export const subscribe = (eventName, callback) => {
    if (!events.has(eventName)) {
        events.set(eventName, new Set());
    }
    events.get(eventName).add(callback);
    return () => events.get(eventName).delete(callback);
};

export const publish = (eventName, payload) => {
    if (events.has(eventName)) {
        events.get(eventName).forEach(callback => callback(payload));
    }
};
```

```javascript
// publisher.js
import { publish } from 'c/pubsub';

handleFilterChange() {
    publish('filterChanged', { industry: this.selectedIndustry });
}
```

```javascript
// subscriber.js
import { LightningElement } from 'lwc';
import { subscribe } from 'c/pubsub';

export default class Subscriber extends LightningElement {
    unsubscribe;
    
    connectedCallback() {
        this.unsubscribe = subscribe('filterChanged', this.handleFilter.bind(this));
    }
    
    disconnectedCallback() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
    
    handleFilter(payload) {
        this.industry = payload.industry;
        this.refreshData();
    }
}
```

### Lightning Message Service

```javascript
// Using Lightning Message Service for cross-DOM communication
import { LightningElement, wire } from 'lwc';
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import ACCOUNT_SELECTED from '@salesforce/messageChannel/AccountSelected__c';

export default class Publisher extends LightningElement {
    @wire(MessageContext)
    messageContext;
    
    handleAccountSelect(event) {
        const payload = { accountId: event.target.dataset.id };
        publish(this.messageContext, ACCOUNT_SELECTED, payload);
    }
}
```

```javascript
// Subscriber
import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import ACCOUNT_SELECTED from '@salesforce/messageChannel/AccountSelected__c';

export default class Subscriber extends LightningElement {
    @wire(MessageContext)
    messageContext;
    
    subscription = null;
    
    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            ACCOUNT_SELECTED,
            (message) => this.handleMessage(message)
        );
    }
    
    handleMessage(message) {
        this.selectedAccountId = message.accountId;
    }
}
```

