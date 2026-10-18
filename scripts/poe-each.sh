#!/usr/bin/env bash
# Runs a poethepoet task in every Python package of the workspace, each by its own pyproject.toml,
# in the environment of the root's uv workspace: scripts/poe-each.sh lint:check
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly PACKAGES=(
  packages/python-check
  packages/mutation-check/languages/python
)

log() {
  printf '%s\n' "$*" >&2
}

main() {
  if (($# == 0)); then
    log 'Usage: scripts/poe-each.sh <task> [arguments]'
    exit 1
  fi

  local package
  for package in "${PACKAGES[@]}"; do
    uv run --locked --directory "$package" --project "$PWD" poe "$@"
  done
}

main "$@"
