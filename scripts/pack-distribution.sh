#!/usr/bin/env bash
# Why: the archives carry the manifest bun pm pack writes, whose dependencies name versions where
# the workspace's own manifest names workspace: ranges no installer outside the workspace reads.
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly PACKAGE='packages/constitution'
readonly MAP='distribution.json'
readonly MANIFEST_FOLDER='dist/package'
readonly -a PLATFORMS=(
  linux-x64:linux-x64
  linux-arm64:linux-arm64
  darwin-x64:macos-x64
  darwin-arm64:macos-arm64
)

build_parts() {
  local packages
  local package

  packages="$(jq -r '[.[].package] | unique[]' "${MAP}")"
  if [[ -z ${packages} ]]; then
    return
  fi

  # Why: the names come on their own descriptor, so each build keeps the standard input it had.
  while IFS= read -r package <&3; do
    if [[ -f "${package}/package.json" ]]; then
      bun run --cwd "${package}" build
    else
      (cd "${package}" && uv run --locked poe build)
    fi
  done 3<<<"${packages}"
}

lay_out_parts() {
  local target
  local source

  jq -r 'to_entries[] | "\(.key) \(.value.package)/\(.value.file)"' "${MAP}" |
    while read -r target source; do
      mkdir -p "$(dirname "${target}")"
      cp "${source}" "${target}"
    done
}

pack_manifest() {
  local root="$1"

  mkdir -p "${root}/${MANIFEST_FOLDER}"
  bun pm pack --ignore-scripts --quiet --filename "${root}/${MANIFEST_FOLDER}/constitution.tgz"
  tar -xzf "${root}/${MANIFEST_FOLDER}/constitution.tgz" -C "${root}/${MANIFEST_FOLDER}" \
    package/package.json
}

pack_platform() {
  local root="$1"
  local platform="$2"
  local target="${platform%%:*}"
  local name="${platform##*:}"

  bun run --cwd "${PACKAGE}" build --target "bun-${target}" \
    --outfile "${root}/dist/cli/${name}/bin/constitution"
  tar -czf "constitution-${name}.tar.gz" -C "${root}/${MANIFEST_FOLDER}/package" package.json \
    -C "${root}/${PACKAGE}" blocks presets templates tools -C "${root}/dist/cli/${name}" bin
  sha256sum "constitution-${name}.tar.gz" >"constitution-${name}.tar.gz.sha256"
}

main() {
  local root
  local platform

  root="${PWD}"

  cd "${PACKAGE}"
  build_parts
  lay_out_parts
  pack_manifest "${root}"
  cd "${root}"

  for platform in "${PLATFORMS[@]}"; do
    pack_platform "${root}" "${platform}"
  done
}

main "$@"
