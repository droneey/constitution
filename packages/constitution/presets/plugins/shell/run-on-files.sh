#!/usr/bin/env bash
# Why: the command gets the unit's files git keeps that match the patterns before the first --,
# untracked ones it does not ignore among them, but none of the folders after the second --, a
# workspace's members, each run in its own unit, and no file deleted but not yet committed, which
# git still lists. A tool handed the list reads only those files, never walking the folders git
# ignores.
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly USAGE='usage: run-on-files.sh <pattern>... -- <command> [<argument>...] [-- <folder>...]'

log() {
  printf '%s\n' "$*" >&2
}

existing_files() {
  local file

  while IFS= read -r -d '' file; do
    if [[ -e ${file} ]]; then
      printf '%s\0' "${file}"
    fi
  done
}

main() {
  local -a pathspecs=()
  local -a command=()
  local folder

  while (($# > 0)) && [[ $1 != -- ]]; do
    pathspecs+=("$1")
    shift
  done

  if (($# == 0)) || ((${#pathspecs[@]} == 0)); then
    log "${USAGE}"
    exit 2
  fi

  shift

  while (($# > 0)) && [[ $1 != -- ]]; do
    command+=("$1")
    shift
  done

  if ((${#command[@]} == 0)); then
    log "${USAGE}"
    exit 2
  fi

  if (($# > 0)); then
    shift
  fi

  for folder in "$@"; do
    pathspecs+=(":(exclude)${folder}")
  done

  git ls-files -z --cached --others --exclude-standard -- "${pathspecs[@]}" |
    existing_files |
    xargs -0 -r "${command[@]}"
}

main "$@"
