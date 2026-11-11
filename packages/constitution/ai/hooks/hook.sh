#!/usr/bin/env bash
# Why: each hook runs the constitution executable that mise resolves in the folder of the call, so
# every repository and worktree is gated by the release it pins, and the one on PATH where mise is
# missing. Before an action, an executable that fails to start or crashes refuses the action, as a
# security check fails closed.
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

readonly GATED_EVENT='pre-tool-use'
# Why: Claude Code refuses a tool call whose PreToolUse hook ends with 2, and hands the agent the
# hook's standard error.
readonly REFUSED=2
# Why: no JSON parser is sure to be on the machine, so the folder is matched in the event's text; a
# folder whose name holds a quote or a backslash, which JSON escapes, is not matched, and the hook's
# own folder stands for it.
readonly FOLDER_PATTERN='"cwd"[[:space:]]*:[[:space:]]*"([^"\\]*)"'

log() {
  printf '%s\n' "$*" >&2
}

folder_of() {
  local event="$1"

  if [[ $event =~ $FOLDER_PATTERN ]] && [ -d "${BASH_REMATCH[1]}" ]; then
    printf '%s' "${BASH_REMATCH[1]}"
  else
    printf '%s' "$PWD"
  fi
}

main() {
  [ -n "${CLAUDE_PLUGIN_ROOT:-}" ] || exit 0

  local hook_event="$1"
  local runner
  local event
  local folder
  local status=0

  runner="$(dirname "${BASH_SOURCE[0]}")/run-constitution.sh"
  # Why: the event is read whole to find its folder and handed on unchanged; the closing dot keeps
  # the trailing newlines a command substitution drops.
  event="$(
    cat
    printf '.'
  )"
  event="${event%.}"
  folder="$(folder_of "$event")"

  # Why: a tool the folder pins and the machine lacks is not installed in the middle of a hook,
  # which would wait on the network past the hook's timeout; and mise puts what the folder pins
  # ahead of every folder already on PATH, where it would otherwise leave a folder put before its
  # own, such as a global link to another checkout.
  if command -v mise >/dev/null 2>&1; then
    MISE_EXEC_AUTO_INSTALL=false MISE_ACTIVATE_AGGRESSIVE=true mise exec --quiet --cd "$folder" -- \
      "$BASH" "$runner" "$hook_event" < <(printf '%s' "$event") || status=$?
  else
    "$BASH" "$runner" "$hook_event" < <(printf '%s' "$event") || status=$?
  fi

  if ((status != 0)) && [ "$hook_event" = "$GATED_EVENT" ]; then
    log "constitution hook: the executable ended with exit code $status, so the action is refused"
    exit "$REFUSED"
  fi

  exit "$status"
}

main "$@"
