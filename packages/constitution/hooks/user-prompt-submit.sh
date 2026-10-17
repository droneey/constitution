#!/usr/bin/env bash
# shellcheck source=lib/state.sh
. "${CLAUDE_PLUGIN_ROOT:-/dev/null}/hooks/lib/state.sh"

turn="$(fingerprint)"
record turn "${turn}"
exit 0
