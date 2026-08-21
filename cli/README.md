# salesforce-compound-engineering-plugin

> Renamed from `@divings/sf-compound-plugin`, which is superseded at 1.0.1 and no longer updated.

Installer for the [SF Compound Engineering Plugin](https://github.com/divingsbysangam/salesforce-compound-engineering-plugin) — Salesforce-aware compound engineering workflows for 11 AI coding tools that are not Claude Code.

Claude Code users do not need this package; install the plugin natively with
`/plugin marketplace add https://github.com/divingsbysangam/salesforce-compound-engineering-plugin`.

## Usage

Run it from the project you want the plugin installed into:

```bash
cd ~/code/my-salesforce-project
bunx salesforce-compound-engineering-plugin install sf-compound-engineering --to cursor
```

`npx -y salesforce-compound-engineering-plugin …` works the same way if you do not have Bun.

The plugin source is downloaded from GitHub on first run and cached under
`$XDG_CACHE_HOME/sfce/plugins` (or `~/.cache/sfce/plugins`). Converted files are
written into the current directory unless `--output` says otherwise.

### Targets

`copilot`, `cursor`, `windsurf`, `gemini`, `opencode`, `codex`, `kiro`, `droid`,
`pi`, `openclaw`, `qwen`, or `all` to install into every tool detected in the
output directory.

### Flags

| Flag | Purpose |
| --- | --- |
| `--to <target>` | Target tool, or `all` (required for `install`) |
| `--output <dir>` | Where to install (default: current directory) |
| `--ref <branch>` | Branch or tag to download instead of the default branch |
| `--offline` | Use the cached plugin copy; never reach the network |
| `--scope <global\|workspace>` | Windsurf install scope |

### Other commands

```bash
bunx salesforce-compound-engineering-plugin sync            # re-run conversion in place
bunx salesforce-compound-engineering-plugin lint            # check for dangling references
bunx salesforce-compound-engineering-plugin feed list       # Tend runtime
```

## Installed globally

`npm i -g salesforce-compound-engineering-plugin` provides two identical commands —
the full package name, and `sf-compound-plugin` as a shorter alias:

```bash
sf-compound-plugin install sf-compound-engineering --to cursor
```

## Requirements

- Node.js 18+ (or Bun 1.0+)
- `git` on PATH — used to download the plugin when you pass a plugin name rather than a path

## License

MIT
