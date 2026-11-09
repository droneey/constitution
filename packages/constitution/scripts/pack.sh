#!/usr/bin/env bash
# Why: the release carries the manifest bun pm pack writes, whose dependencies name versions where
# the workspace's own manifest names workspace: ranges no installer outside the workspace reads.
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly USAGE='Usage: scripts/pack.sh <stage folder>, from the package folder'
readonly PART='constitution'
readonly MANIFEST_FOLDER='dist/package'
readonly -a CONTENT=(
  blocks
  presets
  templates
)
readonly -a PLATFORMS=(
  linux-x64:linux-x64
  linux-arm64:linux-arm64
  darwin-x64:macos-x64
  darwin-arm64:macos-arm64
)

pack_manifest() {
  local part="$1"

  mkdir -p "${MANIFEST_FOLDER}"
  bun pm pack --ignore-scripts --quiet --filename "${MANIFEST_FOLDER}/constitution.tgz"
  tar -xzf "${MANIFEST_FOLDER}/constitution.tgz" -C "${MANIFEST_FOLDER}" package/package.json
  cp "${MANIFEST_FOLDER}/package/package.json" "${part}/package.json"
}

build_platform() {
  local part="$1"
  local platform="$2"
  local target="${platform%%:*}"
  local name="${platform##*:}"

  bun run build --target "bun-${target}" --outfile "${part}/cli/${name}/bin/constitution"
}

main() {
  local part
  local platform

  if (($# != 1)); then
    printf '%s\n' "${USAGE}" >&2
    return 2
  fi

  mkdir -p "$1/${PART}"
  part="$(cd "$1/${PART}" && pwd)"

  pack_manifest "${part}"
  cp -R "${CONTENT[@]}" "${part}/"
  for platform in "${PLATFORMS[@]}"; do
    build_platform "${part}" "${platform}"
  done
}

main "$@"
