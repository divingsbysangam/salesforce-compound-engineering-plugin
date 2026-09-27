# Type: `object` — CustomObject

Read with `metadata-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Type:</span> <span data-proof="authored" data-by="ai:claude">`object`</span> <span data-proof="authored" data-by="ai:claude">— CustomObject</span>
### <span data-proof="authored" data-by="ai:claude">Required attributes</span>

| <span data-proof="authored" data-by="ai:claude">Element</span>              | <span data-proof="authored" data-by="ai:claude">Constraint</span>                                                                                                                                                                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`<label>`</span>            | <span data-proof="authored" data-by="ai:claude">Singular UI name</span>                                                                                                                                                                                                      |
| <span data-proof="authored" data-by="ai:claude">`<pluralLabel>`</span>      | <span data-proof="authored" data-by="ai:claude">Plural UI name</span>                                                                                                                                                                                                        |
| <span data-proof="authored" data-by="ai:claude">`<sharingModel>`</span>     | <span data-proof="authored" data-by="ai:claude">See sharing rules below</span>                                                                                                                                                                                               |
| <span data-proof="authored" data-by="ai:claude">`<deploymentStatus>`</span> | <span data-proof="authored" data-by="ai:claude">Always</span> <span data-proof="authored" data-by="ai:claude">`Deployed`</span>                                                                                                                                              |
| <span data-proof="authored" data-by="ai:claude">`<nameField>`</span>        | <span data-proof="authored" data-by="ai:claude">Primary identifier (with</span> <span data-proof="authored" data-by="ai:claude">`<label>`</span> <span data-proof="authored" data-by="ai:claude">and</span> <span data-proof="authored" data-by="ai:claude">`<type>`)</span> |
| <span data-proof="authored" data-by="ai:claude">`<visibility>`</span>       | <span data-proof="authored" data-by="ai:claude">`Public`</span>                                                                                                                                                                                                              |

### <span data-proof="authored" data-by="ai:claude">Sharing model rules (Principle 1)</span>

* **<span data-proof="authored" data-by="ai:claude">Default</span>**<span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`<sharingModel>ReadWrite</sharingModel>`</span>

* **<span data-proof="authored" data-by="ai:claude">Exception</span>**<span data-proof="authored" data-by="ai:claude">: If the object</span> **<span data-proof="authored" data-by="ai:claude">contains a Master-Detail field</span>**<span data-proof="authored" data-by="ai:claude">, sharing MUST be</span> <span data-proof="authored" data-by="ai:claude">`<sharingModel>ControlledByParent</sharingModel>`. This is non-negotiable; otherwise the deploy fails.</span>

### <span data-proof="authored" data-by="ai:claude">File</span>

```
force-app/main/default/objects/<ObjectApiName>/<ObjectApiName>.object-meta.xml
```

<span data-proof="authored" data-by="ai:claude">The API Name is the</span> **<span data-proof="authored" data-by="ai:claude">filename</span>**<span data-proof="authored" data-by="ai:claude">, not a tag.</span> <span data-proof="authored" data-by="ai:claude">`Vehicle__c.object-meta.xml`.</span>

***

