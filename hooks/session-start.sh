#!/usr/bin/env bash
set -euo pipefail

root="${CLAUDE_PLUGIN_ROOT:?}"
input="$(cat)"
cwd="$(printf '%s' "${input}" | sed -n 's/.*"cwd"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
project="${cwd:-${PWD}}/PROJECT.md"

[ -f "${project}" ] || exit 0

front_matter() {
  awk 'NR == 1 && $0 != "---" { exit } NR > 1 && $0 == "---" { exit } NR > 1 { print }' "${project}"
}

field() {
  front_matter | awk -v key="$1:" '$1 == key { $1 = ""; sub(/^ +/, ""); print; exit }'
}

pin="$(field constitution)"
assembly="$(field assembly)"
installed="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "${root}/package.json" | head -1)"

[ -n "${pin}" ] || exit 0

printf '# Constitution\n\n'
printf 'This repository is governed by the droneey constitution, installed as %s at %s.\n' "${installed}" "${root}"
if [ "${pin}" != "${installed}" ]; then
  printf 'PROJECT.md pins %s: pass a conformance check against the chapters that changed and bump the pin, or update the plugin.\n' "${pin}"
fi
printf '\n'
cat "${root}/blocks/core/intro.md"

if [ -z "${assembly}" ]; then
  printf '\nPROJECT.md maps applications to assemblies; read the map there, then the assembly under %s/assemblies.\n' "${root}"
  exit 0
fi

file="${root}/assemblies/${assembly}.yml"
if [ ! -f "${file}" ]; then
  printf '\nPROJECT.md names the assembly "%s", which the installed constitution does not have.\n' "${assembly}"
  exit 0
fi

printf '\n## Assembly %s\n\n' "${assembly}"
cat "${file}"
awk '/^blocks:/ { listing = 1; next } listing && /^  - / { sub(/^  - /, ""); print }' "${file}" | while IFS= read -r id; do
  printf '\n## Block %s\n\n' "${id}"
  cat "${root}/blocks/${id}/block.yml"
done
