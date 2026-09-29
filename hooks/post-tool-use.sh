#!/usr/bin/env bash
# A reminder that cannot be given is left out: the hook never fails the tool call.
export LC_ALL=C
set -o pipefail
unset CDPATH

root="${CLAUDE_PLUGIN_ROOT:-}"
[ -n "${root}" ] || exit 0
lib="${root}/hooks/lib"

field() {
  printf '%s' "${input}" | CONSTITUTION_FIELD="$1" awk -f "${lib}/read-event.awk" 2>/dev/null
}

input="$(tr -d '\r')" || exit 0
session="$(field session_id)" || exit 0
case "${session}" in
  '' | *[!A-Za-z0-9_-]*) exit 0 ;;
esac
state="${TMPDIR:-/tmp}/droneey-constitution/${session}"
[ -f "${state}/active.tsv" ] || exit 0

path="$(field file_path)" || exit 0
[ -n "${path}" ] || path="$(field notebook_path)" || exit 0
[ -n "${path}" ] || exit 0

CONSTITUTION_PATH="${path}" CONSTITUTION_REMINDED="${state}/reminded" \
  awk -f "${lib}/json.awk" -f "${lib}/remind.awk" "${state}/active.tsv" 2>/dev/null
exit 0
