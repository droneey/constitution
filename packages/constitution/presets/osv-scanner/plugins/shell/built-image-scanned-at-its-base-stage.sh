#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly IMAGE='audit-image:base'
readonly SETTINGS='osv-scanner.toml'

main() {
  local -a inputs=()
  # Why: the image's own system is no dependency the project ships, so its scan checks no licence.
  local -a scan=(osv-scanner scan image)

  while ((${#} > 0)) && [[ ${1} != -- ]]; do
    inputs+=("${1}")
    shift
  done
  # Why: the words after `--` are the scan's own flags, which the presets give.
  if ((${#} > 1)); then
    shift
    scan+=("${@}")
  fi

  local dockerfile="${inputs[0]:-Dockerfile}"
  local context="${inputs[1]:-.}"
  local status=0

  docker build --quiet --target base --tag "${IMAGE}" --file "${dockerfile}" "${context}"

  # Why: an image's scan finds the unit's settings only when given them.
  if [[ -f ${SETTINGS} ]]; then
    scan+=(--config "${SETTINGS}")
  fi

  "${scan[@]}" "${IMAGE}" || status=$?
  # Why: docker reports a removal that fails on its own standard error, and the scan's result is
  # the script's.
  docker rmi "${IMAGE}" >/dev/null || true

  exit "${status}"
}

main "$@"
