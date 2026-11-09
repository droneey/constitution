#!/usr/bin/env bash
# Why: each package packs its own part into one stage, and the release's archives are glued here
# until their own home is chosen.
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly USAGE='Usage: scripts/pack-release.sh <output folder>, from the repository root'
readonly PACK_TASK='pack'

pack_python_members() {
  local stage="$1"
  local members
  local member

  members="$(uv workspace list --paths)"
  if [[ -z ${members} ]]; then
    return
  fi

  # Why: the paths come on their own descriptor, so each pack keeps the standard input it had.
  while IFS= read -r member <&3; do
    if (cd "${member}" && uv run --locked poe _list_tasks | tr ' ' '\n' | grep -qx "${PACK_TASK}"); then
      (cd "${member}" && uv run --locked poe "${PACK_TASK}" "${stage}")
    fi
  done 3<<<"${members}"
}

archive() {
  local output="$1"
  local name="$2"
  shift 2

  tar -czf "${output}/${name}" "$@"
  (cd "${output}" && sha256sum "${name}" >"${name}.sha256")
}

main() {
  local output
  local stage
  local cli

  if (($# != 1)); then
    printf '%s\n' "${USAGE}" >&2
    return 2
  fi

  mkdir -p "$1"
  output="$(cd "$1" && pwd)"
  stage="$(mktemp -d)"
  # shellcheck disable=SC2064 # Why: the trap removes this run's own stage, named now.
  trap "rm -rf -- '${stage}'" EXIT

  bun run --filter '*' "${PACK_TASK}" "${stage}"
  pack_python_members "${stage}"

  for cli in "${stage}"/constitution/cli/*/; do
    archive "${output}" "constitution-$(basename "${cli}").tar.gz" \
      -C "${stage}/constitution" package.json blocks presets templates \
      -C "${stage}" tools -C "${cli}" bin
  done
  archive "${output}" constitution-docs.tar.gz -C "${stage}/docs" .
}

main "$@"
