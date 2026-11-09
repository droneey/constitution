#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly PREFIX_OF_HEADER='s/^[A-Za-z]*\(([^)]*)\)\{0,1\}!\{0,1\}: //'

log() {
  printf '%s\n' "$*" >&2
}

main() {
  local message_file="$1"
  local header
  local subject
  local lowered

  header="$(head -n 1 "${message_file}")"
  subject="$(sed "${PREFIX_OF_HEADER}" <<<"${header}")"
  lowered="$(tr '[:upper:]' '[:lower:]' <<<"${subject}")"

  case "${lowered}" in
    update | updates | changes | change | misc | wip | fix | fixes | \
      "fix stuff" | stuff | \
      "minor changes" | "small fix" | tmp | test)
      log "[commit-msg-hook-rejects-a-placeholder-subject]" \
        "Subject '${subject}' says nothing; say what changed"
      exit 1
      ;;
    *) ;;
  esac
}

main "$@"
