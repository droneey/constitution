#!/usr/bin/env bash
# A command that failed fires PostToolUseFailure, never this hook.
# shellcheck source=lib/state.sh
. "${CLAUDE_PLUGIN_ROOT:-/dev/null}/hooks/lib/state.sh"

check="$(awk -F '\t' '$1 == "check" { print $2; exit }' "${state}/active.tsv" 2>/dev/null)"
[ -n "${check}" ] || exit 0
command="$(field command)" || exit 0
case "${command}" in
  "${check}" | "${check} "* | "${check};"* | *"&& ${check}" | *"&& ${check} "* | *"&& ${check};"* | *"; ${check}" | *"; ${check} "* | *"; ${check};"*)
    checked="$(fingerprint)"
    record checked "${checked}"
    ;;
esac
exit 0
