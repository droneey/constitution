#!/usr/bin/env bash
# shellcheck source=lib/state.sh
. "${CLAUDE_PLUGIN_ROOT:-/dev/null}/hooks/lib/state.sh"

event="$(field hook_event_name)" || exit 0
if [ "${event}" = SubagentStop ]; then
  agent_type="$(field agent_type)"
  agent_name="$(field agent_name)"
  if [ "${agent_type}" = constitution:reviewer ] || [ "${agent_name}" = constitution:reviewer ]; then
    reviewed="$(fingerprint)"
    record reviewed "${reviewed}"
    exit 0
  fi
fi
stop_hook_active="$(field stop_hook_active)"
[ "${stop_hook_active}" = true ] && exit 0
now="$(fingerprint)"
[ -n "${now}" ] || exit 0

check="$(awk -F '\t' '$1 == "check" { print $2; exit }' "${state}/active.tsv" 2>/dev/null)"
turn="$(recorded turn)"
checked="$(recorded checked)"
blocked="$(recorded blocked)"
if [ -n "${check}" ] && [ "${now}" != "${turn}" ] && [ "${now}" != "${checked}" ] && [ "${now}" != "${blocked}" ]; then
  record blocked "${now}"
  escaped="$(printf '%s' "${check}" | awk -f "${lib}/json.awk" -f "${lib}/escape.awk")"
  printf "{\"decision\":\"block\",\"reason\":\"The tree changed since the check last passed. Run the project's check, \`%s\`, and hand back only when it passes.\"}\n" "${escaped}"
  exit 0
fi

[ "${event}" = Stop ] || exit 0
[ "${now}" = "${turn}" ] && exit 0
reviewed="$(recorded reviewed)"
[ "${now}" = "${reviewed}" ] && exit 0
governed="$(cd "${project}" && {
  git diff --name-only HEAD 2>/dev/null
  git ls-files --others --exclude-standard 2>/dev/null
} |
  CONSTITUTION_STATE="${state}/active.tsv" awk -f "${lib}/glob.awk" -f "${lib}/governed.awk" 2>/dev/null)"
[ -n "${governed}" ] || exit 0
escaped="$(printf '%s' "${governed}" | awk -f "${lib}/json.awk" -f "${lib}/escape.awk")"
printf '{"systemMessage":"Changed files fall under %s; /check edits reviews them against the rules."}\n' "${escaped}"
exit 0
