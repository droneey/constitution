#!/usr/bin/env bash
. "${CLAUDE_PLUGIN_ROOT:-/dev/null}/hooks/lib/state.sh"

record turn "$(fingerprint)"
exit 0
