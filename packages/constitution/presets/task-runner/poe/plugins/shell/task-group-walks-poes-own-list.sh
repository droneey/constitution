#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

main() {
  local prefix="$1"
  local names
  local task

  names="$(poe _list_tasks | tr -s '[:space:]' '\n' | sort)"

  # Why: the names come on their own descriptor, so each task keeps the standard input poe gave.
  while IFS= read -r task <&3; do
    if [[ ${task} == "${prefix}":* ]]; then
      poe "${task}" || exit 1
    fi
  done 3<<<"${names}"
}

main "$@"
