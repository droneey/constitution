#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly TYPE_OF_HEADER='s/^\([a-z]*\)!\{0,1\}: .*/\1/p'
readonly SUBJECT_OF_HEADER='s/^[a-z]*!\{0,1\}: \(.*\)/\1/p'

log() {
  printf '%s\n' "$*" >&2
}

main() {
  local message_file="$1"
  local header
  local type
  local subject

  header="$(head -n 1 "${message_file}")"
  type="$(sed -n "${TYPE_OF_HEADER}" <<<"${header}")"
  subject="$(sed -n "${SUBJECT_OF_HEADER}" <<<"${header}")"

  if [[ -z ${type} || -z ${subject} ]]; then
    log "[commit-header-follows-conventional-commits] Commit must match format: type: Subject,"
    log "  or type!: Subject for a breaking change"
    exit 1
  fi

  case "${type}" in
    feat | fix | refactor | chore) ;;
    *)
      log "[commit-header-follows-conventional-commits]" \
        "Invalid type '${type}'. Allowed: feat, fix, refactor, chore"
      exit 1
      ;;
  esac
}

main "$@"
