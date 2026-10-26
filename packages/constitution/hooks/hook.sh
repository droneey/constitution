#!/usr/bin/env bash
# Hands Claude Code's event on stdin to `constitution hook <event>`, the executable the project
# installs through mise. Without it the hook says so in one line and never fails the session.
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi
[ -n "${CLAUDE_PLUGIN_ROOT:-}" ] || exit 0
if ! command -v constitution >/dev/null 2>&1; then
  printf '%s\n' 'constitution hook: the constitution executable is not on PATH — pin it in mise.toml as https://github.com/droneey/constitution#-quick-start shows, then run mise install'
  exit 0
fi
exec constitution hook "$1"
