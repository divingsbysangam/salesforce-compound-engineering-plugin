#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUN_VERSION="$(tr -d '[:space:]' < "${SCRIPT_DIR}/../bun-version")"
export BUN_INSTALL="${BUN_INSTALL:-${HOME}/.bun}"
export PATH="${BUN_INSTALL}/bin:${PATH}"

if ! command -v bun >/dev/null 2>&1; then
  "${SCRIPT_DIR}/install-bun-verified.sh"
  export PATH="${BUN_INSTALL}/bin:${PATH}"
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "cloud-agent-install: bun is required but could not be installed" >&2
  exit 1
fi

installed_version="$(bun --version)"
if [ "${installed_version}" != "${BUN_VERSION}" ]; then
  echo "cloud-agent-install: expected bun ${BUN_VERSION}, got ${installed_version}" >&2
  exit 1
fi

cd "${WORKSPACE:-/workspace}/cli"
bun install --frozen-lockfile
bun run build

cd "${WORKSPACE:-/workspace}"
python3 -m py_compile sfce.py __init__.py
