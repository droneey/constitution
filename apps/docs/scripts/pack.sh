#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly USAGE='Usage: scripts/pack.sh <stage folder>, from the package folder'
readonly PART='docs'
readonly SITE='.output/public'

main() {
  if (($# != 1)); then
    printf '%s\n' "${USAGE}" >&2
    return 2
  fi

  bun run build
  mkdir -p "$1/${PART}"
  cp -R "${SITE}/." "$1/${PART}/"
}

main "$@"
