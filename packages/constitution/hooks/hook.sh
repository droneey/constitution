#!/usr/bin/env bash
# Hands Claude Code's event on stdin to `constitution hook <event>`, the program the project
# installs through mise. Without it the hook says so in one line and never fails the session.
[ -n "${CLAUDE_PLUGIN_ROOT:-}" ] || exit 0
if ! command -v constitution >/dev/null 2>&1; then
  printf '%s\n' 'constitution hook: the constitution program is not on PATH — pin it in mise.toml as https://github.com/droneey/constitution#-quick-start shows, then run mise install'
  exit 0
fi
exec constitution hook "$1"
