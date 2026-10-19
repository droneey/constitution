#!/usr/bin/env bash
# bash 3.2 and POSIX awk only: BSD awk, mawk and gawk must read it alike. A
# value reaches awk through the environment or stdin, never -v, which expands
# backslashes. No -e: an expected non-match must not end the script, so each
# step checks its own status.
export LC_ALL=C
set -o pipefail
unset CDPATH

fail() {
  printf 'constitution hook: %s\n' "$1" >&2
  exit 1
}

root="${CLAUDE_PLUGIN_ROOT:-}"
[ -n "${root}" ] || exit 0
lib="${root}/hooks/lib"

field() {
  printf '%s' "${input}" | CONSTITUTION_FIELD="$1" awk -f "${lib}/read-event.awk" 2>/dev/null
}

input="$(tr -d '\r')" || fail 'cannot read the event on stdin'
cwd="$(field cwd)" || fail 'cannot read cwd from the event'
event="$(field hook_event_name)" || fail 'cannot read hook_event_name from the event'
origin="$(field source)" || fail 'cannot read source from the event'
session="$(field session_id)" || fail 'cannot read session_id from the event'

# shellcheck source=lib/project.sh
. "${lib}/project.sh"
project="$(find_project "${CLAUDE_PROJECT_DIR:-${cwd:-${PWD}}}")"
[ -n "${project}" ] || exit 0

# The rules come from the release the project pins, which mise unpacks and
# links here; the plugin brings only the hooks that read them.
archive="${project}/.droneey/constitution"
event="${event:-SessionStart}"

# The forms of the blocks this plugin reads: the newest and the one before it,
# once there is one. A release names its form in its package.json.
newest_format=3
oldest_format=3

# A project whose Constitution this plugin cannot read gets the reason alone.
notice() {
  printf 'notice\t%s\t%s\n' "$1" "$2" |
    CONSTITUTION_ROOT="${archive}" CONSTITUTION_EVENT="${event}" CONSTITUTION_OLDEST="${oldest_format}" \
      awk -f "${lib}/json.awk" -f "${lib}/digest.awk" 2>/dev/null || fail 'cannot build the digest'
  exit 0
}

[ -d "${archive}" ] || notice missing ''
manifest="${archive}/package.json"
config="${project}/constitution.yaml"
[ -f "${manifest}" ] && [ -r "${manifest}" ] || fail "cannot read ${manifest}"
format="$(sed -n 's/.*"constitutionFormat"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' "${manifest}" | sed -n 1p)" || fail "cannot read ${manifest}"
# No form named is a release older than the first form read from the blocks.
[ -n "${format}" ] || format=0
[ "${format}" -le "${newest_format}" ] || notice newer "${format}"
[ "${format}" -ge "${oldest_format}" ] || notice older "${format}"

installed="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "${manifest}" | sed -n 1p)" || fail "cannot read ${manifest}"
[ -n "${installed}" ] || fail "${manifest} has no version"
today="$(date +%Y-%m-%d)" || fail 'cannot read the date'

startup=''
if [ "${event}" = SessionStart ] && [ "${origin}" = startup ]; then
  startup=1
fi

records="$(awk -f "${lib}/read-config.awk" "${config}" 2>/dev/null)" || fail "cannot read ${config}"

files="$(list_blocks "${records}")" || fail "cannot list the blocks of ${archive}"
wiring="$(list_wiring "${records}")"

export CONSTITUTION_ROOT="${archive}" CONSTITUTION_PROJECT="${project}" \
  CONSTITUTION_CORE="${archive}/blocks/core/core.md" \
  CONSTITUTION_INSTALLED="${installed}" CONSTITUTION_TODAY="${today}" \
  CONSTITUTION_EVENT="${event}" CONSTITUTION_STARTUP="${startup}"

resolved="$(printf '%s\n%s\n%s' "${records}" "${files}" "${wiring}" |
  awk -f "${lib}/blocks.awk" -f "${lib}/resolve.awk" -f "${lib}/wiring.awk" 2>/dev/null)" || fail 'cannot build the digest'
output="$(printf '%s\n' "${resolved}" | awk -f "${lib}/json.awk" -f "${lib}/digest.awk" 2>/dev/null)" || fail 'cannot build the digest'

# A state that cannot be written costs the reminders and the gate, never the digest.
save_state() {
  state="/tmp/droneey-constitution-$(id -u)/${session}"
  mkdir -p "${state}" 2>/dev/null || return
  {
    printf 'project\t%s\n' "${project}"
    printf '%s\n' "${resolved}" | awk -F '\t' '$1 == "check" || $1 == "active" || $1 == "must"'
  } >"${state}/active.tsv" 2>/dev/null
  [ "${origin}" = resume ] || : >"${state}/reminded" 2>/dev/null
}

if [ "${event}" = SessionStart ]; then
  case "${session}" in
    '' | *[!A-Za-z0-9_-]*) ;;
    *) save_state ;;
  esac
fi
printf '%s\n' "${output}"
