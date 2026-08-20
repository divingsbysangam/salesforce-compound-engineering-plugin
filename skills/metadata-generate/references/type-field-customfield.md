# Type: `field` — CustomField

Read with `metadata-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Type:</span> <span data-proof="authored" data-by="ai:claude">`field`</span> <span data-proof="authored" data-by="ai:claude">— CustomField</span>
### <span data-proof="authored" data-by="ai:claude">Required attributes (every field)</span>

| <span data-proof="authored" data-by="ai:claude">Element</span>            | <span data-proof="authored" data-by="ai:claude">Notes</span>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`<fullName>`</span>       | <span data-proof="authored" data-by="ai:claude">Derive from</span> <span data-proof="authored" data-by="ai:claude">`<label>`: capitalize each word, replace spaces with</span> <span data-proof="authored" data-by="ai:claude">`_`, append</span> <span data-proof="authored" data-by="ai:claude">`__c`. E.g.,</span> <span data-proof="authored" data-by="ai:claude">`Total Contract Value`</span> <span data-proof="authored" data-by="ai:claude">→</span> <span data-proof="authored" data-by="ai:claude">`Total_Contract_Value__c`</span> |
| <span data-proof="authored" data-by="ai:claude">`<label>`</span>          | <span data-proof="authored" data-by="ai:claude">Title Case UI name</span>                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| <span data-proof="authored" data-by="ai:claude">`<description>`</span>    | **<span data-proof="authored" data-by="ai:claude">Mandatory</span>** <span data-proof="authored" data-by="ai:claude">— state the business "why"</span>                                                                                                                                                                                                                                                                                                                                                                                        |
| <span data-proof="authored" data-by="ai:claude">`<inlineHelpText>`</span> | **<span data-proof="authored" data-by="ai:claude">Mandatory</span>** <span data-proof="authored" data-by="ai:claude">— actionable guidance, not just a label restatement</span>                                                                                                                                                                                                                                                                                                                                                               |

### <span data-proof="authored" data-by="ai:claude">Type-specific gotchas (the high-failure-rate types)</span>

**<span data-proof="authored" data-by="ai:claude">Roll-up Summary</span>** <span data-proof="authored" data-by="ai:claude">— most common deploy failure:</span>

* <span data-proof="authored" data-by="ai:claude">Required:</span> <span data-proof="authored" data-by="ai:claude">`<summaryOperation>`</span> <span data-proof="authored" data-by="ai:claude">(`count`</span> <span data-proof="authored" data-by="ai:claude">/</span> <span data-proof="authored" data-by="ai:claude">`sum`</span> <span data-proof="authored" data-by="ai:claude">/</span> <span data-proof="authored" data-by="ai:claude">`min`</span> <span data-proof="authored" data-by="ai:claude">/</span> <span data-proof="authored" data-by="ai:claude">`max`),</span> <span data-proof="authored" data-by="ai:claude">`<summarizedField>`</span> <span data-proof="authored" data-by="ai:claude">(the field on the child being summarized),</span> <span data-proof="authored" data-by="ai:claude">`<summaryForeignKey>`</span> <span data-proof="authored" data-by="ai:claude">(the Master-Detail relationship field on the child).</span>

* <span data-proof="authored" data-by="ai:claude">The relationship MUST be Master-Detail, not Lookup.</span>

* <span data-proof="authored" data-by="ai:claude">For</span> <span data-proof="authored" data-by="ai:claude">`count`, omit</span> <span data-proof="authored" data-by="ai:claude">`<summarizedField>`.</span>

**<span data-proof="authored" data-by="ai:claude">Master-Detail</span>** <span data-proof="authored" data-by="ai:claude">— restricted attributes:</span>

* <span data-proof="authored" data-by="ai:claude">Required:</span> <span data-proof="authored" data-by="ai:claude">`<referenceTo>`,</span> <span data-proof="authored" data-by="ai:claude">`<relationshipName>`,</span> <span data-proof="authored" data-by="ai:claude">`<relationshipLabel>`.</span>

* <span data-proof="authored" data-by="ai:claude">Forbidden:</span> <span data-proof="authored" data-by="ai:claude">`<defaultValue>`,</span> <span data-proof="authored" data-by="ai:claude">`<required>true</required>`</span> <span data-proof="authored" data-by="ai:claude">(the relationship is required by definition).</span>

* <span data-proof="authored" data-by="ai:claude">Once created, cannot be converted to Lookup without data migration.</span>

**<span data-proof="authored" data-by="ai:claude">Lookup with filter</span>** <span data-proof="authored" data-by="ai:claude">— restrictions:</span>

* <span data-proof="authored" data-by="ai:claude">Lookup filter formulas must reference fields on the source or related object only.</span>

* <span data-proof="authored" data-by="ai:claude">Cross-object references in filter formulas fail deploy.</span>

### <span data-proof="authored" data-by="ai:claude">External ID</span>

<span data-proof="authored" data-by="ai:claude">If the user mentions "integration", "importing data", "external system ID", or "unique key from</span> <span data-proof="authored" data-by="ai:claude"><System>", set</span> <span data-proof="authored" data-by="ai:claude">`<externalId>true</externalId>`. Applicable to Text, Number, Email types.</span>

### <span data-proof="authored" data-by="ai:claude">File</span>

```
force-app/main/default/objects/<ObjectApiName>/fields/<FieldApiName>.field-meta.xml
```

***

