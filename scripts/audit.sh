#!/usr/bin/env bash
# Scans the lockfiles for known vulnerabilities, their licences held to the allowlists the arguments name,
# one licence per line: scripts/audit.sh <allowlist>...
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

log() {
  printf '%s\n' "$*" >&2
}

main() {
  if (($# == 0)); then
    log 'Usage: scripts/audit.sh <allowlist>...'
    exit 1
  fi

  local licenses
  licenses="$(cat "$@" | paste -sd, -)"
  osv-scanner scan source --licenses="$licenses" --no-ignore .
}

main "$@"
