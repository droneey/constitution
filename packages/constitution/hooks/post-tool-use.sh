#!/usr/bin/env bash
# A reminder that cannot be given is left out: the hook never fails the tool call.
# shellcheck source=lib/state.sh
. "${CLAUDE_PLUGIN_ROOT:-/dev/null}/hooks/lib/state.sh"

path="$(field file_path)" || exit 0
[ -n "${path}" ] || path="$(field notebook_path)" || exit 0
[ -n "${path}" ] || exit 0

# A subagent shares its parent's session_id but not its context, so it keeps a reminded list of its own.
reminded="${state}/reminded"
agent="$(field agent_id)" || agent=''
case "${agent}" in
  '') ;;
  *[!A-Za-z0-9_-]*) exit 0 ;;
  *) reminded="${state}/reminded.${agent}" ;;
esac

CONSTITUTION_PATH="${path}" CONSTITUTION_REMINDED="${reminded}" \
  awk -f "${lib}/json.awk" -f "${lib}/glob.awk" -f "${lib}/remind.awk" "${state}/active.tsv" 2>/dev/null
exit 0
