#!/usr/bin/env bash
# Builds the constitution program for every platform a release serves, each as the archive mise
# unpacks beside the Constitution's: dist/cli/constitution-<os>-<arch>.tar.gz, holding
# bin/constitution. scripts/build-cli.sh [<target> ...] builds the targets given, all by default.
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly ENTRY='packages/constitution/src/main.ts'
readonly OUT='dist/cli'
# Bun's names, as --target takes them; the archive takes mise's.
readonly TARGETS=(linux-x64 linux-arm64 darwin-x64 darwin-arm64 windows-x64)

archive_name() {
  local target="$1"
  case "${target}" in
    darwin-*) printf 'macos-%s' "${target#darwin-}" ;;
    *) printf '%s' "${target}" ;;
  esac
}

build() {
  local target="$1" name folder program
  name="$(archive_name "${target}")"
  folder="${OUT}/${name}"
  program='constitution'
  case "${target}" in
    windows-*) program='constitution.exe' ;;
    *) ;;
  esac
  rm -rf "${folder}"
  bun build --compile --target="bun-${target}" "${ENTRY}" --outfile "${folder}/bin/${program}"
  tar -czf "${OUT}/constitution-${name}.tar.gz" -C "${folder}" bin
}

main() {
  local target
  # bunli loads its terminal library's native part for the platform it runs on, which a cross-built
  # program finds only when the install holds every platform's part, as by default it holds one.
  bun install --frozen-lockfile --ignore-scripts --os='*' --cpu='*'
  mkdir -p "${OUT}"
  if (($# == 0)); then
    set -- "${TARGETS[@]}"
  fi
  for target in "$@"; do
    build "${target}"
  done
}

main "$@"
