# Flow Patterns

**SCOPE: AUTOMATION_ONLY** - This skill applies ONLY to Flows (Record-Triggered, Screen, Scheduled, Platform Event-Triggered).
**DO NOT** use this skill for Apex code or LWC components. For Apex patterns, use `sf-know mode:apex` instead.

---

Patterns and best practices for building Salesforce Flows.

## When to Use This Skill

- Building Record-Triggered Flows
- Building Screen Flows
- Building Scheduled Flows
- Building Platform Event-Triggered Flows
- Choosing between Flow and Apex

---

## Flow Types Reference

| Flow Type | Use When |
|-----------|----------|
| Record-Triggered | Automate on record create/update/delete |
| Screen Flow | User-facing forms, wizards, guided processes |
| Scheduled | Time-based automation, batch-like processing |
| Platform Event-Triggered | React to events from external systems |
| Autolaunched | Called from Apex, other Flows, or Process Builder |

---

## Record-Triggered Flow Patterns

### Pattern 1: Entry Conditions

Always use entry conditions to prevent unnecessary runs:

```
Entry Condition:
  - Status EQUALS 'New'
  - AND RecordType.DeveloperName EQUALS 'Standard'
  - AND IsProcessed__c EQUALS false
```

### Pattern 2: Prevent Recursion

Use a checkbox field to prevent recursive execution:

```
Flow Start:
  Condition: IsFlowProcessed__c = false

Decision:
  Check if already processed

Update Record:
  Set IsFlowProcessed__c = true
```

### Pattern 3: Before vs After Save

| Timing | Use For |
|--------|---------|
| Before Save | Field updates on triggering record (no DML cost) |
| After Save | Creating/updating related records, callouts |

**Before Save** - Fast, no DML counted:
```
Update triggering record fields directly
No "Update Records" element needed
```

**After Save** - Full capabilities:
```
Create child records
Update parent records
Send emails
Make callouts (with @future)
```

---

## Screen Flow Patterns

### Pattern 1: Multi-Step Wizard

```
Screen 1: Collect basic info
  → Assignment: Store in variables

Screen 2: Collect details
  → Assignment: Build record

Screen 3: Confirmation
  → Create/Update Records

Screen 4: Success message
```

### Pattern 2: Dynamic Choice

```
Get Records: Query available options
  → Store in collection variable

Screen: Display as picklist/radio
  → Use Record Choice Set from collection
```

### Pattern 3: Conditional Screens

```
Decision: Check user selection
  If Option A → Screen A
  If Option B → Screen B
  Default → Screen C
```

---

## Bulkification Patterns

### Pattern 1: Collection Variables

**Bad - Processes one record at a time:**
```
Loop over records
  → Get related record
  → Update related record
```

**Good - Bulkified:**
```
Get all related records at once (before loop)
Loop over records
  → Find match in collection (Assignment)
  → Add to update collection
End Loop
Update Records (collection) - single DML
```

### Pattern 2: Batch Processing with Scheduled Flow

For large data volumes, use Scheduled Flow:

```
Scheduled Flow (runs in batches of 200):
  Get Records: Query batch
  Loop: Process each record
  Update Records: Bulk update
```

---

## Subflow Patterns

### Pattern 1: Reusable Logic

Create subflow for common operations:

```
Main Flow:
  → Subflow: Validate Address
  → Subflow: Calculate Shipping
  → Subflow: Create Audit Log
```

### Pattern 2: Input/Output Variables

```
Subflow: Calculate_Discount

Input Variables:
  - {!Account} (Record)
  - {!TotalAmount} (Currency)

Output Variables:
  - {!DiscountPercent} (Number)
  - {!FinalAmount} (Currency)
```

---

## Flow + Apex Patterns

### Pattern 1: Invocable Action

When Flow can't do something, call Apex:

```apex
public class FlowActions {

    @InvocableMethod(label='Calculate Complex Value')
    public static List<Output> calculate(List<Input> inputs) {
        List<Output> outputs = new List<Output>();
        for (Input inp : inputs) {
            Output out = new Output();
            out.result = complexCalculation(inp.value);
            outputs.add(out);
        }
        return outputs;
    }

    public class Input {
        @InvocableVariable(required=true)
        public Decimal value;
    }

    public class Output {
        @InvocableVariable
        public Decimal result;
    }
}
```

### Pattern 2: Invocable with Collections

Handle bulk operations:

```apex
@InvocableMethod(label='Process Records')
public static List<List<Result>> processRecords(List<List<SObject>> recordLists) {
    // Process in bulk
}
```

---

## Error Handling Patterns

### Pattern 1: Fault Path

```
Create Records
  → On Success: Continue
  → On Fault:
    → Assignment: Store error message
    → Screen: Display error to user
```

### Pattern 2: Custom Validation

```
Decision: Validate input
  If Invalid:
    → Screen: Show validation error
    → Loop back to input screen
  If Valid:
    → Continue processing
```

---

## Flow Limits Reference

| Limit | Value |
|-------|-------|
| Elements per interview | 2,000 |
| Interviews per 24 hours | 250,000 (record-triggered) |
| Scheduled paths per Flow | 10 |
| Paused interviews | 50,000 |

See `governor-limits/SKILL.md` for full transaction limits.

---

## Anti-Patterns to Avoid

### 1. DML in Loop
```
AVOID:
Loop → Create Record (single)

USE:
Loop → Add to Collection
After Loop → Create Records (collection)
```

### 2. Query in Loop
```
AVOID:
Loop → Get Records

USE:
Get Records (all at once)
Loop → Filter in memory
```

### 3. Recursive Triggers
```
AVOID:
Flow triggers → Updates record → Flow triggers again

USE:
Entry condition: Check if already processed
Update: Set processed flag
```

### 4. Too Many Paths
```
AVOID:
One Flow with 50 Decision elements

USE:
Break into multiple focused Flows
Use Subflows for reusable logic
```

---

## Decision: Flow vs Apex

| Use Flow When | Use Apex When |
|---------------|---------------|
| Simple field updates | Complex calculations |
| Single object operations | Multi-object transactions |
| Admin can maintain | Developer-only changes |
| Sequential logic | Parallel processing |
| < 100 records | > 100 records (Batch Apex) |

When in doubt, start with Flow. Move to Apex when:
- Performance becomes an issue
- Logic is too complex for Flow
- Need unit test coverage requirements
