#!/usr/bin/env bash
. "${CLAUDE_PLUGIN_ROOT:-/dev/null}/hooks/lib/state.sh"

event="$(field hook_event_name)" || exit 0
[ "$(field stop_hook_active)" = true ] && exit 0
now="$(fingerprint)"
[ -n "${now}" ] || exit 0

check="$(awk -F '\t' '$1 == "check" { print $2; exit }' "${state}/active.tsv" 2>/dev/null)"
if [ -n "${check}" ] && [ "${now}" != "$(recorded turn)" ] && [ "${now}" != "$(recorded checked)" ] && [ "${now}" != "$(recorded blocked)" ]; then
  record blocked "${now}"
  printf '{"decision":"block","reason":"The tree changed since the check last passed. Run the project'"'"'s check, `%s`, and hand back only when it passes."}\n' "$(printf '%s' "${check}" | awk -f "${lib}/json.awk" -f "${lib}/escape.awk")"
  exit 0
fi

[ "${event}" = Stop ] || exit 0
[ "${now}" = "$(recorded turn)" ] && exit 0
[ "${now}" = "$(recorded reviewed)" ] && exit 0
governed="$(cd "${project}" && { git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null; } |
  CONSTITUTION_STATE="${state}/active.tsv" awk -f "${lib}/glob.awk" -f "${lib}/governed.awk" 2>/dev/null)"
[ -n "${governed}" ] || exit 0
printf '{"systemMessage":"Changed files fall under %s; /check edits reviews them against the rules."}\n' "$(printf '%s' "${governed}" | awk -f "${lib}/json.awk" -f "${lib}/escape.awk")"
exit 0
