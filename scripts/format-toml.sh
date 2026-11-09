#!/usr/bin/env bash
# Why: lefthook hands a job with a root its files as ./path, and tombi skips a file its
# tombi.toml excludes only when named without the ./.
set -euo pipefail
if ((BASH_VERSINFO[0] * 100 + BASH_VERSINFO[1] >= 404)); then
  shopt -s inherit_errexit
fi

main() {
  tombi format "${@#./}"
}

main "$@"
