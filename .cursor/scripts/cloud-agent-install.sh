#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.bun/bin:${PATH}"

if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
  export PATH="${HOME}/.bun/bin:${PATH}"
fi

cd "${WORKSPACE:-/workspace}/cli"
bun install --frozen-lockfile
bun run build

cd "${WORKSPACE:-/workspace}"
python3 -m py_compile sfce.py __init__.py
