#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

# Why: git commit -v leaves the diff below its scissors line for the hook to read.
# shellcheck disable=SC2016 # Why: $d is sed's, which deletes up to the last line.
readonly BELOW_THE_SCISSORS='/^# -\{24\} >8 -\{24\}$/,$d'
readonly HEADER_COMMENTS_AND_BLANKS='1d;/^#/d;/^$/d'
readonly TRAILER='^[A-Za-z][A-Za-z-]*: .+$'

log() {
  printf '%s\n' "$*" >&2
}

main() {
  local message_file="$1"
  local body

  body="$(sed -e "${BELOW_THE_SCISSORS}" -e "${HEADER_COMMENTS_AND_BLANKS}" "${message_file}")"

  if [[ -n ${body} ]] && grep -qvE "${TRAILER}" <<<"${body}"; then
    log "[commit-body-left-empty] Body must be empty; a footer holds only trailers"
    exit 1
  fi
}

main "$@"
