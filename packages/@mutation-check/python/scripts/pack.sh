#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly USAGE='Usage: scripts/pack.sh <stage folder>, from the package folder'
readonly TOOL='mutmut-check'
readonly -a FILES=(dist/mutmut-check.pyz)

main() {
  local part

  if (($# != 1)); then
    printf '%s\n' "${USAGE}" >&2
    return 2
  fi

  poe build
  part="$1/tools/${TOOL}/dist"
  mkdir -p "${part}"
  cp "${FILES[@]}" "${part}/"
}

main "$@"
