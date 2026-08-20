# When to use

Read with `metadata-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">When to use</span>
<span data-proof="authored" data-by="ai:claude">This skill consolidates six metadata generators into one. Pick the right</span> <span data-proof="authored" data-by="ai:claude">`--type`</span> <span data-proof="authored" data-by="ai:claude">for the work:</span>

| <span data-proof="authored" data-by="ai:claude">`--type`</span>         | <span data-proof="authored" data-by="ai:claude">Generates</span>             | <span data-proof="authored" data-by="ai:claude">File path</span>                                             |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| <span data-proof="authored" data-by="ai:claude">`object`</span>         | <span data-proof="authored" data-by="ai:claude">`CustomObject`</span>        | <span data-proof="authored" data-by="ai:claude">`objects/<Object>/<Object>.object-meta.xml`</span>           |
| <span data-proof="authored" data-by="ai:claude">`field`</span>          | <span data-proof="authored" data-by="ai:claude">`CustomField`</span>         | <span data-proof="authored" data-by="ai:claude">`objects/<Object>/fields/<Field>.field-meta.xml`</span>      |
| <span data-proof="authored" data-by="ai:claude">`app`</span>            | <span data-proof="authored" data-by="ai:claude">`CustomApplication`</span>   | <span data-proof="authored" data-by="ai:claude">`applications/<App>.app-meta.xml`</span>                     |
| <span data-proof="authored" data-by="ai:claude">`tab`</span>            | <span data-proof="authored" data-by="ai:claude">`CustomTab`</span>           | <span data-proof="authored" data-by="ai:claude">`tabs/<Tab>.tab-meta.xml`</span>                             |
| <span data-proof="authored" data-by="ai:claude">`listview`</span>       | <span data-proof="authored" data-by="ai:claude">`ListView`</span>            | <span data-proof="authored" data-by="ai:claude">`objects/<Object>/listViews/<View>.listView-meta.xml`</span> |
| <span data-proof="authored" data-by="ai:claude">`lightning-type`</span> | <span data-proof="authored" data-by="ai:claude">`CustomLightningType`</span> | <span data-proof="authored" data-by="ai:claude">`lightningTypes/<Type>.lightningType-meta.xml`</span>        |

<span data-proof="authored" data-by="ai:claude">If the user is asking for an entire Lightning app (object + fields + tabs + flexipage + perm set), use</span> <span data-proof="authored" data-by="ai:claude">`/lightning-page-generate`</span> <span data-proof="authored" data-by="ai:claude">instead — it orchestrates this skill across multiple types.</span>

***

