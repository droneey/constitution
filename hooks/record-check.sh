#!/usr/bin/env bash
# A command that failed fires PostToolUseFailure, never this hook.
. "${CLAUDE_PLUGIN_ROOT:-/dev/null}/hooks/lib/state.sh"

check="$(awk -F '\t' '$1 == "check" { print $2; exit }' "${state}/active.tsv" 2>/dev/null)"
[ -n "${check}" ] || exit 0
command="$(field command)" || exit 0
# The check is a whole command of the line: first, or after && or ;.
case "${command}" in
  "${check}" | "${check} "* | "${check};"* | *"&& ${check}" | *"&& ${check} "* | *"&& ${check};"* | *"; ${check}" | *"; ${check} "* | *"; ${check};"*) record checked "$(fingerprint)" ;;
esac
exit 0
