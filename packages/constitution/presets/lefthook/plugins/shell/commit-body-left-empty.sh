#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

# Why: git commit -v leaves the diff below its scissors line for the hook to read.
# shellcheck disable=SC2016 # Why: $d is sed's, which deletes up to the last line.
readonly BELOW_THE_SCISSORS='/^# -\{24\} >8 -\{24\}$/,$d'
readonly COMMENTS='/^#/d'
readonly TRAILER='^[A-Za-z][A-Za-z0-9-]*: .+$'
# Why: the last paragraph is the footer once it holds a trailer, which the footer's own rule checks;
# what stands between the header and the footer is the body.
# shellcheck disable=SC2016 # Why: $0 is awk's, the line it reads.
readonly ABOVE_THE_FOOTER='
  NR == 1 { next }
  /^[[:space:]]*$/ { ended = 1; next }
  ended { above = above last; last = ""; is_footer = 0; ended = 0 }
  { last = last $0 "\n" }
  $0 ~ trailer { is_footer = 1 }
  END { printf "%s", is_footer ? above : above last }
'

log() {
  printf '%s\n' "$*" >&2
}

main() {
  local message_file="$1"
  local body

  body="$(sed -e "${BELOW_THE_SCISSORS}" -e "${COMMENTS}" "${message_file}" |
    awk -v trailer="${TRAILER}" "${ABOVE_THE_FOOTER}")"

  if [[ -n ${body} ]] && grep -qvE "${TRAILER}" <<<"${body}"; then
    log "[commit-body-left-empty] Body must be empty; only a footer of trailers follows the header"
    exit 1
  fi
}

main "$@"
