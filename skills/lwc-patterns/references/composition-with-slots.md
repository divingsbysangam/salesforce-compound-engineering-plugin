# Composition with Slots

Read with `lwc-patterns/SKILL.md`. Procedure lives here.

## Composition with Slots
```html
<!-- Base card component -->
<!-- baseCard.html -->
<template>
    <article class="slds-card">
        <header class="slds-card__header">
            <slot name="header">
                <h2>Default Header</h2>
            </slot>
        </header>
        <div class="slds-card__body">
            <slot></slot>
        </div>
        <footer class="slds-card__footer">
            <slot name="footer"></slot>
        </footer>
    </article>
</template>
```

```html
<!-- Usage -->
<c-base-card>
    <span slot="header">
        <lightning-icon icon-name="standard:account"></lightning-icon>
        Account Details
    </span>
    
    <!-- Default slot content -->
    <p>Account information goes here</p>
    
    <div slot="footer">
        <lightning-button label="Save" onclick={handleSave}></lightning-button>
    </div>
</c-base-card>
```

