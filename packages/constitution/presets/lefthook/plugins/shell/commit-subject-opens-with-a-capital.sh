#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly SUBJECT_OF_HEADER='s/^[a-z]*!\{0,1\}: \(.*\)/\1/p'

log() {
  printf '%s\n' "$*" >&2
}

main() {
  local message_file="$1"
  local header
  local subject
  local first_character

  header="$(head -n 1 "${message_file}")"
  subject="$(sed -n "${SUBJECT_OF_HEADER}" <<<"${header}")"
  first_character="$(cut -c1 <<<"${subject}")"

  if [[ -n ${subject} ]] && ! grep -q '[A-Z]' <<<"${first_character}"; then
    log "[commit-subject-opens-with-a-capital]" \
      "Subject must start with an uppercase letter (sentence-case)"
    exit 1
  fi
}

main "$@"
