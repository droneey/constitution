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

# A start folder that does not exist holds no constitution.yaml. The walk goes
# up the physical folders, as git does, so a link into a repository finds it.
start="${CLAUDE_PROJECT_DIR:-${cwd:-${PWD}}}"
start="$(cd "${start}" 2>/dev/null && pwd -P)" || exit 0

project=''
folder="${start}"
while :; do
  if [ -z "${project}" ] && [ -f "${folder}/constitution.yaml" ]; then
    project="${folder}"
  fi
  [ -e "${folder}/.git" ] && break
  if [ "${folder}" = / ]; then
    # Outside a repository only the start folder is searched.
    project=''
    [ -f "${start}/constitution.yaml" ] && project="${start}"
    break
  fi
  folder="$(dirname "${folder}")"
done
[ -n "${project}" ] || exit 0

# The rules come from the release the project pins, which mise unpacks and
# links here; the plugin brings only the hooks that read them.
archive="${project}/.droneey/constitution"
event="${event:-SessionStart}"

# The forms of the blocks this plugin reads: the newest and the one before it,
# once there is one. A release names its form in its package.json.
newest_format=2
oldest_format=2

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

# The Markdown files of a folder of blocks, regular files only, since getline
# blocks on a named pipe; a file awk cannot read is reported there.
blocks_of() {
  (cd "$1" 2>/dev/null && find blocks -type f -name '*.md' 2>/dev/null) |
    CONSTITUTION_SOURCE="$2" CONSTITUTION_FOLDER="$1" awk -f "${lib}/order.awk" |
    LC_ALL=C sort | cut -f 2-
}

tab="$(printf '\t')"
files="$(blocks_of "${archive}" '')" || fail "cannot list the blocks of ${archive}"

# A pack the project lists is a folder of blocks, read after the Constitution's.
while IFS= read -r record; do
  case "${record}" in
    "item${tab}${tab}packs${tab}"*) pack="${record#item"${tab}${tab}"packs"${tab}"}" ;;
    *) continue ;;
  esac
  if [ -d "${project}/${pack#./}/blocks" ]; then
    files="${files}
$(blocks_of "${project}/${pack#./}" "${pack}")"
  else
    files="${files}
pack${tab}${pack}"
  fi
done <<RECORDS
${records}
RECORDS

export CONSTITUTION_ROOT="${archive}" CONSTITUTION_PROJECT="${project}" \
  CONSTITUTION_CORE="${archive}/blocks/core/core.md" \
  CONSTITUTION_INSTALLED="${installed}" CONSTITUTION_TODAY="${today}" \
  CONSTITUTION_EVENT="${event}" CONSTITUTION_STARTUP="${startup}"

resolved="$(printf '%s\n%s' "${records}" "${files}" |
  awk -f "${lib}/blocks.awk" -f "${lib}/resolve.awk" 2>/dev/null)" || fail 'cannot build the digest'
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
