# Error Handling Pattern

Read with `lwc-patterns/SKILL.md`. Procedure lives here.

## Error Handling Pattern
```javascript
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ErrorHandling extends LightningElement {
    async handleAction() {
        try {
            await this.performAction();
            this.showToast('Success', 'Operation completed', 'success');
        } catch (error) {
            this.handleError(error);
        }
    }
    
    handleError(error) {
        let message = 'An unknown error occurred';
        
        if (error.body && error.body.message) {
            message = error.body.message;
        } else if (error.message) {
            message = error.message;
        }
        
        this.showToast('Error', message, 'error');
        console.error('Error:', JSON.stringify(error));
    }
    
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant
        }));
    }
}
```
