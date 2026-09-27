# Type: `listview` — ListView

Read with `metadata-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Type:</span> <span data-proof="authored" data-by="ai:claude">`listview`</span> <span data-proof="authored" data-by="ai:claude">— ListView</span>
### <span data-proof="authored" data-by="ai:claude">Key elements</span>

| <span data-proof="authored" data-by="ai:claude">Element</span>                | <span data-proof="authored" data-by="ai:claude">Notes</span>                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`<fullName>`</span>           | <span data-proof="authored" data-by="ai:claude">API name (also the filename)</span>                                                                                                                                                                                                                                                          |
| <span data-proof="authored" data-by="ai:claude">`<label>`</span>              | <span data-proof="authored" data-by="ai:claude">UI name (under 40 characters)</span>                                                                                                                                                                                                                                                         |
| <span data-proof="authored" data-by="ai:claude">`<filterScope>`</span>        | <span data-proof="authored" data-by="ai:claude">`Everything`</span> <span data-proof="authored" data-by="ai:claude">/</span> <span data-proof="authored" data-by="ai:claude">`Mine`</span> <span data-proof="authored" data-by="ai:claude">/</span> <span data-proof="authored" data-by="ai:claude">`Queue`</span>                           |
| <span data-proof="authored" data-by="ai:claude">`<filters>`</span>            | <span data-proof="authored" data-by="ai:claude">Array of</span> <span data-proof="authored" data-by="ai:claude">`<columnName>`,</span> <span data-proof="authored" data-by="ai:claude">`<operation>`,</span> <span data-proof="authored" data-by="ai:claude">`<value>`</span> <span data-proof="authored" data-by="ai:claude">triples</span> |
| <span data-proof="authored" data-by="ai:claude">`<booleanFilterLogic>`</span> | <span data-proof="authored" data-by="ai:claude">Optional combinator:</span> <span data-proof="authored" data-by="ai:claude">`"1 AND (2 OR 3)"`</span>                                                                                                                                                                                        |
| <span data-proof="authored" data-by="ai:claude">`<columns>`</span>            | <span data-proof="authored" data-by="ai:claude">Ordered list of field API names</span>                                                                                                                                                                                                                                                       |

### <span data-proof="authored" data-by="ai:claude">Visibility decision</span>

* **<span data-proof="authored" data-by="ai:claude">Visible to all users</span>** <span data-proof="authored" data-by="ai:claude">— when the view is broadly useful and should be source-controlled.</span>

* **<span data-proof="authored" data-by="ai:claude">Visible to certain groups / queues</span>** <span data-proof="authored" data-by="ai:claude">— when restricted by team / role / permission.</span>

* **<span data-proof="authored" data-by="ai:claude">Visible only to me</span>** <span data-proof="authored" data-by="ai:claude">— never; personal views don't belong in source control.</span>

### <span data-proof="authored" data-by="ai:claude">File</span>

```
force-app/main/default/objects/<ObjectApiName>/listViews/<fullName>.listView-meta.xml
```

<span data-proof="authored" data-by="ai:claude">Inline list views inside</span> <span data-proof="authored" data-by="ai:claude">`<ObjectApiName>.object-meta.xml`</span> <span data-proof="authored" data-by="ai:claude">are allowed but discouraged — keep them as separate files for clean diffs.</span>

***

