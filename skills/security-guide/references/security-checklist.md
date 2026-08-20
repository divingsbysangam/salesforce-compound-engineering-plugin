# Security Checklist

Read with `security-guide/SKILL.md`. Procedure lives here.

## Security Checklist
### Before Code Review

* [ ] All queries use bind variables or SECURITY\_ENFORCED

* [ ] CRUD/FLS checks on all DML operations

* [ ] Classes use appropriate sharing keyword

* [ ] No hardcoded credentials or sensitive data

* [ ] User input validated and sanitized

* [ ] Sensitive data not logged

* [ ] LWC components don't use innerHTML with user data

### Before Deployment

* [ ] Security review completed

* [ ] Penetration testing (if applicable)

* [ ] Permission sets configured correctly

* [ ] Sharing rules validated