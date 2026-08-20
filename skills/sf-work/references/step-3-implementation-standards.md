# Step 3: Implementation Standards

Read with `sf-work/SKILL.md`. Procedure lives here.

## Step 3: Implementation Standards
### Apex Code

* Follow existing trigger handler pattern in codebase

* Bulkify all operations (handle 200+ records)

* CRUD/FLS enforcement on all database operations

* Proper exception handling

* Meaningful method and variable names

### Flows

* Clear element naming (e.g., `Get_Account_Details`, `Decision_Check_Status`)

* Entry conditions to prevent unnecessary execution

* Bulkified operations (no DML/SOQL in loops)

* Fault handling for error scenarios

### LWC

* Component naming follows existing conventions

* Proper error handling and loading states

* Accessible markup (ARIA, keyboard navigation)

* Efficient wire/imperative Apex calls

### Test Classes

* Minimum 90% code coverage target

* Bulk tests (200+ records)

* Positive and negative scenarios

* Test as different user contexts when relevant

***

