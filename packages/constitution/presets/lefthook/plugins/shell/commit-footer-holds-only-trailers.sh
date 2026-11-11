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
# Why: git folds a long trailer's value onto lines that open with whitespace.
readonly FOLDED_VALUE='^[[:space:]]+[^[:space:]]'
# Why: the footer is the message's last paragraph once it holds a trailer, as git reads trailers;
# a last paragraph of prose alone is a body, which the body's own rule checks.
# shellcheck disable=SC2016 # Why: $0 is awk's, the line it reads.
readonly FOOTER='
  NR == 1 { next }
  /^[[:space:]]*$/ { ended = 1; next }
  ended { last = ""; is_footer = 0; ended = 0 }
  { last = last $0 "\n" }
  $0 ~ trailer { is_footer = 1 }
  END { if (is_footer) printf "%s", last }
'

log() {
  printf '%s\n' "$*" >&2
}

main() {
  local message_file="$1"
  local footer

  footer="$(sed -e "${BELOW_THE_SCISSORS}" -e "${COMMENTS}" "${message_file}" |
    awk -v trailer="${TRAILER}" "${FOOTER}")"

  if [[ -n ${footer} ]] && grep -qvE "${TRAILER}|${FOLDED_VALUE}" <<<"${footer}"; then
    log "[commit-footer-holds-only-trailers] Footer must hold only trailers, each Key: value"
    exit 1
  fi
}

main "$@"
