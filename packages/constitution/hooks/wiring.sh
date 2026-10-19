#!/usr/bin/env bash
# bash 3.2 and POSIX awk only, as the hook.
export LC_ALL=C
set -o pipefail
unset CDPATH

fail() {
  printf 'constitution wiring: %s\n' "$1" >&2
  exit 1
}

root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd -P)}"
lib="${root}/hooks/lib"

# shellcheck source=lib/project.sh
. "${lib}/project.sh"
project="$(find_project "${CLAUDE_PROJECT_DIR:-${PWD}}")"
[ -n "${project}" ] || fail 'no constitution.yaml in this folder or above it'
archive="${project}/.droneey/constitution"
[ -d "${archive}" ] || fail "${archive} does not exist — run mise install"
config="${project}/constitution.yaml"

records="$(awk -f "${lib}/read-config.awk" "${config}" 2>/dev/null)" || fail "cannot read ${config}"
line="$(printf '%s\n' "${records}" | awk -F '\t' '$1 == "error" { print $2 }')" || fail "cannot read ${config}"
[ -z "${line}" ] || fail "constitution.yaml does not parse at line ${line}"
today="$(date +%Y-%m-%d)" || fail 'cannot read the date'
files="$(list_blocks "${records}")" || fail "cannot list the blocks of ${archive}"
wiring="$(list_wiring "${records}")"

printf '%s\n%s\n%s' "${records}" "${files}" "${wiring}" |
  CONSTITUTION_ROOT="${archive}" CONSTITUTION_PROJECT="${project}" CONSTITUTION_WIRING=print \
    CONSTITUTION_TODAY="${today}" \
    awk -f "${lib}/blocks.awk" -f "${lib}/resolve.awk" -f "${lib}/wiring.awk" |
  awk -F '\t' '$1 == "wiring" { print substr($0, 8) }' || fail 'cannot compute the wiring'
