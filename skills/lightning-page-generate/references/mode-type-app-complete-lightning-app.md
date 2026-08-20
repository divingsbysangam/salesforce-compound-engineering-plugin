# Mode: `--type app` — complete Lightning app

Read with `lightning-page-generate/SKILL.md`. Procedure lives here.

## Mode: `--type app` — complete Lightning app
This mode orchestrates multiple metadata types in dependency order. Treat it as a mini-pipeline — each step produces an artifact the next consumes.

### Step 0: Spec the app (Principle 4 — spec is the artifact)

Before any generation, write a spec that names:

- **App name and label**
- **Custom objects needed** (each with API name, sharing model, master-detail relationships)
- **Custom fields per object** (type, label, required/optional, external ID flag)
- **Tabs** (one per object, plus any web/Visualforce tabs)
- **FlexiPages** (one record page per object minimum; optional app/home pages)
- **List views** (per-object curated views)
- **Validation rules** (data quality enforcement)
- **Permission set** (grants access to the new metadata)
- **Verification Strategy** — what does an end user actually do to exercise this app?

Save the spec to `docs/plans/YYYY-MM-DD-feat-<app-slug>-spec.md`. Present to the user. **Do not proceed without explicit approval** — the spec is the contract (Principle 4).

### Step 1: Generate in dependency order

Order matters — each metadata type depends on previous ones:

```
1. CustomObject(s)          via /metadata-generate --type object
2. CustomField(s)           via /metadata-generate --type field   (per object, after object exists)
3. CustomTab(s)             via /metadata-generate --type tab     (after object + fields)
4. FlexiPage(s)             via /lightning-page-generate --type page (after tab)
5. CustomApplication        via /metadata-generate --type app     (after tabs + flexipages)
6. ListView(s)              via /metadata-generate --type listview
7. ValidationRule(s)        via /validation-rule-generate
8. PermissionSet            via /permission-set-generate          (LAST — grants access to all the above)
```

Each step is a separate skill dispatch. Don't try to bundle into one giant XML write.

### Step 2: Deploy in the same order

```bash
# Deploy each artifact in dependency order
sf project deploy start --metadata CustomObject:<Object1>,CustomObject:<Object2>
sf project deploy start --metadata CustomField:<Object1>.<Field1>,...
# ... and so on through the chain
```

If any deploy fails, **stop** and diagnose before generating more (Principle 3 — jagged-edge errors compound).

### Step 3: Validate end-to-end

After all metadata is deployed:

- Dispatch `metadata-consistency-checker` — cross-metadata coherence (every field referenced exists, every tab references a real object, every flexipage references real fields, etc.)
- Run any tests that exercise the new objects.
- Manually open the app in the org and walk the Verification Strategy from Step 0.

### Step 4: Capture (Principle 7)

Run `/sf-compound` to write the app architecture to `docs/solutions/`. App architectures are exactly the kind of institutional memory that pays back on the second similar app.

### Output

```
Generated app: <AppApiName>

Metadata produced:
- {n} CustomObjects:    {list}
- {n} CustomFields:     {list (object.field)}
- {n} CustomTabs:       {list}
- {n} FlexiPages:       {list}
- 1 CustomApplication:  {AppApiName}
- {n} ListViews:        {list}
- {n} ValidationRules:  {list}
- 1 PermissionSet:      {PermSetApiName}

Deploy:      All steps PASS
Reviews:
- metadata-consistency-checker:    {findings count}

Verification Strategy: {one paragraph — how a user exercises this app end-to-end}
```

---

