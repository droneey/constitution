# Errors

> Governs a failure in a script: how the script stops on a failed command.

## Catching and carrying

### script-stops-on-a-failed-command → catch-handles-only-what-it-recognises · MUST

A Bash script runs under `set -euo pipefail`, and `shopt -s inherit_errexit` where its Bash is 4.4 or later, and a POSIX sh script under `set -eu`, with `-o pipefail` where its shells have it, set before its first command; a function called as a condition — of an `if`, a `while` or an and-or list — checks its commands' results itself.

| Why |
|---|
| by default the shell carries on after a failed command, a failed stage of a pipe or an unset variable, so the next command runs on a result that never came, as `rm -rf "$dir/"` does with an empty `dir`; errexit does not fire inside a function called as a condition. |
