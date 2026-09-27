# XSS Prevention

Read with `security-guide/SKILL.md`. Procedure lives here.

## XSS Prevention
### In Visualforce

```html
<!-- Text output - auto-escaped -->
{!account.Name}

<!-- Explicit encoding functions -->
{!HTMLENCODE(userInput)}
{!JSENCODE(userInput)}
{!JSINHTMLENCODE(userInput)}
{!URLENCODE(userInput)}
```

### In LWC

```javascript
// Safe: Template expressions are auto-escaped
// In template: {userInput}

// DANGER: Never use innerHTML with user data
element.innerHTML = userInput; // XSS VULNERABILITY!

// Safe: Use textContent
element.textContent = userInput;
```

