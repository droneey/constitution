#!/usr/bin/env bash
# Why: hook.sh runs this in the environment mise resolved for the folder of the call, or in its own
# where mise is missing, so the constitution found here is the one that folder pins; without one it
# says so in one line and never fails the session.
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly MISSING='constitution hook: the constitution executable is not on PATH — pin it in mise.toml as https://github.com/droneey/constitution#-quick-start shows, then run mise install'

main() {
  if ! command -v constitution >/dev/null 2>&1; then
    printf '%s\n' "$MISSING"
    exit 0
  fi

  exec constitution hook "$1"
}

main "$@"
