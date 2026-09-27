# Git Worktree Skill

Manage isolated development branches using git worktrees for parallel Salesforce development.

## What Are Worktrees?

Git worktrees let you have multiple branches checked out simultaneously in separate directories. Each worktree has its own working directory but shares the same `.git` history.

**Why for Salesforce?** Work on a hotfix while a feature branch has uncommitted changes, without stashing or losing context.

## Quick Commands

### Create a Worktree
```bash
# Create worktree for a new branch
git worktree add ../sf-feature-branch -b feature/my-feature

# Create worktree from existing branch
git worktree add ../sf-hotfix hotfix/urgent-fix
```

### List Worktrees
```bash
git worktree list
```

### Remove a Worktree
```bash
# After merging/completing work
git worktree remove ../sf-feature-branch

# Force remove (if changes exist)
git worktree remove --force ../sf-feature-branch
```

### Prune Stale Worktrees
```bash
git worktree prune
```

## Salesforce-Specific Considerations

### Auth Files
When creating a new worktree, Salesforce auth files are NOT shared. You may need to:

```bash
# Copy sfdx-project.json (usually tracked in git, so it's there)
# Re-authenticate if needed
sf org login web --alias myOrg

# Or copy auth from main worktree
sf org display --target-org myOrg --verbose
# Copy the instance URL and access token
```

### .sfdx Directory
The `.sfdx/` directory contains local org authentication. Options:
1. **Symlink** (recommended): `ln -s /path/to/main/.sfdx .sfdx`
2. **Re-auth**: Run `sf org login web` in the new worktree
3. **Copy**: `cp -r /path/to/main/.sfdx .sfdx`

### .env Files
If using `.env` for configuration:
```bash
cp /path/to/main/.env .env
```

## Workflow Pattern

```
main worktree (main branch)
├── feature worktree (feature/new-lwc)  ← Active development
├── hotfix worktree (hotfix/prod-fix)   ← Urgent fix
└── review worktree (review/pr-123)     ← Code review
```

## Best Practices

1. **Name worktree directories clearly**: `../sf-{purpose}-{branch}`
2. **Clean up after merging**: Always remove completed worktrees
3. **Don't deploy from worktrees**: Deploy only from the main worktree
4. **Share auth carefully**: Symlink `.sfdx` to avoid re-authenticating
