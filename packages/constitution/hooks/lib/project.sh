# shellcheck shell=bash
# shellcheck disable=SC2154 # lib, archive and project are set by the script that sources it
# bash 3.2 and POSIX tools only, as the hook.
set -o pipefail

find_project() {
  local start folder found
  start="$(cd "$1" 2>/dev/null && pwd -P)" || return 0
  found=''
  folder="${start}"
  while :; do
    if [ -z "${found}" ] && [ -f "${folder}/constitution.yaml" ]; then
      found="${folder}"
    fi
    [ -e "${folder}/.git" ] && break
    if [ "${folder}" = / ]; then
      found=''
      [ -f "${start}/constitution.yaml" ] && found="${start}"
      break
    fi
    folder="$(dirname "${folder}")"
  done
  printf '%s' "${found}"
}

# Regular files only, since getline blocks on a named pipe.
blocks_of() {
  (cd "$1" 2>/dev/null && find blocks -type f -name '*.md' 2>/dev/null) |
    CONSTITUTION_SOURCE="$2" CONSTITUTION_FOLDER="$1" awk -f "${lib}/order.awk" |
    LC_ALL=C sort | cut -f 2-
}

# Read by the shell alone: each process the hook starts costs it a few milliseconds.
packs_of() (
  local record tab
  tab='	'
  # shellcheck disable=SC2086 # one record to a line, a for loop being faster than read
  set -f
  IFS='
'
  for record in $1; do
    case "${record}" in
      "item${tab}${tab}packs${tab}"*) printf '%s\n' "${record#"item${tab}${tab}packs${tab}"}" ;;
      *) ;;
    esac
  done
)

list_blocks() {
  local pack packs
  blocks_of "${archive}" '' || return 1
  packs="$(packs_of "$1")"
  [ -n "${packs}" ] || return 0
  while IFS= read -r pack; do
    if [ -d "${project}/${pack#./}/blocks" ]; then
      blocks_of "${project}/${pack#./}" "${pack}"
    else
      printf 'pack\t%s\n' "${pack}"
    fi
  done <<PACKS
${packs}
PACKS
}

template_names() (
  local name seen
  seen=' '
  # shellcheck disable=SC2086 # one path to a line, a for loop being faster than read
  set -f
  IFS='
'
  for name in $1; do
    case "${name}" in
      templates/project/*) name="${name##*/}" ;;
      *) continue ;;
    esac
    case "${seen}" in
      *" ${name} "*) ;;
      *)
        seen="${seen}${name} "
        printf ':(glob)**/%s\n' "${name}"
        ;;
    esac
  done
)

list_wiring() {
  local pack packs listing names name configs
  listing="$(cd "${archive}" 2>/dev/null && find presets templates/project -type f 2>/dev/null)"
  if [ -n "${listing}" ]; then
    # shellcheck disable=SC2086 # one path to a line
    (set -f && IFS='
' && printf 'file\t\t%s\n' ${listing})
  fi
  packs="$(packs_of "$1")"
  if [ -n "${packs}" ]; then
    while IFS= read -r pack; do
      configs="$(cd "${project}/${pack#./}" 2>/dev/null && find presets templates/project -type f 2>/dev/null)"
      [ -z "${configs}" ] && continue
      listing="${listing}
${configs}"
      # shellcheck disable=SC2086 # one path to a line
      (set -f && IFS='
' && for name in ${configs}; do printf 'file\t%s\t%s\n' "${pack}" "${name}"; done)
    done <<PACKS
${packs}
PACKS
  fi
  names="$(template_names "${listing}")"
  [ -n "${names}" ] || return 0
  # shellcheck disable=SC2086 # one pathspec to a line, none holding a blank
  configs="$(cd "${project}" && set -f && IFS='
' && git -c core.quotePath=false ls-files --cached -- ${names} 2>/dev/null)"
  [ -n "${configs}" ] || return 0
  # shellcheck disable=SC2086 # one path to a line
  (set -f && IFS='
' && printf 'config\t%s\n' ${configs})
}
