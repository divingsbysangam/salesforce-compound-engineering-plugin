#!/usr/bin/env bash
# Install a pinned Bun release from GitHub with SHA-256 verification.
# Called when bun is absent; do not pipe remote install scripts into bash.
set -euo pipefail

install_bun_verified() {
  local script_dir version asset expected_sha256 arch tmpdir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  version="$(tr -d '[:space:]' < "${script_dir}/../bun-version")"
  arch="$(uname -m)"

  case "${arch}" in
    x86_64)
      asset="bun-linux-x64.zip"
      expected_sha256="951ee2aee855f08595aeec6225226a298d3fea83a3dcd6465c09cbccdf7e848f"
      ;;
    aarch64|arm64)
      asset="bun-linux-aarch64.zip"
      expected_sha256="a27ffb63a8310375836e0d6f668ae17fa8d8d18b88c37c821c65331973a19a3b"
      ;;
    *)
      echo "install-bun-verified: unsupported architecture: ${arch}" >&2
      return 1
      ;;
  esac

  local bun_install="${BUN_INSTALL:-${HOME}/.bun}"
  local url="https://github.com/oven-sh/bun/releases/download/bun-v${version}/${asset}"

  tmpdir="$(mktemp -d)"
  trap 'rm -rf "${tmpdir}"' RETURN

  curl -fsSL -o "${tmpdir}/bun.zip" "${url}"
  echo "${expected_sha256}  ${tmpdir}/bun.zip" | sha256sum -c -

  unzip -q "${tmpdir}/bun.zip" -d "${tmpdir}/extract"
  mkdir -p "${bun_install}/bin"
  install -m 0755 "${tmpdir}/extract/${asset%.zip}/bun" "${bun_install}/bin/bun"
}

install_bun_verified "$@"
