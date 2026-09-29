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

index="${root}/digests/index.tsv"
core="${root}/digests/core.md"
manifest="${root}/package.json"
config="${project}/constitution.yaml"
for file in "${index}" "${core}" "${manifest}"; do
  [ -f "${file}" ] && [ -r "${file}" ] || fail "cannot read ${file}"
done

installed="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "${manifest}" | sed -n 1p)" || fail "cannot read ${manifest}"
[ -n "${installed}" ] || fail "${manifest} has no version"
today="$(date +%Y-%m-%d)" || fail 'cannot read the date'

event="${event:-SessionStart}"
startup=''
if [ "${event}" = SessionStart ] && [ "${origin}" = startup ]; then
  startup=1
fi

records="$(awk -f "${lib}/read-config.awk" "${config}" 2>/dev/null)" || fail "cannot read ${config}"

# awk opens a local block only when it is a regular, readable file: getline
# fails on a folder and blocks on a named pipe.
tab="$(printf '\t')"
files=''
while IFS= read -r record; do
  case "${record}" in
    "item${tab}"*) path="${record#item"${tab}"*"${tab}"*"${tab}"}" ;;
    *) continue ;;
  esac
  case "${path}" in
    ./*) ;;
    *) continue ;;
  esac
  target="${project}/${path#./}"
  if [ -f "${target}" ] && [ -r "${target}" ]; then
    state='file'
  elif [ -f "${target}" ]; then
    state='unreadable'
  elif [ -e "${target}" ] || [ -L "${target}" ]; then
    state='other'
  else
    continue
  fi
  files="${files}local${tab}${state}${tab}${path}
"
done <<EOF
${records}
EOF

export CONSTITUTION_ROOT="${root}" CONSTITUTION_PROJECT="${project}" \
  CONSTITUTION_INDEX="${index}" CONSTITUTION_CORE="${core}" \
  CONSTITUTION_INSTALLED="${installed}" CONSTITUTION_TODAY="${today}" \
  CONSTITUTION_EVENT="${event}" CONSTITUTION_STARTUP="${startup}"

resolved="$(printf '%s\n%s' "${records}" "${files}" |
  awk -f "${lib}/local-blocks.awk" -f "${lib}/resolve.awk" 2>/dev/null)" || fail 'cannot build the digest'
output="$(printf '%s\n' "${resolved}" | awk -f "${lib}/digest.awk" 2>/dev/null)" || fail 'cannot build the digest'

# A state that cannot be written costs the reminders and the gate, never the digest.
save_state() {
  state="${TMPDIR:-/tmp}/droneey-constitution/${session}"
  mkdir -p "${state}" 2>/dev/null || return
  {
    printf 'project\t%s\n' "${project}"
    printf '%s\n' "${resolved}" | awk -F '\t' '$1 == "check" || $1 == "active" || $1 == "headline"'
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
