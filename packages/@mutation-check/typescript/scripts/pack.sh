#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly USAGE='Usage: scripts/pack.sh <stage folder>, from the package folder'
readonly TOOL='mutation-check'
readonly -a FILES=(dist/main.js dist/runner.js dist/ignorers.js)

main() {
  local part

  if (($# != 1)); then
    printf '%s\n' "${USAGE}" >&2
    return 2
  fi

  bun run build
  part="$1/tools/${TOOL}/dist"
  mkdir -p "${part}"
  cp "${FILES[@]}" "${part}/"
}

main "$@"
