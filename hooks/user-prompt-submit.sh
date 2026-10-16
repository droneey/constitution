#!/usr/bin/env bash
. "${CLAUDE_PLUGIN_ROOT:-/dev/null}/hooks/lib/state.sh"

turn="$(fingerprint)"
record turn "${turn}"
exit 0
