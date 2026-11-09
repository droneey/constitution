#!/usr/bin/env bash
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly IMAGE='audit-image:base'
readonly SETTINGS='osv-scanner.toml'

main() {
  local dockerfile="${1:-Dockerfile}"
  local context="${2:-.}"
  # Why: the image's own system is no dependency the project ships, so its scan checks no licence.
  local -a scan=(osv-scanner scan image)
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
