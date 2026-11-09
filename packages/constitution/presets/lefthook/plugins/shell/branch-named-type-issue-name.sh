#!/usr/bin/env bash
# Why: the arguments are the types a branch may take, as the project spells them, which only the
# presets resolve.
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

log() {
  printf '%s\n' "$*" >&2
}

alternatives_of() {
  local IFS='|'

  printf '(%s)' "$*"
}

main() {
  local types
  local branch

  types="$(alternatives_of "$@")"
  branch="$(git branch --show-current)"

  # Why: a detached HEAD, as in a rebase or a bisect, is on no branch to name.
  if [[ -z ${branch} ]]; then
    exit 0
  fi

  if ! grep -qE "^${types}/[0-9]+-[a-z0-9]+(-[a-z0-9]+)*\$" <<<"${branch}"; then
    log "[branch-named-type-issue-name] Branch must match: ${types}/{id}-{name}"
    log "  got: ${branch}"
    exit 1
  fi
}

main "$@"
