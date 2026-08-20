# Type: `app` — CustomApplication (Lightning App)

Read with `metadata-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Type:</span> <span data-proof="authored" data-by="ai:claude">`app`</span> <span data-proof="authored" data-by="ai:claude">— CustomApplication (Lightning App)</span>
### <span data-proof="authored" data-by="ai:claude">Required attributes</span>

| <span data-proof="authored" data-by="ai:claude">Element</span>         | <span data-proof="authored" data-by="ai:claude">Notes</span>                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span data-proof="authored" data-by="ai:claude">`<fullName>`</span>    | <span data-proof="authored" data-by="ai:claude">API name</span>                                                                                                                                                                                                                                               |
| <span data-proof="authored" data-by="ai:claude">`<label>`</span>       | <span data-proof="authored" data-by="ai:claude">Display name</span>                                                                                                                                                                                                                                           |
| <span data-proof="authored" data-by="ai:claude">`<uiType>`</span>      | <span data-proof="authored" data-by="ai:claude">Always</span> <span data-proof="authored" data-by="ai:claude">`Lightning`</span>                                                                                                                                                                              |
| <span data-proof="authored" data-by="ai:claude">`<navType>`</span>     | <span data-proof="authored" data-by="ai:claude">`Standard`</span> <span data-proof="authored" data-by="ai:claude">(default) or</span> <span data-proof="authored" data-by="ai:claude">`Console`</span> <span data-proof="authored" data-by="ai:claude">(multi-record workflows like service / support)</span> |
| <span data-proof="authored" data-by="ai:claude">`<formFactors>`</span> | <span data-proof="authored" data-by="ai:claude">`["LARGE"]`</span> <span data-proof="authored" data-by="ai:claude">desktop,</span> <span data-proof="authored" data-by="ai:claude">`["SMALL"]`</span> <span data-proof="authored" data-by="ai:claude">mobile, or both</span>                                  |

### <span data-proof="authored" data-by="ai:claude">Highly recommended</span>

* <span data-proof="authored" data-by="ai:claude">`<brand>`</span> <span data-proof="authored" data-by="ai:claude">block — header color, footer color, override-org-theme flag. Without branding, the app looks generic.</span>

* <span data-proof="authored" data-by="ai:claude">`<actionOverrides>`</span> <span data-proof="authored" data-by="ai:claude">— required when custom record pages exist. List the action override entries.</span>

* <span data-proof="authored" data-by="ai:claude">`<utilityBar>`</span> <span data-proof="authored" data-by="ai:claude">— reference a</span> <span data-proof="authored" data-by="ai:claude">`UtilityBar`</span> <span data-proof="authored" data-by="ai:claude">config if the app needs one.</span>

### <span data-proof="authored" data-by="ai:claude">Decision: Standard vs Console nav</span>

* **<span data-proof="authored" data-by="ai:claude">Standard</span>** <span data-proof="authored" data-by="ai:claude">— default. General sales / marketing / operations apps.</span>

* **<span data-proof="authored" data-by="ai:claude">Console</span>** <span data-proof="authored" data-by="ai:claude">— only for support / service / call center workflows that need multi-record split-view workspaces. Don't use Console for ordinary apps; it confuses end users.</span>

### <span data-proof="authored" data-by="ai:claude">File</span>

```
force-app/main/default/applications/<AppApiName>.app-meta.xml
```

***

