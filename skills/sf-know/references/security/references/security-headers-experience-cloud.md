# Security Headers (Experience Cloud)

Read with `security-guide/SKILL.md`. Procedure lives here.

## Security Headers (Experience Cloud)
```apex
// In controller or filter
public PageReference setSecurityHeaders() {
    ApexPages.currentPage().getHeaders().put('X-Content-Type-Options', 'nosniff');
    ApexPages.currentPage().getHeaders().put('X-Frame-Options', 'SAMEORIGIN');
    ApexPages.currentPage().getHeaders().put('X-XSS-Protection', '1; mode=block');
    return null;
}
```

