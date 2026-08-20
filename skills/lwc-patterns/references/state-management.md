# State Management

Read with `lwc-patterns/SKILL.md`. Procedure lives here.

## State Management
### Reactive Properties

```javascript
import { LightningElement, track } from 'lwc';

export default class StateExample extends LightningElement {
    // Primitive - reactive by default
    count = 0;
    
    // Object - use @track for deep reactivity (or reassign)
    @track formData = {
        name: '',
        email: ''
    };
    
    // Array - reassign for reactivity
    items = [];
    
    incrementCount() {
        this.count++; // Triggers re-render
    }
    
    updateName(event) {
        this.formData.name = event.target.value; // Works with @track
    }
    
    addItem(item) {
        // Create new array to trigger reactivity
        this.items = [...this.items, item];
    }
    
    removeItem(index) {
        this.items = this.items.filter((_, i) => i !== index);
    }
}
```

### Container/Presenter Pattern

```javascript
// Container - handles data and logic
// accountListContainer.js
import { LightningElement, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';

export default class AccountListContainer extends LightningElement {
    @wire(getAccounts)
    accounts;
    
    handleSelect(event) {
        // Business logic
        this.navigateToRecord(event.detail.accountId);
    }
}
```

```html
<!-- accountListContainer.html -->
<template>
    <c-account-list
        accounts={accounts.data}
        onselect={handleSelect}>
    </c-account-list>
</template>
```

```javascript
// Presenter - pure UI component
// accountList.js
import { LightningElement, api } from 'lwc';

export default class AccountList extends LightningElement {
    @api accounts = [];
    
    handleClick(event) {
        this.dispatchEvent(new CustomEvent('select', {
            detail: { accountId: event.currentTarget.dataset.id }
        }));
    }
}
```

