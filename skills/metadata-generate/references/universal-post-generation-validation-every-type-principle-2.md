# Universal post-generation validation (every type, Principle 2)

Read with `metadata-generate/SKILL.md`. Procedure lives here.

## <span data-proof="authored" data-by="ai:claude">Universal post-generation validation (every type, Principle 2)</span>
```bash proof:W3sidHlwZSI6InByb29mQXV0aG9yZWQiLCJmcm9tIjowLCJ0byI6NTgsImF0dHJzIjp7ImJ5IjoiYWk6Y2xhdWRlIn19XQ==
sf code-analyzer run --target <generated-file-path> --json
```

<span data-proof="authored" data-by="ai:claude">Then dispatch in parallel:</span>

* <span data-proof="authored" data-by="ai:claude">Task</span> <span data-proof="authored" data-by="ai:claude">`metadata-consistency-checker(file_path)`</span> <span data-proof="authored" data-by="ai:claude">— cross-metadata coherence (e.g., the field references an object that exists; the tab references an object that exists)</span>

* <span data-proof="authored" data-by="ai:claude">Task</span> <span data-proof="authored" data-by="ai:claude">`pattern-recognition-specialist(file_path)`</span> <span data-proof="authored" data-by="ai:claude">— naming conventions, taste</span>

<span data-proof="authored" data-by="ai:claude">Remediate sev0/sev1/sev2. Don't declare done until both review agents return clean.</span>

***

