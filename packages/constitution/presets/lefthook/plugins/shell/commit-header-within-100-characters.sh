#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly LONGEST_HEADER=100

log() {
  printf '%s\n' "$*" >&2
}

main() {
  local message_file="$1"
  local header

  header="$(head -n 1 "${message_file}")"

  if ((${#header} > LONGEST_HEADER)); then
    log "[commit-header-within-100-characters]" \
      "Header must be ${LONGEST_HEADER} characters or less (got ${#header})"
    exit 1
  fi
}

main "$@"
