# Step 3: Generate the authoring bundle

Read with `agentforce-develop/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Step 3: Generate the authoring bundle</span>
```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6MTA0LCJhdHRycyI6eyJieSI6ImFpOmNsYXVkZSJ9fV0=
sf agent generate authoring-bundle --json --no-spec --name "<Display Label>" --api-name <Developer_Name>
```

<span data-proof="authored" data-by="ai:claude">This produces an</span> <span data-proof="authored" data-by="ai:claude">`aiAuthoringBundle`</span> <span data-proof="authored" data-by="ai:claude">directory under</span> <span data-proof="authored" data-by="ai:claude">`force-app/main/default/aiAuthoringBundles/<Developer_Name>/`</span> <span data-proof="authored" data-by="ai:claude">containing a</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">file (Agent Script source) and</span> <span data-proof="authored" data-by="ai:claude">`bundle-meta.xml`.</span>

<span data-proof="authored" data-by="ai:claude">Never create</span> <span data-proof="authored" data-by="ai:claude">`.agent`</span> <span data-proof="authored" data-by="ai:claude">or</span> <span data-proof="authored" data-by="ai:claude">`bundle-meta.xml`</span> <span data-proof="authored" data-by="ai:claude">files manually. Always go through</span> <span data-proof="authored" data-by="ai:claude">`sf agent generate`.</span>

***

