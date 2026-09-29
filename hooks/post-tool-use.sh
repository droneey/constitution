#!/usr/bin/env bash
# A reminder that cannot be given is left out: the hook never fails the tool call.
. "${CLAUDE_PLUGIN_ROOT:-/dev/null}/hooks/lib/state.sh"

path="$(field file_path)" || exit 0
[ -n "${path}" ] || path="$(field notebook_path)" || exit 0
[ -n "${path}" ] || exit 0

CONSTITUTION_PATH="${path}" CONSTITUTION_REMINDED="${state}/reminded" \
  awk -f "${lib}/json.awk" -f "${lib}/glob.awk" -f "${lib}/remind.awk" "${state}/active.tsv" 2>/dev/null
exit 0
